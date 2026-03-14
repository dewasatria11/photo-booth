"use client";

import { useEffect, useRef, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CameraPreview } from "@/components/CameraPreview";
import { FilterSelector, FILTERS } from "@/components/FilterSelector";
import { Countdown } from "@/components/Countdown";
import { Loader2, Camera } from "lucide-react";

function CameraContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const layoutCount = parseInt(searchParams.get("layout") || "3", 10);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [selectedFilter, setSelectedFilter] = useState(FILTERS[0].id);
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);

  const [isCounting, setIsCounting] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  // Initialize Camera
  useEffect(() => {
    let active = true;
    async function setupCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 1080 },
            height: { ideal: 1440 },
          },
          audio: false,
        });
        if (active) setStream(mediaStream);
        else mediaStream.getTracks().forEach((t) => t.stop());
      } catch (err: unknown) {
        console.log(err);
        if (active) setError("Camera permission denied or camera not found.");
      }
    }
    setupCamera();

    return () => {
      active = false;
    };
  }, []);

  // Cleanup stream when navigating away
  useEffect(() => {
    return () => {
      setStream((currentStream) => {
        if (currentStream) {
          currentStream.getTracks().forEach((track) => track.stop());
        }
        return null;
      });
    };
  }, []);

  const handleCapture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !stream) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Apply CSS filter to canvas context
    const filterDef = FILTERS.find((f) => f.id === selectedFilter);
    if (filterDef && filterDef.id !== "normal") {
      const filterMap: Record<string, string> = {
        bw: "grayscale(100%)",
        sepia: "sepia(100%)",
        vintage: "sepia(50%) hue-rotate(-30deg) contrast(125%)",
        bright: "brightness(125%) contrast(110%)",
        cool: "hue-rotate(15deg) saturate(150%) contrast(110%)",
        warm: "sepia(30%) hue-rotate(-15deg) saturate(150%)",
      };
      ctx.filter = filterMap[filterDef.id] || "none";
    }

    // Mirror the output to match the preview
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Reset transform and filter
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.filter = "none";

    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);

    setCapturedPhotos((prev) => [...prev, dataUrl]);

    setIsCapturing(true);
    setTimeout(() => setIsCapturing(false), 150);
  }, [selectedFilter, stream]);

  // Handle Capture Sequence
  useEffect(() => {
    if (capturedPhotos.length > 0 && capturedPhotos.length < layoutCount && !isCounting) {
      // Automatically trigger next countdown after a short pause
      const timeout = setTimeout(() => setIsCounting(true), 800);
      return () => clearTimeout(timeout);
    } else if (capturedPhotos.length === layoutCount) {
      // All photos done — save to sessionStorage then go to Editor
      sessionStorage.setItem("photobooth_images", JSON.stringify(capturedPhotos));

      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      // All photos done — go to result page (styling editor is embedded there)
      router.push(`/result?layout=${layoutCount}`);
    }
  }, [capturedPhotos, layoutCount, isCounting, router, stream]);

  const startSequence = () => {
    if (capturedPhotos.length === 0) {
      setIsCounting(true);
    }
  };

  const currentFilterClass = FILTERS.find((f) => f.id === selectedFilter)?.className || "";

  return (
    <main className="flex flex-col h-[100dvh] bg-black text-white overflow-hidden">
      {/* Hidden canvas for capturing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Header */}
      <div className="flex items-center justify-between p-4 z-10 w-full max-w-md mx-auto">
        <div className="text-zinc-400 font-medium">
          Photo {Math.min(capturedPhotos.length + 1, layoutCount)}
          <span className="opacity-50"> / {layoutCount}</span>
        </div>
        <div className="flex gap-2">
          {Array.from({ length: layoutCount }).map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full border-2 transition-all ${
                i < capturedPhotos.length
                  ? "bg-pink-500 border-pink-500"
                  : "border-zinc-600"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 relative flex flex-col items-center justify-center p-4 max-w-md mx-auto w-full">
        <CameraPreview
          ref={videoRef}
          stream={stream}
          filterClass={currentFilterClass}
          isCapturing={isCapturing}
          error={error}
        />

        <Countdown
          isActive={isCounting}
          onComplete={() => {
            setIsCounting(false);
            handleCapture();
          }}
        />
      </div>

      {/* Controls */}
      <div className="p-4 pb-8 space-y-6 max-w-md mx-auto w-full bg-gradient-to-t from-black via-black to-transparent">
        <FilterSelector selectedFilter={selectedFilter} onSelectFilter={setSelectedFilter} />

        <div className="flex justify-center">
          <button
            onClick={startSequence}
            disabled={isCounting || capturedPhotos.length >= layoutCount || !stream}
            className="w-20 h-20 rounded-full border-4 border-white/30 flex items-center justify-center disabled:opacity-50 transition-transform active:scale-95"
            aria-label="Capture photo"
          >
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.4)]">
              {isCounting ? (
                <div className="w-6 h-6 bg-pink-500 rounded-sm animate-pulse" />
              ) : (
                <Camera className="w-8 h-8 text-black" />
              )}
            </div>
          </button>
        </div>
      </div>
    </main>
  );
}

export default function CameraPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-black text-white">
          <Loader2 className="animate-spin mr-2" /> Loading camera...
        </div>
      }
    >
      <CameraContent />
    </Suspense>
  );
}
