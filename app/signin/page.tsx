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
        <svg width="32" height="22" viewBox="0 0 72 48" fill="none">
          <path d="M28 22C24 20 18 18 14 20C10 22 7 26 5 28C3 30 2 30 3 28C5 22 8 16 12 12C16 8 20 6 22 4C24 2 22 3 20 5C16 9 10 16 8 22C6 28 8 30 10 28C12 26 16 24 20 23C24 22 27 22 28 23" stroke="#C8F135" strokeWidth="1.6" />
          <path d="M26 24C22 24 16 26 10 30" stroke="#C8F135" strokeWidth="1.3" />
          <path d="M26 25C21 26 15 28 10 32" stroke="#C8F135" strokeWidth="1.3" />
          <path d="M27 26C22 27 17 30 13 33" stroke="#C8F135" strokeWidth="1.3" />
          <path d="M24 22C20 20 14 20 9 24" stroke="#C8F135" strokeWidth="1.3" />
          <path d="M22 20C18 17 13 15 9 18" stroke="#C8F135" strokeWidth="1.3" />
          <path d="M20 17C17 14 14 12 11 13" stroke="#C8F135" strokeWidth="1.3" />
          <path d="M44 22C48 20 54 18 58 20C62 22 65 26 67 28C69 30 70 30 69 28C67 22 64 16 60 12C56 8 52 6 50 4C48 2 50 3 52 5C56 9 62 16 64 22C66 28 64 30 62 28C60 26 56 24 52 23C48 22 45 22 44 23" stroke="#C8F135" strokeWidth="1.6" />
          <path d="M46 24C50 24 56 26 62 30" stroke="#C8F135" strokeWidth="1.3" />
          <path d="M46 25C51 26 57 28 62 32" stroke="#C8F135" strokeWidth="1.3" />
          <path d="M45 26C50 27 55 30 59 33" stroke="#C8F135" strokeWidth="1.3" />
          <path d="M48 22C52 20 58 20 63 24" stroke="#C8F135" strokeWidth="1.3" />
          <path d="M50 20C54 17 59 15 63 18" stroke="#C8F135" strokeWidth="1.3" />
          <path d="M52 17C55 14 58 12 61 13" stroke="#C8F135" strokeWidth="1.3" />
          <path d="M36 42C36 42 22 33 22 23.5C22 20 24.5 17 28 17C30.5 17 33 18.5 36 22C39 18.5 41.5 17 44 17C47.5 17 50 20 50 23.5C50 33 36 42 36 42Z" fill="#C8F135" stroke="#0A0A0A" strokeWidth="2" />
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
