"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

const COLORS = [
  { name: "White", value: "#ffffff" },
  { name: "Black", value: "#000000" },
  { name: "Pink", value: "#fdf2f8" },
  { name: "Blue", value: "#eff6ff" },
  { name: "Cream", value: "#fefce8" },
];

const THEMES = [
  { id: "minimal", name: "Minimal", desc: "Clean and simple" },
  { id: "wedding", name: "Wedding", desc: "Elegant floral" },
  { id: "birthday", name: "Birthday", desc: "Fun and festive" },
  { id: "corporate", name: "Corporate", desc: "Professional" },
];

export function FrameEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const layout = searchParams.get("layout") || "3";

  const [caption, setCaption] = useState("");
  const [frameColor, setFrameColor] = useState(COLORS[0].value);
  const [theme, setTheme] = useState(THEMES[0].id);

  const handleContinue = () => {
    const params = new URLSearchParams();
    params.set("layout", layout);
    params.set("caption", caption);
    params.set("bgColor", frameColor);
    params.set("theme", theme);
    // Photos already captured — go straight to result
    router.push(`/result?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-xl mx-auto">
      {/* Editor Panel */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-8">
        
        {/* Caption */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-zinc-300">Caption Text</label>
          <input
            type="text"
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all font-medium"
            placeholder="E.g., Jakarta, 2024"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            maxLength={30}
          />
        </div>

        {/* Frame Color */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-zinc-300">Frame Color</label>
          <div className="flex gap-3">
            {COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => setFrameColor(color.value)}
                className={`w-12 h-12 rounded-full border-2 transition-transform ${
                  frameColor === color.value
                    ? "border-pink-500 scale-110 shadow-[0_0_15px_rgba(236,72,153,0.5)]"
                    : "border-transparent hover:scale-105"
                }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
          </div>
        </div>

        {/* Theme */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-zinc-300">Theme Overlay</label>
          <div className="grid grid-cols-2 gap-3">
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  theme === t.id
                    ? "border-pink-500 bg-pink-500/10 text-pink-400"
                    : "border-zinc-800 bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                <div className="font-semibold text-sm">{t.name}</div>
                <div className="text-xs opacity-70 mt-1">{t.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <Button size="lg" onClick={handleContinue} className="w-full text-lg h-16 rounded-2xl bg-white text-zinc-950 hover:bg-zinc-200 shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_50px_rgba(255,255,255,0.3)]">
        Create Strip ✨
      </Button>
    </div>
  );
}
