import Link from "next/link";

export default function WelcomePage() {
  return (
    <main className="relative flex h-full min-h-screen flex-col items-center justify-between overflow-hidden px-6 py-14" style={{ background: "#0A0A0A" }}>

      {/* Top — empty space, lets the page breathe */}
      <div />

      {/* Center — the statement */}
      <section className="flex w-full max-w-sm flex-col items-center gap-7 text-center">

        {/* Wordmark */}
        <h1
          className="font-display text-[3.2rem] font-bold uppercase tracking-[0.12em] leading-none"
          style={{ color: "#F5F5F0" }}
        >
          GIMME
        </h1>

        {/* Brand mark — winged heart */}
        <svg width="40" height="28" viewBox="0 0 48 28" fill="none" stroke="#C8F135" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          {/* Left wing */}
          <path d="M18 12C14 10 8 8 2 10C5 7 10 6 14 7" />
          <path d="M18 14C13 13 7 12 1 15C4 11 9 10 14 11" />
          <path d="M17 16C12 16 6 16 1 20C4 16 9 14 14 15" />
          {/* Right wing */}
          <path d="M30 12C34 10 40 8 46 10C43 7 38 6 34 7" />
          <path d="M30 14C35 13 41 12 47 15C44 11 39 10 34 11" />
          <path d="M31 16C36 16 42 16 47 20C44 16 39 14 34 15" />
          {/* Heart */}
          <path d="M24 24C24 24 16 19 16 13.5C16 11.5 17.5 10 19.5 10C21 10 22.3 10.9 24 12.5C25.7 10.9 27 10 28.5 10C30.5 10 32 11.5 32 13.5C32 19 24 24 24 24Z" />
        </svg>

        {/* Tagline */}
        <p
          className="max-w-[220px] text-sm font-light leading-relaxed"
          style={{ fontFamily: "var(--font-inter)", color: "#666660" }}
        >
          See it. Snap it. Save it.<br />
          Buy it when you&rsquo;re ready.
        </p>
      </section>

      {/* CTAs */}
      <footer className="flex w-full max-w-sm flex-col items-center gap-3">

        <Link
          href="/signup"
          className="block w-full rounded-full py-4 text-center text-xs font-semibold uppercase tracking-[0.2em] transition-opacity hover:opacity-85 active:opacity-70"
          style={{ fontFamily: "var(--font-space)", background: "#C8F135", color: "#0A0A0A" }}
        >
          Get Started
        </Link>

        <Link
          href="/signin"
          className="block w-full rounded-full border py-4 text-center text-xs font-medium uppercase tracking-[0.2em] transition-colors"
          style={{ fontFamily: "var(--font-space)", borderColor: "#222222", color: "#F5F5F0" }}
        >
          Sign In
        </Link>

        <p
          className="mt-1 text-center text-[10px] leading-relaxed"
          style={{ fontFamily: "var(--font-inter)", color: "#666660" }}
        >
          By continuing you agree to our{" "}
          <span className="underline underline-offset-2">Terms</span> and{" "}
          <span className="underline underline-offset-2">Privacy Policy</span>
        </p>
      </footer>

    </main>
  );
}
