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
        <svg width="72" height="44" viewBox="0 0 72 44" fill="none">
          {/* Left wing — solid filled shape */}
          <path d="M28 22C26 20 20 16 14 14C8 12 3 13 2 16C1 19 3 22 7 24C11 26 18 27 24 27C20 25 14 22 10 20C7 18.5 6 17 7.5 16C9 15 13 15.5 17 17.5C21 19.5 25 22 28 25Z" fill="#C8F135" opacity="0.35" />
          <path d="M29 19C27 15 23 9 20 6C17 3 15 3 15 5C15 7 17 11 20 15C23 19 26 22 28 23C25 18 20 12 17 9C15 7 14 7.5 15 9C16 11 19 15 23 19C26 22 28 23 29 23Z" fill="#C8F135" opacity="0.35" />
          {/* Left wing outline */}
          <path d="M28 25C22 27 12 27 6 24C2 22 1 18 3 15C5 12 10 12 16 14C22 16 27 20 29 23" stroke="#C8F135" strokeWidth="1.2" />
          <path d="M29 23C27 18 22 10 18 6C15 3 14 4 15 7C16 10 20 16 28 25" stroke="#C8F135" strokeWidth="1.2" />
          {/* Right wing — mirrored solid */}
          <path d="M44 22C46 20 52 16 58 14C64 12 69 13 70 16C71 19 69 22 65 24C61 26 54 27 48 27C52 25 58 22 62 20C65 18.5 66 17 64.5 16C63 15 59 15.5 55 17.5C51 19.5 47 22 44 25Z" fill="#C8F135" opacity="0.35" />
          <path d="M43 19C45 15 49 9 52 6C55 3 57 3 57 5C57 7 55 11 52 15C49 19 46 22 44 23C47 18 52 12 55 9C57 7 58 7.5 57 9C56 11 53 15 49 19C46 22 44 23 43 23Z" fill="#C8F135" opacity="0.35" />
          {/* Right wing outline */}
          <path d="M44 25C50 27 60 27 66 24C70 22 71 18 69 15C67 12 62 12 56 14C50 16 45 20 43 23" stroke="#C8F135" strokeWidth="1.2" />
          <path d="M43 23C45 18 50 10 54 6C57 3 58 4 57 7C56 10 52 16 44 25" stroke="#C8F135" strokeWidth="1.2" />
          {/* Heart — solid lime, sits on top */}
          <path d="M36 40C36 40 23 31 23 22.5C23 19.5 25.3 17 28 17C30.3 17 32.8 18.5 36 22C39.2 18.5 41.7 17 44 17C46.7 17 49 19.5 49 22.5C49 31 36 40 36 40Z" fill="#C8F135" stroke="#0A0A0A" strokeWidth="1.5" />
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
