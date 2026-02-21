import { useRef, useEffect } from "react";

const StreamPlayer = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onLoadedMetadata = () => {
      console.log("Metadata loaded. Duration:", video.duration);
    };

    const onWaiting = () => {
      console.log("Buffering...");
    };

    const onPlaying = () => {
      console.log("Playing");
    };

    const onCanPlay = () => {
      console.log("Can play");
    };

    const onProgress = () => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        console.log("Buffered until:", bufferedEnd.toFixed(2), "seconds");
      }
    };

    const onError = (e: Event) => {
      console.error("Video error:", e);
    };

    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("playing", onPlaying);
    video.addEventListener("canplay", onCanPlay);
    video.addEventListener("progress", onProgress);
    video.addEventListener("error", onError);

    return () => {
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("progress", onProgress);
      video.removeEventListener("error", onError);
    };
  }, []);

  return (
    <div>
      <h2>ESBOX Stream Player</h2>

      <video
        ref={videoRef}
        src="http://localhost:8000/api/v1/files/stream/30"
        controls
        width="800"
        style={{ background: "black" }}
        preload="metadata"  // 🔥 better than auto for streaming
        playsInline
        controlsList="nodownload"
        // crossOrigin="use-credentials" // 🔥 important if different origin
      />
    </div>
  );
};

export default StreamPlayer;
