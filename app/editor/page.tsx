import { Suspense } from "react";
import { FrameEditor } from "@/components/FrameEditor";
import { Loader2 } from "lucide-react";

export default function EditorPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-6 text-zinc-50 selection:bg-pink-500/30">
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-2xl space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Style Your Strip</h1>
          <p className="text-zinc-400">Choose a theme, color, and caption for your photos</p>
        </div>

        <Suspense fallback={
          <div className="flex justify-center py-12 text-zinc-400">
            <Loader2 className="animate-spin mr-2" /> Loading editor...
          </div>
        }>
          <FrameEditor />
        </Suspense>
      </div>
    </main>
  );
}
