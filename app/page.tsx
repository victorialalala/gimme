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
        <svg width="44" height="24" viewBox="0 0 44 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
          {/* Left wing — single clean swept shape */}
          <path d="M16 11C13 9 8 7.5 3 9C1.5 9.5 1 10.5 1.5 11.5C2 12.5 4 13 7 12.5C10 12 14 12 16 13" stroke="#C8F135" strokeWidth="1.3" fill="none" />
          {/* Right wing — mirrored */}
          <path d="M28 11C31 9 36 7.5 41 9C42.5 9.5 43 10.5 42.5 11.5C42 12.5 40 13 37 12.5C34 12 30 12 28 13" stroke="#C8F135" strokeWidth="1.3" fill="none" />
          {/* Heart — filled lime */}
          <path d="M22 21C22 21 14 16 14 11.5C14 9.5 15.5 8 17.5 8C19 8 20.5 9 22 11C23.5 9 25 8 26.5 8C28.5 8 30 9.5 30 11.5C30 16 22 21 22 21Z" fill="#C8F135" stroke="none" />
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
