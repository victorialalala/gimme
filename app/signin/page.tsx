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
        <svg width="22" height="12" viewBox="0 0 44 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 11C13 9 8 7.5 3 9C1.5 9.5 1 10.5 1.5 11.5C2 12.5 4 13 7 12.5C10 12 14 12 16 13" stroke="#C8F135" strokeWidth="1.6" fill="none" />
          <path d="M28 11C31 9 36 7.5 41 9C42.5 9.5 43 10.5 42.5 11.5C42 12.5 40 13 37 12.5C34 12 30 12 28 13" stroke="#C8F135" strokeWidth="1.6" fill="none" />
          <path d="M22 21C22 21 14 16 14 11.5C14 9.5 15.5 8 17.5 8C19 8 20.5 9 22 11C23.5 9 25 8 26.5 8C28.5 8 30 9.5 30 11.5C30 16 22 21 22 21Z" fill="#C8F135" stroke="none" />
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
