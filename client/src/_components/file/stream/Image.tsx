import { useState, useRef, useEffect } from "react";
import { API_BASE_URL } from "../../../service/endpoints";
import { baseURL } from "../../../service/axiosHelper";
import useModalStore from "../../../store/useModal";
import { X, ZoomIn, ZoomOut, RotateCw, Maximize2 } from "lucide-react";

type StreamImagePayload = {
  file_id: number;
  file_name?: string;
};

const Image = () => {
  const { data } = useModalStore();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [, setIsFullscreen] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoading) {
      setTimeout(() => setRevealed(true), 50);
    }
  }, [isLoading]);

  if (!data) return null;

  const file = data as StreamImagePayload;
  const imageUrl = `${baseURL}${API_BASE_URL}/files/${file.file_id}/view`;

  const handleImageLoad = () => {
    setIsLoading(false);
    if (imgRef.current) {
      setImageDimensions({
        width: imgRef.current.naturalWidth,
        height: imgRef.current.naturalHeight,
      });
    }
  };

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 3));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.5));
  const handleRotate = () => setRotation((r) => r + 90);

  const handleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative  flex flex-col min-h-[82vh]  bg-zinc-950 rounded-2xl overflow-hidden"
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div>
          <p className="text-white/80 italic font-light truncate max-w-xs">
            {file.file_name || `file_${file.file_id}`}
          </p>
          <p className="text-[10px] uppercase tracking-widest text-white/30">
            Image Preview
          </p>
        </div>

        {imageDimensions.width > 0 && (
          <div className="text-[10px] tracking-wider text-white/30">
            {imageDimensions.width} × {imageDimensions.height}px
          </div>
        )}
      </div>

      {/* Canvas */}
      <div className="relative flex-1 flex items-center justify-center p-8 overflow-hidden bg-linear-to-b from-black to-zinc-900">
        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 rounded-full border border-white/10 border-t-white/60 animate-spin" />
            <span className="text-[11px] uppercase tracking-widest text-white/30">
              Loading
            </span>
          </div>
        )}

        {/* Error */}
        {hasError && !isLoading && (
          <div className="flex flex-col items-center gap-3 text-red-400/70 uppercase text-xs tracking-widest">
            <X size={28} />
            <span>Failed to load image</span>
          </div>
        )}

        {/* Image */}
        {!hasError && (
          <div
            className={`transition-all duration-500 ${
              revealed
                ? "opacity-100 scale-100 translate-y-0"
                : "opacity-0 scale-95 translate-y-2"
            }`}
            style={{ display: isLoading ? "none" : "block" }}
          >
            <img
              ref={imgRef}
              src={imageUrl}
              alt={file.file_name || "Image preview"}
              onLoad={handleImageLoad}
              draggable={false}
              onError={() => {
                setIsLoading(false);
                setHasError(true);
              }}
              className="max-w-full max-h-[60vh] rounded-lg shadow-[0_0_0_1px_rgba(255,255,255,0.07),0_24px_80px_rgba(0,0,0,0.8)] transition-transform duration-300"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
              }}
            />
          </div>
        )}
      </div>

      {/* Toolbar */}
      {!isLoading && !hasError && (
        <div className="flex items-center justify-center gap-2 px-6 py-4 border-t border-white/10">
          <button
            onClick={handleZoomOut}
            className="viewer-btn"
            title="Zoom out"
          >
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

          {/* <a href={imageUrl} download={file.file_name} className="viewer-btn">
            <Download size={15} />
          </a> */}
        </div>
      )}
    </div>
  );
};

export default Image;
