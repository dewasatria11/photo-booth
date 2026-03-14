"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

interface PhotoCanvasProps {
  photos: string[];
  layout: number;
  caption: string;
  bgColor: string;
  theme: string;
  onRendered: (dataUrl: string) => void;
}

export function PhotoCanvas({
  photos,
  layout,
  caption,
  bgColor,
  theme,
  onRendered,
}: PhotoCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRendering, setIsRendering] = useState(true);

  useEffect(() => {
    setIsRendering(true);

    async function renderCanvas() {
      if (!canvasRef.current || photos.length === 0) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // ─── Strip Dimensions ─────────────────────────────────────────────────
      const STRIP_WIDTH = 600;
      const PADDING     = 20;   // left/right & bottom padding
      const GAP         = 16;   // gap between photos
      const CAPTION_H   = caption ? 100 : 0; // top caption area (0 if no caption)

      const photoW = STRIP_WIDTH - PADDING * 2;
      const photoH = Math.round((photoW * 3) / 4);   // 4:3 aspect ratio

      const numPhotos   = Math.min(photos.length, layout);
      const totalPhotoH = photoH * numPhotos + GAP * (numPhotos - 1);

      // Height: caption on top → photos → bottom padding
      const STRIP_HEIGHT = CAPTION_H + totalPhotoH + PADDING;

      canvas.width  = STRIP_WIDTH;
      canvas.height = STRIP_HEIGHT;

      // ─── Background ───────────────────────────────────────────────────────
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, STRIP_WIDTH, STRIP_HEIGHT);

      // ─── Theme Decoration ────────────────────────────────────────────────
      applyTheme(ctx, theme, STRIP_WIDTH, STRIP_HEIGHT);

      // ─── Caption at TOP ───────────────────────────────────────────────────
      if (caption) {
        // Wait for Google font to be ready
        try {
          await document.fonts.load('400 52px "Pacifico"');
        } catch { /* fallback to system font */ }

        const textColor = getContrastColor(bgColor);
        ctx.textAlign    = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle    = textColor;
        ctx.font         = '400 52px "Pacifico", cursive';
        ctx.fillText(caption, STRIP_WIDTH / 2, CAPTION_H / 2, STRIP_WIDTH - PADDING * 2);
      }

      // ─── Load & Draw Photos ───────────────────────────────────────────────
      const loadImages = photos.slice(0, numPhotos).map(
        (src) =>
          new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload  = () => resolve(img);
            img.onerror = reject;
            img.src = src;
          })
      );

      try {
        const loadedImages = await Promise.all(loadImages);
        let yOffset = CAPTION_H; // photos start right after caption area

        for (const img of loadedImages) {
          const x = PADDING;
          const y = yOffset;
          const w = photoW;
          const h = photoH;

          // Shadow
          ctx.save();
          ctx.shadowColor   = "rgba(0,0,0,0.20)";
          ctx.shadowBlur    = 10;
          ctx.shadowOffsetY = 4;
          ctx.fillStyle     = bgColor;
          ctx.fillRect(x, y, w, h);
          ctx.restore();

          // Image (cover crop)
          ctx.save();
          ctx.beginPath();
          ctx.rect(x, y, w, h);
          ctx.clip();

          const imgAspect = img.width / img.height;
          const boxAspect = w / h;
          let sx = 0, sy = 0, sWidth = img.width, sHeight = img.height;
          if (imgAspect > boxAspect) {
            sWidth = img.height * boxAspect;
            sx = (img.width - sWidth) / 2;
          } else {
            sHeight = img.width / boxAspect;
            sy = (img.height - sHeight) / 2;
          }
          ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, w, h);
          ctx.restore();

          yOffset += h + GAP;
        }
      } catch (e) {
        console.error("Failed to load images", e);
      }

      const resultDataUrl = canvas.toDataURL("image/jpeg", 0.92);
      onRendered(resultDataUrl);
      setIsRendering(false);
    }

    renderCanvas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photos, layout, caption, bgColor, theme]);

  // ─── Theme Helper ──────────────────────────────────────────────────────────
  function applyTheme(
    ctx: CanvasRenderingContext2D,
    theme: string,
    W: number,
    H: number
  ) {
    if (theme === "wedding") {
      // Elegant gold border
      ctx.strokeStyle = "#d4af37";
      ctx.lineWidth   = 6;
      ctx.strokeRect(8, 8, W - 16, H - 16);
      // Corner roses (simple circles)
      const corners = [[20, 20], [W - 20, 20], [20, H - 20], [W - 20, H - 20]];
      for (const [cx, cy] of corners) {
        ctx.beginPath();
        ctx.fillStyle = "#d4af3740";
        ctx.arc(cx, cy, 14, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (theme === "birthday") {
      // Confetti
      const colors = ["#ff007f", "#ffea00", "#00d2ff", "#ff6b35", "#a855f7"];
      for (let i = 0; i < 60; i++) {
        ctx.beginPath();
        ctx.fillStyle = colors[i % colors.length] + "cc";
        ctx.save();
        ctx.translate(Math.random() * W, Math.random() * H);
        ctx.rotate(Math.random() * Math.PI * 2);
        ctx.fillRect(-5, -2, 10, 4);
        ctx.restore();
      }
    } else if (theme === "corporate") {
      // Navy accent bars
      ctx.fillStyle = "#1e3a8a";
      ctx.fillRect(0, 0, W, 10);
      ctx.fillRect(0, H - 10, W, 10);
    } else if (theme === "cute") {
      // Pastel hearts & stars scattered around
      const symbols = ["♥", "★", "✿", "♡", "✦"];
      const pastel   = ["#ff9eb5", "#ffcf77", "#a8edea", "#d7b4f3", "#fdffb6"];
      for (let i = 0; i < 30; i++) {
        ctx.font      = `${Math.random() * 18 + 10}px serif`;
        ctx.fillStyle = pastel[i % pastel.length];
        ctx.fillText(
          symbols[i % symbols.length],
          Math.random() * W,
          Math.random() * H
        );
      }
      // Little dashed border
      ctx.strokeStyle = "#ff9eb5";
      ctx.lineWidth   = 4;
      ctx.setLineDash([10, 8]);
      ctx.strokeRect(8, 8, W - 16, H - 16);
      ctx.setLineDash([]);
    } else if (theme === "retro") {
      // Vintage film grain texture overlay + sepia-toned border
      ctx.strokeStyle = "#c49a3c";
      ctx.lineWidth   = 8;
      ctx.strokeRect(6, 6, W - 12, H - 12);
      ctx.strokeStyle = "#c49a3c";
      ctx.lineWidth   = 2;
      ctx.strokeRect(14, 14, W - 28, H - 28);
      // Film sprocket holes on left & right
      const holeH = 18, holeW = 12, holeGap = 30;
      for (let y = 40; y < H - 30; y += holeGap) {
        ctx.fillStyle = "rgba(0,0,0,0.35)";
        ctx.beginPath(); ctx.roundRect(2, y, holeW, holeH, 3); ctx.fill();
        ctx.beginPath(); ctx.roundRect(W - holeW - 2, y, holeW, holeH, 3); ctx.fill();
      }
    }
  }

  function getContrastColor(hexcolor: string) {
    let hex = hexcolor.replace("#", "");
    if (hex.length === 3) hex = hex.split("").map((x) => x + x).join("");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? "#000000" : "#ffffff";
  }

  return (
    <div className="relative w-full max-w-[200px] mx-auto rounded-lg overflow-hidden shadow-2xl border border-zinc-700">
      <canvas ref={canvasRef} className="w-full h-auto block" />
      {isRendering && (
        <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
          <p className="text-pink-100 text-xs font-medium">Developing…</p>
        </div>
      )}
    </div>
  );
}
