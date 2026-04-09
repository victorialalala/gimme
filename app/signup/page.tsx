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
        <svg width="32" height="20" viewBox="0 0 72 44" fill="none">
          <path d="M28 22C26 20 20 16 14 14C8 12 3 13 2 16C1 19 3 22 7 24C11 26 18 27 24 27C20 25 14 22 10 20C7 18.5 6 17 7.5 16C9 15 13 15.5 17 17.5C21 19.5 25 22 28 25Z" fill="#C8F135" opacity="0.35" />
          <path d="M29 19C27 15 23 9 20 6C17 3 15 3 15 5C15 7 17 11 20 15C23 19 26 22 28 23C25 18 20 12 17 9C15 7 14 7.5 15 9C16 11 19 15 23 19C26 22 28 23 29 23Z" fill="#C8F135" opacity="0.35" />
          <path d="M28 25C22 27 12 27 6 24C2 22 1 18 3 15C5 12 10 12 16 14C22 16 27 20 29 23" stroke="#C8F135" strokeWidth="1.6" />
          <path d="M29 23C27 18 22 10 18 6C15 3 14 4 15 7C16 10 20 16 28 25" stroke="#C8F135" strokeWidth="1.6" />
          <path d="M44 22C46 20 52 16 58 14C64 12 69 13 70 16C71 19 69 22 65 24C61 26 54 27 48 27C52 25 58 22 62 20C65 18.5 66 17 64.5 16C63 15 59 15.5 55 17.5C51 19.5 47 22 44 25Z" fill="#C8F135" opacity="0.35" />
          <path d="M43 19C45 15 49 9 52 6C55 3 57 3 57 5C57 7 55 11 52 15C49 19 46 22 44 23C47 18 52 12 55 9C57 7 58 7.5 57 9C56 11 53 15 49 19C46 22 44 23 43 23Z" fill="#C8F135" opacity="0.35" />
          <path d="M44 25C50 27 60 27 66 24C70 22 71 18 69 15C67 12 62 12 56 14C50 16 45 20 43 23" stroke="#C8F135" strokeWidth="1.6" />
          <path d="M43 23C45 18 50 10 54 6C57 3 58 4 57 7C56 10 52 16 44 25" stroke="#C8F135" strokeWidth="1.6" />
          <path d="M36 40C36 40 23 31 23 22.5C23 19.5 25.3 17 28 17C30.3 17 32.8 18.5 36 22C39.2 18.5 41.7 17 44 17C46.7 17 49 19.5 49 22.5C49 31 36 40 36 40Z" fill="#C8F135" stroke="#0A0A0A" strokeWidth="2" />
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
