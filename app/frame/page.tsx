import { LayoutPanelTop, Grid2X2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const LAYOUTS = [
  { id: "2", name: "2 Photos", icon: LayoutPanelTop, desc: "Classic Duo" },
  { id: "3", name: "3 Photos", icon: LayoutPanelTop, desc: "Triple Threat" },
  { id: "4", name: "4 Photos", icon: Grid2X2, desc: "Grid Layout" },
];

export default function FrameSelectionPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-6 text-zinc-50">
      <div className="w-full max-w-2xl space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Choose Format</h1>
          <p className="text-zinc-400">Select the number of photos for your strip</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {LAYOUTS.map((layout) => (
            <Link key={layout.id} href={`/camera?layout=${layout.id}`} className="block">
              <div className="group relative flex flex-col items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all hover:bg-zinc-800 hover:border-zinc-700 hover:shadow-2xl">
                <div className="rounded-xl bg-zinc-800 p-4 transition-transform group-hover:scale-110 group-hover:bg-pink-500/10 group-hover:text-pink-400">
                  <layout.icon className="w-8 h-8" />
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-lg">{layout.name}</h3>
                  <p className="text-sm text-zinc-400">{layout.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="pt-8 text-center">
          <Link href="/">
            <Button variant="ghost" className="text-zinc-400 hover:text-white">
              Back to Start
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
