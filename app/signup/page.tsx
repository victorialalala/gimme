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

  async function handleGoogleSignIn() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/onboarding",
      },
    });
    if (error) setError(error.message);
  }

  if (checkEmail) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6">
        <div className="flex w-full max-w-sm flex-col items-center gap-6 text-center">
          {/* Email icon */}
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full"
            style={{ background: "#FDEBED" }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#E63946" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </div>

          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: "var(--font-space)", color: "#1A1A1A" }}
          >
            Check your email
          </h1>
          <p
            className="text-sm font-light leading-relaxed"
            style={{ fontFamily: "var(--font-inter)", color: "#8A8A8A" }}
          >
            We sent a confirmation link to<br />
            <span style={{ color: "#1A1A1A" }}>{email}</span>
          </p>
          <p
            className="text-xs font-light"
            style={{ fontFamily: "var(--font-inter)", color: "#C4C4C4" }}
          >
            Click the link to activate your account, then come back here.
          </p>

          <Link
            href="/signin"
            className="mt-4 block w-full rounded-full py-4 text-center text-xs font-semibold uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-85"
            style={{ fontFamily: "var(--font-space)", background: "#E63946" }}
          >
            Go to Sign In
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between bg-white px-6 py-14">

      {/* Header */}
      <header className="flex flex-col items-center gap-3">
        <h1
          className="font-display text-lg font-bold uppercase tracking-[0.15em]"
          style={{ color: "#1A1A1A" }}
        >
          GIMME
        </h1>
        <div className="h-1.5 w-1.5 rounded-full" style={{ background: "#E63946" }} />
      </header>

      {/* Form */}
      <section className="flex w-full max-w-sm flex-col gap-6">
        <div className="text-center">
          <h2
            className="text-2xl font-bold"
            style={{ fontFamily: "var(--font-space)", color: "#1A1A1A" }}
          >
            Create Account
          </h2>
          <p
            className="mt-2 text-sm font-light"
            style={{ fontFamily: "var(--font-inter)", color: "#8A8A8A" }}
          >
            Start saving the things you love.
          </p>
        </div>

        {/* Google button */}
        <button
          onClick={handleGoogleSignIn}
          className="flex w-full items-center justify-center gap-3 rounded-full border py-4 text-xs font-medium uppercase tracking-[0.15em] transition-colors hover:bg-[#FAFAFA]"
          style={{ fontFamily: "var(--font-space)", borderColor: "#F0F0F0", color: "#1A1A1A" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="h-px flex-1" style={{ background: "#F0F0F0" }} />
          <span className="text-[10px] uppercase tracking-[0.15em]" style={{ fontFamily: "var(--font-space)", color: "#C4C4C4" }}>
            or
          </span>
          <div className="h-px flex-1" style={{ background: "#F0F0F0" }} />
        </div>

        {/* Email form */}
        <form onSubmit={handleSignUp} className="flex flex-col gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            required
            className="w-full rounded-xl py-4 px-4 text-sm outline-none"
            style={{ fontFamily: "var(--font-inter)", background: "#FAFAFA", border: "1px solid #F0F0F0", color: "#1A1A1A" }}
            onFocus={(e) => (e.target.style.borderColor = "#E63946")}
            onBlur={(e) => (e.target.style.borderColor = "#F0F0F0")}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (min 6 characters)"
            required
            minLength={6}
            className="w-full rounded-xl py-4 px-4 text-sm outline-none"
            style={{ fontFamily: "var(--font-inter)", background: "#FAFAFA", border: "1px solid #F0F0F0", color: "#1A1A1A" }}
            onFocus={(e) => (e.target.style.borderColor = "#E63946")}
            onBlur={(e) => (e.target.style.borderColor = "#F0F0F0")}
          />

          {error && (
            <p className="text-xs text-center" style={{ fontFamily: "var(--font-inter)", color: "#E63946" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full py-4 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-85 disabled:opacity-50"
            style={{ fontFamily: "var(--font-space)", background: "#E63946" }}
          >
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>
      </section>

      {/* Footer */}
      <footer className="flex flex-col items-center gap-3">
        <p className="text-sm" style={{ fontFamily: "var(--font-inter)", color: "#8A8A8A" }}>
          Already have an account?{" "}
          <Link href="/signin" className="font-medium underline underline-offset-2" style={{ color: "#E63946" }}>
            Sign In
          </Link>
        </p>
        <p
          className="text-center text-[10px] leading-relaxed"
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
