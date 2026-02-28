import { useState, useRef, useEffect, useCallback } from "react";
import { API_BASE_URL } from "../../../service/endpoints";
import { baseURL } from "../../../service/axiosHelper";
import useModalStore from "../../../store/useModal";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Download,
  RotateCcw,
  Loader2,
} from "lucide-react";

type StreamVideoPayload = {
  file_id: number;
  file_name?: string;
};

const SPEEDS = [0.5, 1, 1.25, 1.5, 2];

function formatTime(s: number) {
  if (isNaN(s) || !isFinite(s)) return "00:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

const Video = () => {
  const { data } = useModalStore();
  const file = data as StreamVideoPayload | null;

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>(0);

  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [speedIdx, setSpeedIdx] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);

  /* ------------------ Auto Hide Controls ------------------ */

  const resetHideTimer = useCallback(() => {
    setControlsVisible(true);
    clearTimeout(hideTimer.current);
    // Only auto-hide when actively playing
    if (videoRef.current && !videoRef.current.paused) {
      hideTimer.current = setTimeout(() => setControlsVisible(false), 3000);
    }
  }, []);


  useEffect(() => {
    return () => clearTimeout(hideTimer.current);
  }, []);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  // FIX: Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Ignore when typing in an input
      if ((e.target as HTMLElement).tagName === "INPUT") return;
      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      } else if (e.code === "ArrowRight") {
        if (videoRef.current) videoRef.current.currentTime += 5;
      } else if (e.code === "ArrowLeft") {
        if (videoRef.current) videoRef.current.currentTime -= 5;
      } else if (e.code === "KeyM") {
        toggleMute();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  if (!file) return null;

  const videoUrl = `${baseURL}${API_BASE_URL}/files/${file.file_id}/view`;

  /* ------------------ Player Controls ------------------ */

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
    } else {
      v.pause();
    }
  };


  const handleMetadataLoaded = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
    setIsLoading(false);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const ratio = Math.max(
      0,
      Math.min(1, (e.clientX - rect.left) / rect.width),
    );
    videoRef.current.currentTime = ratio * duration;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) videoRef.current.volume = val;
    setMuted(val === 0);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const next = !muted;
    setMuted(next);
    videoRef.current.muted = next;
  };

  const cycleSpeed = () => {
    const next = (speedIdx + 1) % SPEEDS.length;
    setSpeedIdx(next);
    if (videoRef.current) videoRef.current.playbackRate = SPEEDS[next];
  };

  const restart = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
  };

  const handleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await containerRef.current?.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  };


  const handleDownload = async () => {
    try {
      const res = await fetch(videoUrl, { credentials: "include" });
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.file_name || `file_${file.file_id}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Video download error:", err);
    }
  };

  const handlePause = () => {
    setPlaying(false);
    clearTimeout(hideTimer.current);
    setControlsVisible(true);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;



  return (
    <div
      ref={containerRef}
      onMouseMove={resetHideTimer}
      className="relative bg-black flex flex-col text-white w-full h-full max-h-[90vh] rounded-lg overflow-hidden"
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-neutral-900">
        <div className="font-semibold text-sm uppercase tracking-wide truncate max-w-[300px]">
          {file.file_name || `file_${file.file_id}`}
        </div>

        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2 py-1 rounded">
          <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
          Video
        </div>
      </div>

      {/* Stage */}
      <div
        className="relative flex-1 bg-black flex items-center justify-center overflow-hidden"
        onClick={togglePlay}
      >

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <Loader2 size={40} className="text-amber-400 animate-spin" />
          </div>
        )}

        {hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/50 z-10">
            <span className="text-4xl">⚠</span>
            <p className="text-sm">Failed to load video</p>
          </div>
        )}

        <video
          ref={videoRef}
          src={videoUrl}
          crossOrigin="use-credentials"
          className="w-full h-full object-contain"
          onLoadedMetadata={handleMetadataLoaded}
          onTimeUpdate={() =>
            setCurrentTime(videoRef.current?.currentTime ?? 0)
          }
          onPlay={() => setPlaying(true)}
          onPause={handlePause}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
        />
      </div>

      {/* Controls */}
      {!hasError && (
        <div
          className={`bg-neutral-900 border-t border-white/10 transition-opacity duration-300 ${
            controlsVisible ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          {/* Progress */}
          <div
            ref={progressRef}
            onClick={handleProgressClick}
            className="h-1 bg-white/10 cursor-pointer"
          >
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-yellow-400"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center gap-3 px-4 py-3">
            <button
              onClick={togglePlay}
              className="w-9 h-9 rounded-lg border border-amber-400 bg-amber-400/10 text-amber-400 flex items-center justify-center"
            >
              {playing ? (
                <Pause size={16} />
              ) : (
                <Play size={16} className="ml-0.5" />
              )}
            </button>

            <button
              onClick={restart}
              className="text-white/50 hover:text-white"
            >
              <RotateCcw size={18} />
            </button>

            <div className="text-xs tracking-wider text-white/60">
              <span className="text-white">{formatTime(currentTime)}</span> /{" "}
              {formatTime(duration)}
            </div>

            <div className="flex-1" />

            <button
              onClick={cycleSpeed}
              className="text-xs text-white/60 hover:text-amber-400"
            >
              {SPEEDS[speedIdx]}×
            </button>

            <div className="flex items-center gap-2">
              <button onClick={toggleMute}>
                {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>

              <input
                type="range"
                min={0}
                max={1}
                step={0.02}
                value={muted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 accent-amber-400"
              />
            </div>

            <button onClick={handleFullscreen}>
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>

            {/* FIX: Use fetch+blob download instead of cross-origin <a download> */}
            <button
              onClick={handleDownload}
              className="text-white/70 hover:text-white"
            >
              <Download size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Video;
