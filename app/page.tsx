import Link from "next/link";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-6 text-zinc-50 selection:bg-pink-500/30">
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>
      
      <div className="relative z-10 flex flex-col items-center text-center space-y-8 max-w-lg w-full">
        {/* Animated Camera Icon */}
        <div className="relative">
          <div className="absolute inset-0 animate-ping rounded-full bg-pink-500/20"></div>
          <div className="relative rounded-full bg-zinc-900 border border-zinc-800 p-6 shadow-2xl">
            <Camera className="w-16 h-16 text-pink-400" strokeWidth={1.5} />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-br from-white to-white/50 bg-clip-text text-transparent">
            Web Photobooth
          </h1>
          <p className="text-zinc-400 text-lg md:text-xl font-medium">
            Capture your moments, style them, and share instantly.
          </p>
        </div>

        {/* Start Button */}
        <div className="pt-8 w-full">
          <Link href="/frame" className="w-full block">
            <Button size="lg" className="w-full text-lg h-16 rounded-2xl bg-white text-zinc-950 hover:bg-zinc-200 transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(255,255,255,0.4)]">
              Start Photobooth
            </Button>
          </Link>
        </div>

        {/* Footer info */}
        <div className="pt-12 text-sm text-zinc-600 font-medium tracking-wide items-center flex gap-2 justify-center">
           Ready in 3 steps
        </div>
      </div>
    </main>
  );
}
