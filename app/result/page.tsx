"use client";

import { useEffect, useState, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PhotoCanvas } from "@/components/PhotoCanvas";
import { Button } from "@/components/ui/button";
import { Download, Share2, RefreshCcw, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

// ─── Constants ────────────────────────────────────────────────────────────────

/** Quick-access preset colors shown as chips next to the picker */
const PRESET_COLORS = [
  "#ffffff", "#1a1a1a", "#fdf2f8", "#eff6ff", "#fefce8", "#f0fdf4",
  "#ffe4e6", "#fef9c3", "#dbeafe", "#f3e8ff",
];

const THEMES = [
  { id: "minimal",   name: "Minimal",   emoji: "◻️" },
  { id: "cute",      name: "Cute",      emoji: "🌸" },
  { id: "retro",     name: "Retro",     emoji: "📽️" },
  { id: "birthday",  name: "Birthday",  emoji: "🎉" },
  { id: "wedding",   name: "Wedding",   emoji: "💍" },
  { id: "corporate", name: "Corporate", emoji: "💼" },
];

// ─── Main Component ───────────────────────────────────────────────────────────

function ResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const layout = parseInt(searchParams.get("layout") || "3", 10);

  const [photos, setPhotos]           = useState<string[]>([]);
  const [finalImage, setFinalImage]   = useState<string | null>(null);

  // Editing state — user can change these live
  const [caption,    setCaption]    = useState(searchParams.get("caption")  || "");
  const [bgColor,    setBgColor]    = useState(searchParams.get("bgColor")  || "#ffffff");
  const [theme,      setTheme]      = useState(searchParams.get("theme")    || "minimal");

  // Share state
  const [phoneNumber,  setPhoneNumber]  = useState("");
  const [isSharing,    setIsSharing]    = useState(false);
  const [shareStatus,  setShareStatus]  = useState("");

  useEffect(() => {
    const stored = sessionStorage.getItem("photobooth_images");
    if (stored) {
      try { setPhotos(JSON.parse(stored)); }
      catch (e) { console.error("Failed to parse photos", e); }
    } else {
      router.push("/");
    }
  }, [router]);

  // Stable callback so PhotoCanvas doesn't re-render infinitely
  const handleRendered = useCallback((url: string) => setFinalImage(url), []);

  const handleDownload = () => {
    if (!finalImage) return;
    const a = document.createElement("a");
    a.href = finalImage;
    a.download = `photobooth-${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleShareWhatsApp = async () => {
    if (!finalImage) return;
    if (!phoneNumber) { setShareStatus("Masukkan nomor HP terlebih dahulu."); return; }

    let cleanPhone = phoneNumber.replace(/[^0-9]/g, "");
    if (cleanPhone.startsWith("0")) cleanPhone = "62" + cleanPhone.slice(1);
    if (cleanPhone.length < 10) { setShareStatus("Format nomor tidak valid."); return; }

    setIsSharing(true);
    setShareStatus("Mengupload foto...");

    try {
      if (!supabase) throw new Error("Supabase belum dikonfigurasi.");
      const res  = await fetch(finalImage);
      const blob = await res.blob();
      const fileName = `pb-${Date.now()}.jpg`;

      const { error } = await supabase.storage
        .from("photobooth")
        .upload(fileName, blob, { contentType: "image/jpeg", upsert: false });
      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from("photobooth").getPublicUrl(fileName);

      setShareStatus("Membuka WhatsApp...");
      const text   = encodeURIComponent(`Foto photobooth kamu: ${publicUrl}`);
      window.open(`https://wa.me/${cleanPhone}?text=${text}`, "_blank");
      setShareStatus("Berhasil!");
    } catch (err: unknown) {
      setShareStatus("Gagal: " + ((err as Error).message || ""));
    } finally {
      setIsSharing(false);
    }
  };

  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-pink-500" />
        <p className="text-zinc-400">Memuat foto...</p>
      </div>
    );
  }

  return (
    <div className="relative z-10 w-full max-w-6xl flex flex-col lg:flex-row gap-10 items-start justify-center">

      {/* ── Left: Strip Preview ─────────────────────────────────────────── */}
      <div className="flex-shrink-0 w-full max-w-[200px] mx-auto lg:mx-0 lg:sticky lg:top-10">
        <PhotoCanvas
          key={`${bgColor}-${theme}-${caption}`}
          photos={photos}
          layout={layout}
          caption={caption}
          bgColor={bgColor}
          theme={theme}
          onRendered={handleRendered}
        />
      </div>

      {/* ── Right: Editor + Actions ──────────────────────────────────────── */}
      <div className="flex-1 w-full space-y-6">

        {/* Heading */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Photos are Ready! 🎞️</h1>
          <p className="text-zinc-400 mt-1 text-sm">Sesuaikan strip kamu, lalu download atau bagikan.</p>
        </div>

        {/* ── Style Editor ────────────────────────────────────────────────── */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 space-y-6 backdrop-blur-sm shadow-xl">

          {/* Caption */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Caption</label>
            <input
              type="text"
              maxLength={30}
              placeholder="Contoh: Jakarta, 2024"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all font-medium"
            />
          </div>

          {/* Background Color */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Warna Background</label>
            {/* Color picker + presets */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Free color picker */}
              <label
                title="Pilih warna bebas"
                className="relative w-10 h-10 rounded-full border-2 border-zinc-600 overflow-hidden cursor-pointer hover:scale-105 transition-all flex-shrink-0 shadow-inner"
                style={{ backgroundColor: bgColor }}
              >
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                />
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold pointer-events-none" style={{ color: bgColor === '#ffffff' || bgColor === '#fdf2f8' || bgColor === '#eff6ff' || bgColor === '#fefce8' || bgColor === '#f0fdf4' || bgColor === '#ffe4e6' || bgColor === '#fef9c3' || bgColor === '#dbeafe' || bgColor === '#f3e8ff' ? '#666' : '#fff' }}>🎨</span>
              </label>
              {/* Quick presets */}
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setBgColor(c)}
                  title={c}
                  className={`w-8 h-8 rounded-full border-2 transition-all flex-shrink-0 ${
                    bgColor === c
                      ? "border-pink-500 scale-110 shadow-[0_0_10px_rgba(236,72,153,0.5)]"
                      : "border-zinc-700 hover:scale-105"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <p className="text-xs text-zinc-500">Klik 🎨 untuk pilih warna bebas</p>
          </div>

          {/* Theme */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Tema</label>
            <div className="grid grid-cols-3 gap-2">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`p-3 rounded-xl border text-center text-sm transition-all ${
                    theme === t.id
                      ? "border-pink-500 bg-pink-500/10 text-pink-400"
                      : "border-zinc-800 bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-white"
                  }`}
                >
                  <div className="text-xl">{t.emoji}</div>
                  <div className="font-medium mt-1 text-xs">{t.name}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Download ──────────────────────────────────────────────────────── */}
        <Button
          size="lg"
          className="w-full text-lg h-14 rounded-2xl bg-white text-zinc-950 hover:bg-zinc-200 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_50px_rgba(255,255,255,0.3)]"
          onClick={handleDownload}
          disabled={!finalImage}
        >
          <Download className="mr-2 h-5 w-5" />
          Download Strip
        </Button>

        {/* ── Share via WhatsApp ─────────────────────────────────────────── */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-3 backdrop-blur-sm">
          <label className="text-sm font-medium text-zinc-300">Bagikan via WhatsApp</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">+</span>
              <input
                type="tel"
                placeholder="628123456789"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-7 pr-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
              />
            </div>
            <Button
              onClick={handleShareWhatsApp}
              disabled={isSharing || !finalImage || !phoneNumber}
              className="bg-green-600 hover:bg-green-700 text-white px-5 rounded-xl flex items-center gap-2 min-w-[100px]"
            >
              {isSharing
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <><Share2 className="w-4 h-4" /> Share</>}
            </Button>
          </div>
          {shareStatus && (
            <p className={`text-sm font-medium ${shareStatus.startsWith("Gagal") ? "text-red-400" : "text-green-400"}`}>
              {shareStatus}
            </p>
          )}
        </div>

        {/* ── Start Over ─────────────────────────────────────────────────── */}
        <Button
          variant="ghost"
          className="w-full text-zinc-500 hover:text-white"
          onClick={() => {
            sessionStorage.removeItem("photobooth_images");
            router.push("/");
          }}
        >
          <RefreshCcw className="mr-2 h-4 w-4" /> Mulai Lagi
        </Button>
      </div>
    </div>
  );
}

export default function ResultPage() {
  return (
    <main className="flex min-h-screen items-start justify-center bg-zinc-950 p-6 pt-10 text-zinc-50 selection:bg-pink-500/30">
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
      <Suspense fallback={
        <div className="text-zinc-400 flex items-center gap-2 mt-20">
          <Loader2 className="animate-spin" /> Loading...
        </div>
      }>
        <ResultContent />
      </Suspense>
    </main>
  );
}
