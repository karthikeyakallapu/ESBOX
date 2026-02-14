import { useState } from "react";
import apiService from "../service/apiService";
import type { AxiosProgressEvent } from "axios";
import { mutate } from "swr";
import Toast from "../utils/Toast";
import useModalStore from "../store/useModal";

interface UseFileUploadProps {
  parent_id: number | string | null;
}

const useFileUpload = ({ parent_id }: UseFileUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");

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

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setUploadStatus("idle");
    setUploadProgress(0);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploadStatus("uploading");
      setUploadProgress(0);

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("name", selectedFile.name);
      formData.append("parent_id", String(parent_id ?? ""));

      const response = await apiService.uploadFile(
        formData,
        (progressEvent: AxiosProgressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1),
          );
          setUploadProgress(percent);
        },
      );

      mutate(parent_id ? `sub_folder_${parent_id}` : "files-and-folders");

      Toast({
        type: "success",
        message: response.message,
      });

      setUploadStatus("success");
    } catch (error) {
      console.error(error);
      Toast({
        type: "error",
        message: error instanceof Error ? error.message : "File upload failed",
      });
      setUploadStatus("error");
    } finally {
      setSelectedFile(null);
      setUploadProgress(0);
      useModalStore.getState().closeModal();
    }
  };

  return {
    dragActive,
    selectedFile,
    uploadProgress,
    uploadStatus,
    handleDrag,
    handleDrop,
    handleFileSelect,
    handleRemove,
    handleUpload,
  };
};

export default useFileUpload;
