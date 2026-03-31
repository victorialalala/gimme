import Link from "next/link";

export default function WelcomePage() {
  return (
    <main className="relative flex h-full min-h-screen flex-col items-center justify-between overflow-hidden bg-white px-6 py-14">

      {/* Top — empty space, lets the page breathe */}
      <div />

      {/* Center — the statement */}
      <section className="flex w-full max-w-sm flex-col items-center gap-7 text-center">

        {/* Wordmark */}
        <h1
          className="font-display text-[3.2rem] font-bold uppercase tracking-[0.12em] leading-none"
          style={{ color: "#1A1A1A" }}
        >
          GIMME
        </h1>

        {/* Coral dot — the brand mark */}
        <div className="h-2.5 w-2.5 rounded-full" style={{ background: "#E63946" }} />

        {/* Tagline */}
        <p
          className="max-w-[220px] text-sm font-light leading-relaxed"
          style={{ fontFamily: "var(--font-inter)", color: "#8A8A8A" }}
        >
          See it. Snap it. Save it.<br />
          Buy it when you&rsquo;re ready.
        </p>
      </section>

      {/* CTAs */}
      <footer className="flex w-full max-w-sm flex-col items-center gap-3">

        <Link
          href="/home"
          className="block w-full rounded-full py-4 text-center text-xs font-semibold uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-85 active:opacity-70"
          style={{ fontFamily: "var(--font-space)", background: "#E63946" }}
        >
          Get Started
        </Link>

        <Link
          href="/home"
          className="block w-full rounded-full border py-4 text-center text-xs font-medium uppercase tracking-[0.2em] transition-colors hover:bg-[#FAFAFA]"
          style={{ fontFamily: "var(--font-space)", borderColor: "#F0F0F0", color: "#1A1A1A" }}
        >
          Sign In
        </Link>

        <p
          className="mt-1 text-center text-[10px] leading-relaxed"
          style={{ fontFamily: "var(--font-inter)", color: "#C4C4C4" }}
        >
          By continuing you agree to our{" "}
          <span className="underline underline-offset-2">Terms</span> and{" "}
          <span className="underline underline-offset-2">Privacy Policy</span>
        </p>
      </footer>

    </main>
  );
}
