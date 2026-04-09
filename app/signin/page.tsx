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
        <svg width="20" height="14" viewBox="0 0 48 28" fill="none" stroke="#C8F135" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 12C14 10 8 8 2 10C5 7 10 6 14 7" />
          <path d="M18 14C13 13 7 12 1 15C4 11 9 10 14 11" />
          <path d="M17 16C12 16 6 16 1 20C4 16 9 14 14 15" />
          <path d="M30 12C34 10 40 8 46 10C43 7 38 6 34 7" />
          <path d="M30 14C35 13 41 12 47 15C44 11 39 10 34 11" />
          <path d="M31 16C36 16 42 16 47 20C44 16 39 14 34 15" />
          <path d="M24 24C24 24 16 19 16 13.5C16 11.5 17.5 10 19.5 10C21 10 22.3 10.9 24 12.5C25.7 10.9 27 10 28.5 10C30.5 10 32 11.5 32 13.5C32 19 24 24 24 24Z" />
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
