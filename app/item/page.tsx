"use client";

import Link from "next/link";
import { useState, Suspense } from "react";

const RETAILERS = [
  { name: "Cartier.com",       price: "$7,400",  tag: "Official",     best: false },
  { name: "NET-A-PORTER",      price: "$7,200",  tag: "Best Price",   best: true },
  { name: "Farfetch",          price: "$7,350",  tag: null,           best: false },
  { name: "Chrono24",          price: "$6,850",  tag: "Pre-owned",    best: false },
];

function ItemContent() {
  const [saved, setSaved] = useState(true);

  return (
    <main className="min-h-screen bg-white pb-12">

      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between bg-white/90 px-5 py-4 backdrop-blur-sm">
        <Link href="/home" className="text-[#8A8A8A] hover:text-[#1A1A1A] transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M5 12l7 7M5 12l7-7" />
          </svg>
        </Link>
        <p className="font-display text-sm font-bold uppercase tracking-[0.1em]" style={{ color: "#1A1A1A" }}>
          GIMME
        </p>
        <button
          onClick={() => setSaved(!saved)}
          className="transition-colors"
          style={{ color: saved ? "#E63946" : "#C4C4C4" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      </header>

      {/* Product image */}
      <div
        className="mx-4 flex h-[300px] items-center justify-center rounded-3xl"
        style={{ background: "#F5F0EB" }}
      >
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#C4C4C4" strokeWidth="0.6">
          <rect x="3" y="3" width="18" height="18" rx="3" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
      </div>

      {/* Product info */}
      <div className="px-5 pt-5">
        <p className="text-xs font-medium uppercase tracking-[0.15em]" style={{ fontFamily: "var(--font-space)", color: "#8A8A8A" }}>
          Cartier
        </p>
        <h1 className="mt-1 text-2xl font-bold" style={{ fontFamily: "var(--font-space)", color: "#1A1A1A" }}>
          Santos de Cartier
        </h1>
        <p className="mt-1 text-sm font-light" style={{ fontFamily: "var(--font-inter)", color: "#8A8A8A" }}>
          Automatic Watch · Steel · 35mm · Silver dial
        </p>

        {/* Collection badge */}
        <div className="mt-3 flex items-center gap-2">
          <span className="rounded-full px-3 py-1 text-[10px] font-medium" style={{ fontFamily: "var(--font-space)", background: "#FDEBED", color: "#E63946" }}>
            Watches
          </span>
          <span className="text-[10px]" style={{ fontFamily: "var(--font-inter)", color: "#C4C4C4" }}>
            Saved Mar 31
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 my-5 h-px" style={{ background: "#F0F0F0" }} />

      {/* Price comparison */}
      <div className="px-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold uppercase tracking-[0.1em]" style={{ fontFamily: "var(--font-space)", color: "#1A1A1A" }}>
            Compare Prices
          </h2>
          <p className="text-[10px]" style={{ fontFamily: "var(--font-inter)", color: "#C4C4C4" }}>
            Updated today
          </p>
        </div>

        <div className="flex flex-col gap-2.5">
          {RETAILERS.map((r) => (
            <div
              key={r.name}
              className="flex items-center justify-between rounded-2xl px-4 py-4 transition-colors hover:bg-[#FAFAFA]"
              style={{
                border: r.best ? "1.5px solid #E63946" : "1px solid #F0F0F0",
                background: r.best ? "#FDEBED" : "white",
              }}
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium" style={{ fontFamily: "var(--font-space)", color: "#1A1A1A" }}>
                    {r.name}
                  </p>
                  {r.tag && (
                    <span
                      className="rounded-full px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.08em]"
                      style={{
                        fontFamily: "var(--font-space)",
                        background: r.best ? "#E63946" : "#F0F0F0",
                        color: r.best ? "#FFFFFF" : "#8A8A8A",
                      }}
                    >
                      {r.tag}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-[10px]" style={{ fontFamily: "var(--font-inter)", color: "#C4C4C4" }}>
                  Free shipping · Easy returns
                </p>
              </div>
              <p
                className="text-lg font-bold"
                style={{ fontFamily: "var(--font-space)", color: r.best ? "#E63946" : "#1A1A1A" }}
              >
                {r.price}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 my-5 h-px" style={{ background: "#F0F0F0" }} />

      {/* Apple Pay section */}
      <div className="px-5">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-[0.1em]" style={{ fontFamily: "var(--font-space)", color: "#1A1A1A" }}>
          One Tap Buy
        </h2>
        <p className="mb-4 text-xs font-light" style={{ fontFamily: "var(--font-inter)", color: "#8A8A8A" }}>
          Best price from NET-A-PORTER · Ships to your saved address
        </p>

        {/* Apple Pay button */}
        <button
          className="flex w-full items-center justify-center gap-2.5 rounded-full py-4 transition-opacity hover:opacity-85"
          style={{ background: "#1A1A1A" }}
        >
          {/* Apple logo */}
          <svg width="18" height="22" viewBox="0 0 18 22" fill="white">
            <path d="M14.94 11.58c-.03-2.76 2.25-4.09 2.35-4.15-1.28-1.87-3.27-2.13-3.98-2.16-1.69-.17-3.31 1-4.17 1-.86 0-2.18-.98-3.58-.95-1.84.03-3.54 1.07-4.49 2.72-1.92 3.33-.49 8.27 1.38 10.97.91 1.32 2 2.81 3.43 2.76 1.38-.06 1.9-.89 3.56-.89 1.66 0 2.13.89 3.58.86 1.48-.03 2.41-1.35 3.31-2.67 1.05-1.53 1.48-3.01 1.5-3.09-.03-.01-2.88-1.11-2.91-4.4h.02zM12.22 3.37C12.98 2.45 13.5 1.19 13.36 0c-1.08.04-2.4.72-3.17 1.63-.69.8-1.3 2.08-1.14 3.31 1.21.09 2.44-.61 3.17-1.57z" />
          </svg>
          <span className="text-sm font-medium text-white" style={{ fontFamily: "var(--font-space)" }}>
            Pay $7,200
          </span>
        </button>

        {/* Shipping info */}
        <div className="mt-4 flex items-center gap-3 rounded-2xl px-4 py-3" style={{ background: "#FAFAFA" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8A8A8A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="3" width="15" height="13" rx="2" />
            <path d="M16 8h4l3 4v5h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
          </svg>
          <div>
            <p className="text-xs font-medium" style={{ fontFamily: "var(--font-space)", color: "#1A1A1A" }}>
              Delivers to saved address
            </p>
            <p className="text-[10px]" style={{ fontFamily: "var(--font-inter)", color: "#C4C4C4" }}>
              123 Main St, New York NY 10001 · Est. Apr 5–8
            </p>
          </div>
          <button className="ml-auto text-[10px] font-medium underline underline-offset-2" style={{ fontFamily: "var(--font-space)", color: "#E63946" }}>
            Edit
          </button>
        </div>
      </div>

    </main>
  );
}

export default function ItemPage() {
  return (
    <Suspense>
      <ItemContent />
    </Suspense>
  );
}
