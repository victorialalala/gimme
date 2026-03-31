"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, Suspense } from "react";

function IdentifiedContent() {
  const router = useRouter();
  const [stage, setStage] = useState<"scanning" | "found">("scanning");

  // Simulate AI scan delay
  useEffect(() => {
    const t = setTimeout(() => setStage("found"), 2200);
    return () => clearTimeout(t);
  }, []);

  return (
    <main className="flex min-h-screen flex-col bg-white">

      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4">
        <Link href="/capture" className="text-[#8A8A8A] hover:text-[#1A1A1A] transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M5 12l7 7M5 12l7-7" />
          </svg>
        </Link>
        <p className="font-display text-sm font-bold uppercase tracking-[0.1em]" style={{ color: "#1A1A1A" }}>
          GIMME
        </p>
        <div className="w-5" />
      </header>

      {stage === "scanning" ? (
        /* ── Scanning state ─────────────────────────────────── */
        <div className="flex flex-1 flex-col items-center justify-center px-6">
          {/* Image area with scan effect */}
          <div
            className="relative flex h-[280px] w-full max-w-sm items-center justify-center overflow-hidden rounded-3xl"
            style={{ background: "#F5F0EB" }}
          >
            {/* Scan shimmer overlay */}
            <div className="scan-shimmer absolute inset-0" />

            {/* Placeholder image icon */}
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#C4C4C4" strokeWidth="0.8">
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>

            {/* Scanning label */}
            <div
              className="absolute bottom-4 left-4 right-4 flex items-center gap-2 rounded-xl px-4 py-3"
              style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(8px)" }}
            >
              <div className="h-3 w-3 rounded-full" style={{ background: "#E63946", animation: "pulse 1.5s ease infinite" }} />
              <p className="text-xs font-medium" style={{ fontFamily: "var(--font-space)", color: "#1A1A1A" }}>
                Identifying item…
              </p>
            </div>
          </div>

          <p className="mt-6 text-center text-xs font-light" style={{ fontFamily: "var(--font-inter)", color: "#C4C4C4" }}>
            Scanning image and searching across 10,000+ brands
          </p>
        </div>
      ) : (
        /* ── Found state ────────────────────────────────────── */
        <div className="flex flex-1 flex-col items-center px-6 py-4">

          {/* Match image */}
          <div
            className="fade-up relative flex h-[260px] w-full max-w-sm items-center justify-center overflow-hidden rounded-3xl"
            style={{ background: "#F5F0EB" }}
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#C4C4C4" strokeWidth="0.8">
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>

            {/* Match confidence badge */}
            <div
              className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full px-3 py-1.5"
              style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(8px)" }}
            >
              <div className="h-2 w-2 rounded-full" style={{ background: "#22C55E" }} />
              <span className="text-[10px] font-medium" style={{ fontFamily: "var(--font-space)", color: "#1A1A1A" }}>
                98% match
              </span>
            </div>
          </div>

          {/* Item info */}
          <div className="fade-up-1 mt-6 w-full max-w-sm">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em]" style={{ fontFamily: "var(--font-space)", color: "#E63946" }}>
              Identified
            </p>
            <h2 className="mt-1 text-2xl font-bold" style={{ fontFamily: "var(--font-space)", color: "#1A1A1A" }}>
              Santos de Cartier
            </h2>
            <p className="mt-0.5 text-sm" style={{ fontFamily: "var(--font-inter)", color: "#8A8A8A" }}>
              Cartier · Automatic Watch · 35mm
            </p>
            <p className="mt-3 text-2xl font-bold" style={{ fontFamily: "var(--font-space)", color: "#1A1A1A" }}>
              $7,400
            </p>
            <p className="text-xs" style={{ fontFamily: "var(--font-inter)", color: "#C4C4C4" }}>
              Estimated retail price · 4 retailers found
            </p>
          </div>

          {/* Actions */}
          <div className="fade-up-2 mt-8 flex w-full max-w-sm flex-col gap-3">
            <button
              onClick={() => router.push("/item?id=1")}
              className="w-full rounded-full py-4 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-85"
              style={{ fontFamily: "var(--font-space)", background: "#E63946" }}
            >
              Save to Collection
            </button>
            <button
              onClick={() => router.push("/item?id=1")}
              className="w-full rounded-full py-4 text-xs font-medium uppercase tracking-[0.2em] transition-colors hover:bg-[#FAFAFA]"
              style={{ fontFamily: "var(--font-space)", border: "1px solid #F0F0F0", color: "#1A1A1A" }}
            >
              View Prices
            </button>
            <button
              onClick={() => router.push("/capture")}
              className="w-full py-3 text-xs font-light underline underline-offset-4 transition-opacity hover:opacity-70"
              style={{ fontFamily: "var(--font-inter)", color: "#C4C4C4" }}
            >
              Not the right item? Try again
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default function IdentifiedPage() {
  return (
    <Suspense>
      <IdentifiedContent />
    </Suspense>
  );
}
