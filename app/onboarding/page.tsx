"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../components/AuthProvider";
import Link from "next/link";
import { Suspense } from "react";

const STEPS = [
  {
    num: "01",
    text: "Point your camera at anything you want",
  },
  {
    num: "02",
    text: "Gimme identifies it instantly",
  },
  {
    num: "03",
    text: "Compare prices across every retailer",
  },
  {
    num: "04",
    text: "Tap to buy at the best price",
  },
];

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const [show, setShow] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  // "from=home" means the user tapped the logo — skip the first-time check
  const fromHome = searchParams.get("from") === "home";

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/");
      return;
    }

    if (fromHome) {
      // Opened intentionally from logo tap — always show
      setShow(true);
    } else if (localStorage.getItem("gimme-onboarded")) {
      // Returning user hitting /onboarding directly — send to home
      router.replace("/home");
    } else {
      // First time user — show onboarding
      setShow(true);
    }
  }, [router, user, loading, fromHome]);

  function handleDismiss() {
    localStorage.setItem("gimme-onboarded", "1");
    setFadeOut(true);
    setTimeout(() => router.push("/home"), 300);
  }

  function handleTryIt() {
    localStorage.setItem("gimme-onboarded", "1");
    setFadeOut(true);
    setTimeout(() => router.push("/capture"), 300);
  }

  if (!show) return null;

  return (
    <main
      className="flex min-h-screen flex-col items-center px-6 py-14 transition-opacity duration-300"
      style={{
        background: "#0A0A0A",
        opacity: fadeOut ? 0 : 1,
      }}
    >

      {/* Close / Skip — top right */}
      <button
        onClick={handleDismiss}
        className="absolute right-5 top-5 z-10 transition-opacity hover:opacity-70"
        style={{ color: "#666660" }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>

      {/* Top spacer */}
      <div className="flex-1" />

      {/* Center content */}
      <section className="flex w-full max-w-sm flex-col items-center gap-10 text-center">

        {/* Wordmark — large, centered */}
        <div
          className="flex flex-col items-center gap-4"
          style={{ animation: "fadeUp 0.5s ease 0.1s forwards", opacity: 0 }}
        >
          <h1
            className="font-display text-[3rem] font-bold uppercase tracking-[0.12em] leading-none"
            style={{ color: "#F5F5F0" }}
          >
            GIMME
          </h1>
          {/* Lime asterisk */}
          <span className="text-lg font-light leading-none" style={{ color: "#C8F135" }}>*</span>
        </div>

        {/* Tagline */}
        <p
          className="text-sm font-light leading-relaxed"
          style={{
            fontFamily: "var(--font-inter)",
            color: "#F5F5F0",
            animation: "fadeUp 0.5s ease 0.2s forwards",
            opacity: 0,
          }}
        >
          See it. Snap it. Gimme.
        </p>

        {/* Steps */}
        <div className="flex w-full flex-col gap-6 mt-4">
          {STEPS.map((step, i) => (
            <div
              key={step.num}
              className="flex items-start gap-4 text-left"
              style={{
                animation: `fadeUp 0.5s ease ${0.3 + i * 0.1}s forwards`,
                opacity: 0,
              }}
            >
              {/* Step number */}
              <span
                className="flex-shrink-0 text-xs font-semibold uppercase tracking-[0.2em] pt-0.5"
                style={{ fontFamily: "var(--font-space)", color: "#C8F135", minWidth: "28px" }}
              >
                {step.num}
              </span>
              {/* Step text */}
              <p
                className="text-sm font-light leading-relaxed"
                style={{ fontFamily: "var(--font-inter)", color: "#666660" }}
              >
                {step.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom spacer */}
      <div className="flex-1" />

      {/* GIMME FAB — try it now */}
      <footer
        className="flex w-full max-w-sm flex-col items-center gap-4"
        style={{ animation: "fadeUp 0.5s ease 0.8s forwards", opacity: 0 }}
      >
        <button
          onClick={handleTryIt}
          className="flex h-[72px] w-[72px] items-center justify-center rounded-full transition-transform hover:scale-105 active:scale-95"
          style={{
            background: "#C8F135",
            boxShadow: "0 4px 24px rgba(200,241,53,0.25), 0 0 0 1px rgba(200,241,53,0.1)",
          }}
        >
          <span
            className="font-display text-[11px] font-bold uppercase tracking-[0.08em]"
            style={{ color: "#0A0A0A" }}
          >
            GIMME
          </span>
        </button>
        <p
          className="text-[10px] font-medium uppercase tracking-[0.2em]"
          style={{ fontFamily: "var(--font-space)", color: "#666660" }}
        >
          Try it now
        </p>
      </footer>

    </main>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense>
      <OnboardingContent />
    </Suspense>
  );
}
