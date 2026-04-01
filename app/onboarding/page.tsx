"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const STEPS = [
  {
    label: "Spot It",
    body: "See something you love on a friend?\nOpen GIMME and tap the camera.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#E63946" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="4" />
        <line x1="21.17" y1="8" x2="12" y2="8" opacity="0.4" />
        <line x1="3.95" y1="6.06" x2="8.54" y2="14" opacity="0.4" />
        <line x1="10.88" y1="21.94" x2="15.46" y2="14" opacity="0.4" />
      </svg>
    ),
  },
  {
    label: "Save It",
    body: "GIMME identifies it instantly\nand adds it to your collection.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#E63946" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    label: "Get It",
    body: "When you\u2019re ready, tap any item\nto see the best prices and buy\nin one tap.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#E63946" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("gimme-onboarded")) {
      router.replace("/home");
    } else {
      setShow(true);
    }
  }, [router]);

  const handleGo = () => {
    localStorage.setItem("gimme-onboarded", "1");
    router.push("/home");
  };

  if (!show) return null;

  return (
    <main className="flex min-h-screen flex-col items-center justify-between bg-white px-6 py-14">

      {/* Wordmark */}
      <header className="flex flex-col items-center gap-3">
        <h1
          className="font-display text-lg font-bold uppercase tracking-[0.15em]"
          style={{ color: "#1A1A1A" }}
        >
          GIMME
        </h1>
        <div className="h-1.5 w-1.5 rounded-full" style={{ background: "#E63946" }} />
      </header>

      {/* Steps */}
      <section className="flex w-full max-w-sm flex-col gap-12">
        {STEPS.map((step, i) => (
          <div
            key={step.label}
            className="flex flex-col items-center gap-4 text-center"
            style={{
              animation: `fadeUp 0.5s ease ${0.15 * (i + 1)}s forwards`,
              opacity: 0,
            }}
          >
            {/* Step number + icon */}
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full" style={{ background: "#FDEBED" }}>
                {step.icon}
              </div>
              <p
                className="font-display text-xs font-semibold uppercase tracking-[0.25em]"
                style={{ color: "#E63946" }}
              >
                Step {i + 1} &mdash; {step.label}
              </p>
            </div>

            {/* Body */}
            <p
              className="text-sm font-light leading-relaxed whitespace-pre-line"
              style={{ fontFamily: "var(--font-inter)", color: "#8A8A8A" }}
            >
              {step.body}
            </p>
          </div>
        ))}
      </section>

      {/* CTA */}
      <footer className="w-full max-w-sm">
        <button
          onClick={handleGo}
          className="block w-full rounded-full py-4 text-center text-xs font-semibold uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-85 active:opacity-70"
          style={{
            fontFamily: "var(--font-space)",
            background: "#E63946",
            animation: "fadeUp 0.5s ease 0.6s forwards",
            opacity: 0,
          }}
        >
          Let&rsquo;s go
        </button>
      </footer>

      {/* Inline keyframes for staggered fade */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
}
