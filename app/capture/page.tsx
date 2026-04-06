"use client";

import Link from "next/link";
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../components/AuthProvider";

export default function CapturePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<"camera" | "search">("camera");
  const [query, setQuery] = useState("");
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [capturing, setCapturing] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (mode !== "camera") return;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 960 } },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setCameraReady(true);
        }
      } catch (err) {
        console.error("Camera error:", err);
        setCameraError("Camera access needed. Please allow it in your browser settings.");
      }
    }

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      setCameraReady(false);
    };
  }, [mode]);

  const handleCapture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || capturing) return;

    setCapturing(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);

    const base64 = canvas.toDataURL("image/jpeg", 0.8).split(",")[1];

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    sessionStorage.setItem("gimme-capture", base64);
    router.push("/identified");
  }, [capturing, router]);

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setCapturing(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(",")[1];
      sessionStorage.setItem("gimme-capture", base64);
      router.push("/identified");
    };
    reader.readAsDataURL(file);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      sessionStorage.setItem("gimme-search-query", query.trim());
      sessionStorage.removeItem("gimme-capture");
      router.push("/identified?q=" + encodeURIComponent(query));
    }
  }

  return (
    <main className="flex min-h-screen flex-col" style={{ background: "#0A0A0A" }}>
      {/* Hidden canvas for capturing frames */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4">
        <Link href="/home" className="transition-colors" style={{ color: "#666660" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </Link>
        <p className="font-display text-sm font-bold uppercase tracking-[0.1em]" style={{ color: "#F5F5F0" }}>
          GIMME
        </p>
        <div className="w-5" />
      </header>

      {/* Mode toggle */}
      <div className="flex items-center gap-0 self-center rounded-full p-1" style={{ background: "#141414", border: "1px solid #222222" }}>
        {(["camera", "search"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className="rounded-full px-5 py-2 text-[10px] font-medium uppercase tracking-[0.15em] transition-all"
            style={{
              fontFamily: "var(--font-space)",
              background: mode === m ? "#C8F135" : "transparent",
              color: mode === m ? "#0A0A0A" : "#666660",
            }}
          >
            {m === "camera" ? "Camera" : "Search"}
          </button>
        ))}
      </div>

      {mode === "camera" ? (
        <>
          {/* Live camera viewfinder */}
          <div className="flex flex-1 flex-col items-center justify-center px-6 py-6">
            <div
              className="relative flex h-[340px] w-full max-w-sm items-center justify-center overflow-hidden rounded-3xl"
              style={{ background: "#141414" }}
            >
              {/* Video feed */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover"
                style={{ display: cameraReady ? "block" : "none" }}
              />

              {/* Viewfinder corners — lime brackets */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute left-4 top-4 h-8 w-8 border-l-2 border-t-2 rounded-tl-sm" style={{ borderColor: "#C8F135" }} />
                <div className="absolute right-4 top-4 h-8 w-8 border-r-2 border-t-2 rounded-tr-sm" style={{ borderColor: "#C8F135" }} />
                <div className="absolute bottom-4 left-4 h-8 w-8 border-l-2 border-b-2 rounded-bl-sm" style={{ borderColor: "#C8F135" }} />
                <div className="absolute bottom-4 right-4 h-8 w-8 border-r-2 border-b-2 rounded-br-sm" style={{ borderColor: "#C8F135" }} />
              </div>

              {/* Loading / error states */}
              {!cameraReady && !cameraError && (
                <div className="flex flex-col items-center gap-3">
                  <div className="h-0.5 w-16 overflow-hidden rounded-full" style={{ background: "#222222" }}>
                    <div className="h-full w-1/3 rounded-full loading-bar" style={{ background: "#C8F135" }} />
                  </div>
                  <p className="text-xs" style={{ fontFamily: "var(--font-inter)", color: "#666660" }}>
                    Starting camera...
                  </p>
                </div>
              )}

              {cameraError && (
                <div className="flex flex-col items-center gap-3 px-6 text-center">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#666660" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                  <p className="text-xs" style={{ fontFamily: "var(--font-inter)", color: "#666660" }}>
                    {cameraError}
                  </p>
                </div>
              )}

              {/* Capturing flash — dark instead of white */}
              {capturing && (
                <div className="absolute inset-0 animate-pulse" style={{ background: "rgba(200,241,53,0.08)" }} />
              )}
            </div>

            <p className="mt-4 text-center text-[10px] font-medium uppercase tracking-[0.2em]" style={{ fontFamily: "var(--font-space)", color: "#666660" }}>
              Point at anything
            </p>
          </div>

          {/* Bottom actions */}
          <div className="flex flex-col items-center gap-3 pb-10">
            {/* Shutter button — lime ring, warm white center */}
            <button
              onClick={handleCapture}
              disabled={!cameraReady || capturing}
              className="flex h-20 w-20 items-center justify-center rounded-full transition-transform hover:scale-105 active:scale-90 disabled:opacity-40 pulse-ring"
              style={{ background: "transparent", border: "3px solid #C8F135" }}
            >
              <div className="h-14 w-14 rounded-full" style={{ background: "#F5F5F0" }} />
            </button>

            {/* Upload fallback */}
            <label className="cursor-pointer text-[10px] font-medium uppercase tracking-[0.15em] underline underline-offset-2" style={{ fontFamily: "var(--font-space)", color: "#666660" }}>
              Or upload a photo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          </div>
        </>
      ) : (
        <>
          {/* Search mode */}
          <div className="flex flex-1 flex-col items-center px-6 py-8">
            <form onSubmit={handleSearch} className="w-full max-w-sm">
              <div className="relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666660" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  autoFocus
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder='Try "Cartier Santos" or "black Nike sneakers"'
                  className="w-full rounded-xl py-4 pl-11 pr-4 text-sm outline-none transition-colors"
                  style={{ fontFamily: "var(--font-inter)", background: "#141414", border: "1px solid #222222", color: "#F5F5F0" }}
                  onFocus={(e) => (e.target.style.borderColor = "#C8F135")}
                  onBlur={(e) => (e.target.style.borderColor = "#222222")}
                />
              </div>

              {query.trim() && (
                <button
                  type="submit"
                  className="mt-4 w-full rounded-full py-3.5 text-xs font-semibold uppercase tracking-[0.2em] transition-opacity hover:opacity-85"
                  style={{ fontFamily: "var(--font-space)", background: "#C8F135", color: "#0A0A0A" }}
                >
                  Find It
                </button>
              )}
            </form>
          </div>
        </>
      )}
    </main>
  );
}
