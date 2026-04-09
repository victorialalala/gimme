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
        <svg width="72" height="48" viewBox="0 0 72 48" fill="none">
          {/* Left wing — soft rounded feather shapes */}
          <path d="M26 26C22 28 14 30 8 28C4 26.5 4 24 7 23C10 22 16 23 22 25" stroke="#C8F135" strokeWidth="1.2" />
          <path d="M26 23C21 23 13 23 7 20C3 18 3.5 15.5 6.5 15.5C10 15.5 16 18 23 22" stroke="#C8F135" strokeWidth="1.2" />
          <path d="M27 20C23 18 16 14 11 11C8 9 8.5 7 11 7.5C14 8 20 12 25 18" stroke="#C8F135" strokeWidth="1.2" />
          <path d="M29 18C26 14 22 9 20 5C18.5 2.5 20 1.5 22 3C24.5 5.5 27 11 29 17" stroke="#C8F135" strokeWidth="1.2" />
          {/* Right wing — mirrored soft feathers */}
          <path d="M46 26C50 28 58 30 64 28C68 26.5 68 24 65 23C62 22 56 23 50 25" stroke="#C8F135" strokeWidth="1.2" />
          <path d="M46 23C51 23 59 23 65 20C69 18 68.5 15.5 65.5 15.5C62 15.5 56 18 49 22" stroke="#C8F135" strokeWidth="1.2" />
          <path d="M45 20C49 18 56 14 61 11C64 9 63.5 7 61 7.5C58 8 52 12 47 18" stroke="#C8F135" strokeWidth="1.2" />
          <path d="M43 18C46 14 50 9 52 5C53.5 2.5 52 1.5 50 3C47.5 5.5 45 11 43 17" stroke="#C8F135" strokeWidth="1.2" />
          {/* Heart — solid lime with dark outline */}
          <path d="M36 42C36 42 22 33 22 23.5C22 20 24.5 17 28 17C30.5 17 33 18.5 36 22C39 18.5 41.5 17 44 17C47.5 17 50 20 50 23.5C50 33 36 42 36 42Z" fill="#C8F135" stroke="#0A0A0A" strokeWidth="1.5" />
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
