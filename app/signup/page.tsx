"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setCheckEmail(true);
    }
  }

  if (checkEmail) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-6" style={{ background: "#0A0A0A" }}>
        <div className="flex w-full max-w-sm flex-col items-center gap-6 text-center">
          {/* Email icon */}
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full"
            style={{ background: "#141414", border: "1px solid #222222" }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C8F135" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </div>

          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: "var(--font-space)", color: "#F5F5F0" }}
          >
            Check your email
          </h1>
          <p
            className="text-sm font-light leading-relaxed"
            style={{ fontFamily: "var(--font-inter)", color: "#666660" }}
          >
            We sent a confirmation link to<br />
            <span style={{ color: "#F5F5F0" }}>{email}</span>
          </p>
          <p
            className="text-xs font-light"
            style={{ fontFamily: "var(--font-inter)", color: "#666660" }}
          >
            Click the link to activate your account, then come back here.
          </p>

          <Link
            href="/signin"
            className="mt-4 block w-full rounded-full py-4 text-center text-xs font-semibold uppercase tracking-[0.2em] transition-opacity hover:opacity-85"
            style={{ fontFamily: "var(--font-space)", background: "#C8F135", color: "#0A0A0A" }}
          >
            Go to Sign In
          </Link>
        </div>
      </main>
    );
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
            Create Account
          </h2>
          <p
            className="mt-2 text-sm font-light"
            style={{ fontFamily: "var(--font-inter)", color: "#666660" }}
          >
            Start saving the things you love.
          </p>
        </div>

        <form onSubmit={handleSignUp} className="flex flex-col gap-3">
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
            placeholder="Password (min 6 characters)"
            required
            minLength={6}
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
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>
      </section>

      {/* Footer */}
      <footer className="flex flex-col items-center gap-3">
        <p className="text-sm" style={{ fontFamily: "var(--font-inter)", color: "#666660" }}>
          Already have an account?{" "}
          <Link href="/signin" className="font-medium underline underline-offset-2" style={{ color: "#C8F135" }}>
            Sign In
          </Link>
        </p>
        <p
          className="text-center text-[10px] leading-relaxed"
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
