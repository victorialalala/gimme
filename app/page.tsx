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
        <svg width="64" height="40" viewBox="0 0 64 40" fill="none" strokeLinecap="round" strokeLinejoin="round">
          {/* Left angel wing — layered feathers */}
          <path d="M24 18C20 14 12 10 4 12C2 12.6 1.5 14 2.5 15C4 16.5 8 16 12 15C16 14 21 14.5 24 17" stroke="#C8F135" strokeWidth="1.3" />
          <path d="M24 20C19 17 11 14 4 17C2 17.8 1.8 19 3 19.8C5 21 9 20 13 18.5C17 17 21 17.5 24 19" stroke="#C8F135" strokeWidth="1.3" />
          <path d="M24 22C19 20 12 18.5 6 21C4.5 21.7 4.5 23 5.5 23.5C7.5 24.5 11 23 15 21.5C19 20 22 20.5 24 22" stroke="#C8F135" strokeWidth="1.3" />
          {/* Right angel wing — mirrored */}
          <path d="M40 18C44 14 52 10 60 12C62 12.6 62.5 14 61.5 15C60 16.5 56 16 52 15C48 14 43 14.5 40 17" stroke="#C8F135" strokeWidth="1.3" />
          <path d="M40 20C45 17 53 14 60 17C62 17.8 62.2 19 61 19.8C59 21 55 20 51 18.5C47 17 43 17.5 40 19" stroke="#C8F135" strokeWidth="1.3" />
          <path d="M40 22C45 20 52 18.5 58 21C59.5 21.7 59.5 23 58.5 23.5C56.5 24.5 53 23 49 21.5C45 20 42 20.5 40 22" stroke="#C8F135" strokeWidth="1.3" />
          {/* Heart — solid lime, larger */}
          <path d="M32 36C32 36 20 28 20 20C20 17 22 14.5 25 14.5C27.2 14.5 29.5 16 32 19C34.5 16 36.8 14.5 39 14.5C42 14.5 44 17 44 20C44 28 32 36 32 36Z" fill="#C8F135" stroke="none" />
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
