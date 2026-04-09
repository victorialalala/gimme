"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      const onboarded = localStorage.getItem("gimme-onboarded");
      router.push(onboarded ? "/home" : "/onboarding");
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between px-6 py-14" style={{ background: "#0A0A0A" }}>

      {/* Header */}
      <header className="flex flex-col items-center gap-3">
        <h1
          className="font-display text-lg font-bold uppercase tracking-[0.15em]"
          style={{ color: "#F5F5F0" }}
        >
          GIMME
        </h1>
        <svg width="28" height="18" viewBox="0 0 64 40" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M24 18C20 14 12 10 4 12C2 12.6 1.5 14 2.5 15C4 16.5 8 16 12 15C16 14 21 14.5 24 17" stroke="#C8F135" strokeWidth="1.8" />
          <path d="M24 20C19 17 11 14 4 17C2 17.8 1.8 19 3 19.8C5 21 9 20 13 18.5C17 17 21 17.5 24 19" stroke="#C8F135" strokeWidth="1.8" />
          <path d="M24 22C19 20 12 18.5 6 21C4.5 21.7 4.5 23 5.5 23.5C7.5 24.5 11 23 15 21.5C19 20 22 20.5 24 22" stroke="#C8F135" strokeWidth="1.8" />
          <path d="M40 18C44 14 52 10 60 12C62 12.6 62.5 14 61.5 15C60 16.5 56 16 52 15C48 14 43 14.5 40 17" stroke="#C8F135" strokeWidth="1.8" />
          <path d="M40 20C45 17 53 14 60 17C62 17.8 62.2 19 61 19.8C59 21 55 20 51 18.5C47 17 43 17.5 40 19" stroke="#C8F135" strokeWidth="1.8" />
          <path d="M40 22C45 20 52 18.5 58 21C59.5 21.7 59.5 23 58.5 23.5C56.5 24.5 53 23 49 21.5C45 20 42 20.5 40 22" stroke="#C8F135" strokeWidth="1.8" />
          <path d="M32 36C32 36 20 28 20 20C20 17 22 14.5 25 14.5C27.2 14.5 29.5 16 32 19C34.5 16 36.8 14.5 39 14.5C42 14.5 44 17 44 20C44 28 32 36 32 36Z" fill="#C8F135" stroke="none" />
        </svg>
      </header>

      {/* Form */}
      <section className="flex w-full max-w-sm flex-col gap-6">
        <div className="text-center">
          <h2
            className="text-2xl font-bold"
            style={{ fontFamily: "var(--font-space)", color: "#F5F5F0" }}
          >
            Welcome Back
          </h2>
          <p
            className="mt-2 text-sm font-light"
            style={{ fontFamily: "var(--font-inter)", color: "#666660" }}
          >
            Sign in to see your saved items.
          </p>
        </div>

        <form onSubmit={handleSignIn} className="flex flex-col gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            required
            className="w-full rounded-xl py-4 px-4 text-sm outline-none transition-colors"
            style={{ fontFamily: "var(--font-inter)", background: "#141414", border: "1px solid #222222", color: "#F5F5F0" }}
            onFocus={(e) => (e.target.style.borderColor = "#C8F135")}
            onBlur={(e) => (e.target.style.borderColor = "#222222")}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="w-full rounded-xl py-4 px-4 text-sm outline-none transition-colors"
            style={{ fontFamily: "var(--font-inter)", background: "#141414", border: "1px solid #222222", color: "#F5F5F0" }}
            onFocus={(e) => (e.target.style.borderColor = "#C8F135")}
            onBlur={(e) => (e.target.style.borderColor = "#222222")}
          />

          {error && (
            <p className="text-xs text-center" style={{ fontFamily: "var(--font-inter)", color: "#E63946" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full py-4 text-xs font-semibold uppercase tracking-[0.2em] transition-opacity hover:opacity-85 disabled:opacity-50"
            style={{ fontFamily: "var(--font-space)", background: "#C8F135", color: "#0A0A0A" }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </section>

      {/* Footer */}
      <footer className="flex flex-col items-center gap-3">
        <p className="text-sm" style={{ fontFamily: "var(--font-inter)", color: "#666660" }}>
          Don&rsquo;t have an account?{" "}
          <Link href="/signup" className="font-medium underline underline-offset-2" style={{ color: "#C8F135" }}>
            Create one
          </Link>
        </p>
      </footer>
    </main>
  );
}
