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
          <path d="M26 26C22 28 14 30 8 28C4 26.5 4 24 7 23C10 22 16 23 22 25" stroke="#C8F135" strokeWidth="1.6" />
          <path d="M26 23C21 23 13 23 7 20C3 18 3.5 15.5 6.5 15.5C10 15.5 16 18 23 22" stroke="#C8F135" strokeWidth="1.6" />
          <path d="M27 20C23 18 16 14 11 11C8 9 8.5 7 11 7.5C14 8 20 12 25 18" stroke="#C8F135" strokeWidth="1.6" />
          <path d="M29 18C26 14 22 9 20 5C18.5 2.5 20 1.5 22 3C24.5 5.5 27 11 29 17" stroke="#C8F135" strokeWidth="1.6" />
          <path d="M46 26C50 28 58 30 64 28C68 26.5 68 24 65 23C62 22 56 23 50 25" stroke="#C8F135" strokeWidth="1.6" />
          <path d="M46 23C51 23 59 23 65 20C69 18 68.5 15.5 65.5 15.5C62 15.5 56 18 49 22" stroke="#C8F135" strokeWidth="1.6" />
          <path d="M45 20C49 18 56 14 61 11C64 9 63.5 7 61 7.5C58 8 52 12 47 18" stroke="#C8F135" strokeWidth="1.6" />
          <path d="M43 18C46 14 50 9 52 5C53.5 2.5 52 1.5 50 3C47.5 5.5 45 11 43 17" stroke="#C8F135" strokeWidth="1.6" />
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
