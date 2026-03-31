"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CapturePage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"camera" | "search">("camera");

  function handleCapture() {
    // Simulate — go to identified screen
    router.push("/identified");
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push("/identified?q=" + encodeURIComponent(query));
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-white">

      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4">
        <Link href="/home" className="text-[#8A8A8A] hover:text-[#1A1A1A] transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </Link>
        <p className="font-display text-sm font-bold uppercase tracking-[0.1em]" style={{ color: "#1A1A1A" }}>
          GIMME
        </p>
        <div className="w-5" /> {/* spacer */}
      </header>

      {/* Mode toggle */}
      <div className="flex items-center gap-0 self-center rounded-full p-1" style={{ background: "#FAFAFA", border: "1px solid #F0F0F0" }}>
        {(["camera", "search"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className="rounded-full px-5 py-2 text-[10px] font-medium uppercase tracking-[0.15em] transition-all"
            style={{
              fontFamily: "var(--font-space)",
              background: mode === m ? "#1A1A1A" : "transparent",
              color: mode === m ? "#FFFFFF" : "#8A8A8A",
            }}
          >
            {m === "camera" ? "Camera" : "Search"}
          </button>
        ))}
      </div>

      {mode === "camera" ? (
        <>
          {/* Camera viewfinder area */}
          <div className="flex flex-1 flex-col items-center justify-center px-6 py-8">
            <div
              className="relative flex h-[340px] w-full max-w-sm items-center justify-center rounded-3xl"
              style={{ background: "#FAFAFA", border: "2px dashed #E0E0E0" }}
            >
              {/* Viewfinder corners */}
              <div className="absolute left-4 top-4 h-6 w-6 border-l-2 border-t-2 rounded-tl-lg" style={{ borderColor: "#E63946" }} />
              <div className="absolute right-4 top-4 h-6 w-6 border-r-2 border-t-2 rounded-tr-lg" style={{ borderColor: "#E63946" }} />
              <div className="absolute bottom-4 left-4 h-6 w-6 border-l-2 border-b-2 rounded-bl-lg" style={{ borderColor: "#E63946" }} />
              <div className="absolute bottom-4 right-4 h-6 w-6 border-r-2 border-b-2 rounded-br-lg" style={{ borderColor: "#E63946" }} />

              <div className="flex flex-col items-center gap-3 text-center">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#C4C4C4" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                <p className="text-xs font-light" style={{ fontFamily: "var(--font-inter)", color: "#C4C4C4" }}>
                  Point at the item you want
                </p>
              </div>
            </div>

            <p className="mt-4 text-center text-xs font-light" style={{ fontFamily: "var(--font-inter)", color: "#8A8A8A" }}>
              GIMME identifies watches, bags, shoes, jewellery, and more.
            </p>
          </div>

          {/* Capture button */}
          <div className="flex flex-col items-center gap-3 pb-12">
            <button
              onClick={handleCapture}
              className="flex h-20 w-20 items-center justify-center rounded-full transition-transform hover:scale-105 active:scale-90"
              style={{ background: "#E63946" }}
            >
              {/* White ring + dot — classic camera shutter */}
              <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white">
                <div className="h-10 w-10 rounded-full bg-white" />
              </div>
            </button>
            <p className="text-[10px] font-medium uppercase tracking-[0.15em]" style={{ fontFamily: "var(--font-space)", color: "#C4C4C4" }}>
              Tap to capture
            </p>
          </div>
        </>
      ) : (
        <>
          {/* Search mode */}
          <div className="flex flex-1 flex-col items-center px-6 py-8">
            <form onSubmit={handleSearch} className="w-full max-w-sm">
              <div className="relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C4C4C4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  autoFocus
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder='Try "Cartier Santos" or "black Nike sneakers"'
                  className="w-full rounded-xl py-4 pl-11 pr-4 text-sm outline-none"
                  style={{ fontFamily: "var(--font-inter)", background: "#FAFAFA", border: "1px solid #F0F0F0", color: "#1A1A1A" }}
                  onFocus={(e) => (e.target.style.borderColor = "#E63946")}
                  onBlur={(e) => (e.target.style.borderColor = "#F0F0F0")}
                />
              </div>

              {query.trim() && (
                <button
                  type="submit"
                  className="mt-4 w-full rounded-full py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-85"
                  style={{ fontFamily: "var(--font-space)", background: "#E63946" }}
                >
                  Find It
                </button>
              )}
            </form>

            {/* Recent searches */}
            <div className="mt-10 w-full max-w-sm">
              <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.2em]" style={{ fontFamily: "var(--font-space)", color: "#C4C4C4" }}>
                Recent
              </p>
              {["Jacquemus Le Bambino", "Nike Air Max 90 cream", "Cartier ring gold"].map((s) => (
                <button
                  key={s}
                  onClick={() => { setQuery(s); router.push("/identified?q=" + encodeURIComponent(s)); }}
                  className="flex w-full items-center gap-3 py-3 transition-colors hover:bg-[#FAFAFA]"
                  style={{ borderBottom: "1px solid #F0F0F0" }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C4C4C4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                  </svg>
                  <span className="text-sm" style={{ fontFamily: "var(--font-inter)", color: "#8A8A8A" }}>{s}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </main>
  );
}
