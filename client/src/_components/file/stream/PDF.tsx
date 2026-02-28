import { useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { API_BASE_URL } from "../../../service/endpoints";
import { baseURL } from "../../../service/axiosHelper";
import useModalStore from "../../../store/useModal";
import {
  Download,
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useMemo } from "react";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

type StreamPdfPayload = {
  file_id: number;
  file_name?: string;
};

const PDF = () => {
  const { data } = useModalStore();

  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState(1);
  const [zoom, setZoom] = useState(1.2);
  const [rotation, setRotation] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const pdfOptions = useMemo(
    () => ({
      withCredentials: true,
    }),
    [],
  );

  useEffect(() => {
    if (!isLoading) {
      setTimeout(() => setRevealed(true), 50);
    }
  }, [isLoading]);

  if (!data) return null;

  const file = data as StreamPdfPayload;
  const pdfUrl = `${baseURL}${API_BASE_URL}/files/${file.file_id}/view`;

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
  };

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.2, 3));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.2, 0.6));
  const handleRotate = () => setRotation((r) => r + 90);

  const handleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await containerRef.current?.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col min-h-[82vh] bg-zinc-950 rounded-2xl overflow-hidden"
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div>
          <p className="text-white/80 italic font-light truncate max-w-xs">
            {file.file_name || `file_${file.file_id}`}
          </p>
          <p className="text-[10px] uppercase tracking-widest text-white/30">
            PDF Preview · Page {pageNumber} / {numPages || "--"}
          </p>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-auto bg-gradient-to-b from-black to-zinc-900">
        {isLoading && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 rounded-full border border-white/10 border-t-white/60 animate-spin" />
            <span className="text-[11px] uppercase tracking-widest text-white/30">
              Loading PDF
            </span>
          </div>
        )}

        {hasError && !isLoading && (
          <div className="flex flex-col items-center gap-3 text-red-400/70 uppercase text-xs tracking-widest">
            <X size={28} />
            <span>Failed to load PDF</span>
          </div>
        )}

        {!hasError && (
          <div
            className={`transition-all duration-500 ${
              revealed
                ? "opacity-100 scale-100 translate-y-0"
                : "opacity-0 scale-95 translate-y-2"
            }`}
          >
            <Document
              file={pdfUrl}
              options={pdfOptions}
              loading={null}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={() => {
                setIsLoading(false);
                setHasError(true);
              }}
            >
              <Page
                pageNumber={pageNumber}
                scale={zoom}
                rotate={rotation}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            </Document>
          </div>
        )}
      </div>

      {/* Toolbar */}
      {!isLoading && !hasError && (
        <div className="flex items-center justify-center gap-2 px-6 py-4 border-t border-white/10">
          <button
            onClick={() => setPageNumber((p) => Math.max(p - 1, 1))}
            className="viewer-btn"
          >
            <ChevronLeft size={15} />
          </button>

          <button
            onClick={() => setPageNumber((p) => Math.min(p + 1, numPages || 1))}
            className="viewer-btn"
          >
            <ChevronRight size={15} />
          </button>

          <div className="w-px h-6 bg-white/10 mx-3" />

          <button onClick={handleZoomOut} className="viewer-btn">
            <ZoomOut size={15} />
          </button>

          <span className="text-xs text-white/30 w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>

          <button onClick={handleZoomIn} className="viewer-btn">
            <ZoomIn size={15} />
          </button>

          <div className="w-px h-6 bg-white/10 mx-3" />

          <button onClick={handleRotate} className="viewer-btn">
            <RotateCw size={15} />
          </button>

          <button onClick={handleFullscreen} className="viewer-btn">
            <Maximize2 size={15} />
          </button>

          <div className="w-px h-6 bg-white/10 mx-3" />

          <a href={pdfUrl} download={file.file_name} className="viewer-btn">
            <Download size={15} />
          </a>
        </div>
      )}
    </div>
  );
};

export default PDF;
