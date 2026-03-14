import { ForwardedRef, forwardRef, useEffect } from "react";
import { CameraOff } from "lucide-react";

interface CameraPreviewProps {
  stream: MediaStream | null;
  filterClass: string;
  isCapturing: boolean;
  error: string | null;
}

export const CameraPreview = forwardRef(
  (
    { stream, filterClass, isCapturing, error }: CameraPreviewProps,
    ref: ForwardedRef<HTMLVideoElement>
  ) => {
    useEffect(() => {
      if (ref && "current" in ref && ref.current && stream) {
        ref.current.srcObject = stream;
      }
    }, [stream, ref]);

    return (
      <div className="relative w-full aspect-[3/4] max-h-[70vh] bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl border border-zinc-800 flex items-center justify-center">
        {error ? (
          <div className="flex flex-col items-center text-zinc-500 space-y-4">
            <CameraOff className="w-12 h-12" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        ) : stream ? (
          <video
            ref={ref}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover transition-all duration-300 ${filterClass}`}
            style={{ transform: "scaleX(-1)" }} // Mirror effect
          />
        ) : (
          <div className="animate-pulse flex flex-col items-center text-zinc-600">
            <div className="w-8 h-8 border-4 border-zinc-700 border-t-zinc-500 rounded-full animate-spin mb-4" />
            <p className="text-sm font-medium">Starting camera...</p>
          </div>
        )}

        {/* Flash overlay during capture */}
        <div
          className={`absolute inset-0 bg-white transition-opacity duration-100 ${
            isCapturing ? "opacity-100 z-50" : "opacity-0 pointer-events-none"
          }`}
        />
      </div>
    );
  }
);
CameraPreview.displayName = "CameraPreview";
