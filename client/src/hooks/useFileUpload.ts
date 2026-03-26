import { useState, useRef, useCallback } from "react";
import apiService from "../service/apiService";
import { baseURL } from "../service/axiosHelper";
import { ENDPOINTS } from "../service/endpoints";
import { mutate } from "swr";
import Toast from "../utils/Toast";
import useModalStore from "../store/useModal";

interface UseFileUploadProps {
  parent_id: number | string | null;
}

type UploadStage =
  | "idle"
  | "hashing"
  | "initializing"
  | "uploading"
  | "completing"
  | "processing"
  | "success"
  | "error";

const CONCURRENCY = 4;
const MAX_RETRIES = 3;

// ── SHA-256 via Web Crypto API ────────────────────────────────

async function computeSHA256(file: File): Promise<string> {
  const chunkSize = 2 * 1024 * 1024;
  const chunks = Math.ceil(file.size / chunkSize);
  const hashParts: ArrayBuffer[] = [];

  for (let i = 0; i < chunks; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, file.size);
    const blob = file.slice(start, end);
    const buffer = await blob.arrayBuffer();
    hashParts.push(buffer);
  }

  // Concatenate all parts into one buffer for final digest
  const totalLen = hashParts.reduce((s, b) => s + b.byteLength, 0);
  const combined = new Uint8Array(totalLen);
  let offset = 0;
  for (const part of hashParts) {
    combined.set(new Uint8Array(part), offset);
    offset += part.byteLength;
  }

  const digest = await crypto.subtle.digest("SHA-256", combined);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const useFileUpload = ({ parent_id }: UseFileUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStage, setUploadStage] = useState<UploadStage>("idle");
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const abortRef = useRef(false);

  // ── Drag & drop / file select ──────────────────────────────

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setUploadStage("idle");
    setProgress(0);
    setStatusMessage("");
    abortRef.current = false;
  };

  // ── Chunk upload with concurrency + retries ────────────────

  async function uploadChunks(
    file: File,
    uploadId: string,
    totalChunks: number,
    chunkSize: number,
  ) {
    let pointer = 0;
    let uploaded = 0;

    const chunks: { index: number; blob: Blob }[] = [];
    for (let i = 0; i < file.size; i += chunkSize) {
      chunks.push({
        index: Math.floor(i / chunkSize),
        blob: file.slice(i, i + chunkSize),
      });
    }

    async function uploadOne(chunk: { index: number; blob: Blob }) {
      const formData = new FormData();
      formData.append("upload_id", uploadId);
      formData.append("chunk_index", String(chunk.index));
      formData.append("chunk_size", String(chunk.blob.size));
      formData.append("file", chunk.blob);

      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        if (abortRef.current) return;
        try {
          await apiService.uploadChunk(formData);
          return;
        } catch (err) {
          if (attempt === MAX_RETRIES - 1) throw err;
          // exponential backoff
          await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
        }
      }
    }

    async function worker() {
      while (pointer < chunks.length) {
        if (abortRef.current) return;
        const idx = pointer++;
        const chunk = chunks[idx];
        await uploadOne(chunk);
        uploaded++;
        setProgress(Math.round((uploaded / totalChunks) * 100));
        setStatusMessage(`Uploading chunk ${uploaded}/${totalChunks}`);
      }
    }

    await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));
  }

  // ── SSE progress stream ────────────────────────────────────

  function listenProgress(uploadId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const url = `${baseURL}${ENDPOINTS.UPLOAD_PROGRESS(uploadId)}`;
      const evtSource = new EventSource(url, { withCredentials: true });

      const cleanup = () => evtSource.close();

      evtSource.onmessage = (event) => {
        if (abortRef.current) { cleanup(); resolve(); return; }

        try {
          const data = JSON.parse(event.data) as {
            status: string;
            progress: number;
            message: string;
            file?: Record<string, unknown>;
          };

          setProgress(data.progress);
          setStatusMessage(data.message);

          if (data.status === "completed") {
            cleanup();
            resolve();
          } else if (data.status === "failed" || data.status === "expired") {
            cleanup();
            reject(new Error(data.message || "Processing failed"));
          }
        } catch {
          // ignore malformed frames
        }
      };

      evtSource.onerror = () => {
        cleanup();
        reject(new Error("Lost connection to upload progress stream"));
      };
    });
  }

  // ── Main upload flow ───────────────────────────────────────

  const handleUpload = useCallback(async () => {
    if (!selectedFile) return;
    abortRef.current = false;

    try {
      // 1. Hash
      setUploadStage("hashing");
      setProgress(0);
      setStatusMessage("Computing file hash…");
      const contentHash = await computeSHA256(selectedFile);

      // 2. Init — server decides chunk_size & total_chunks
      setUploadStage("initializing");
      setStatusMessage("Initialising upload…");
      const { upload_id, chunk_size, total_chunks } = await apiService.uploadInit({
        file_name: selectedFile.name,
        file_size: selectedFile.size,
        mime_type: selectedFile.type || "application/octet-stream",
        content_hash: contentHash,
        parent_id: parent_id,
      });

      // 3. Upload chunks
      setUploadStage("uploading");
      setProgress(0);
      await uploadChunks(selectedFile, upload_id, total_chunks, chunk_size);

      if (abortRef.current) return;

      // 4. Complete
      setUploadStage("completing");
      setProgress(100);
      setStatusMessage("Finalising upload…");
      await apiService.uploadComplete(upload_id);

      // 5. Stream background processing progress via SSE
      setUploadStage("processing");
      setProgress(0);
      setStatusMessage("Processing file…");
      await listenProgress(upload_id);

      // 6. Done
      setUploadStage("success");
      setProgress(100);
      setStatusMessage("Upload complete!");

      mutate(parent_id ? `sub_folder_${parent_id}` : "files-and-folders");

      Toast({ type: "success", message: "File uploaded successfully" });
      useModalStore.getState().closeModal();
    } catch (error) {
      console.error(error);
      setUploadStage("error");
      Toast({
        type: "error",
        message:
          error instanceof Error ? error.message : "File upload failed",
      });
    }
  }, [selectedFile, parent_id]);

  // Backwards-compatible alias
  const uploadStatus: "idle" | "uploading" | "success" | "error" =
    uploadStage === "success"
      ? "success"
      : uploadStage === "error"
        ? "error"
        : uploadStage === "idle"
          ? "idle"
          : "uploading";

  return {
    dragActive,
    selectedFile,
    uploadStatus,
    uploadStage,
    progress,
    statusMessage,
    handleDrag,
    handleDrop,
    handleFileSelect,
    handleRemove,
    handleUpload,
  };
};

export default useFileUpload;
