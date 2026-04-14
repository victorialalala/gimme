"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/signin`,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between px-6 py-14" style={{ background: "#0A0A0A" }}>
      <header className="flex flex-col items-center gap-3">
        <h1 className="font-display text-lg font-bold uppercase tracking-[0.15em]" style={{ color: "#F5F5F0" }}>
          GIMME
        </h1>
      </header>

      <section className="flex w-full max-w-sm flex-col gap-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold" style={{ fontFamily: "var(--font-space)", color: "#F5F5F0" }}>
            {sent ? "Check your email" : "Reset Password"}
          </h2>
          <p className="mt-2 text-sm font-light" style={{ fontFamily: "var(--font-inter)", color: "#666660" }}>
            {sent
              ? `We sent a reset link to ${email}`
              : "Enter your email and we\u2019ll send you a reset link."}
          </p>
        </div>

        {!sent && (
          <form onSubmit={handleReset} className="flex flex-col gap-3">
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
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        )}

        {sent && (
          <Link
            href="/signin"
            className="w-full rounded-full py-4 text-center text-xs font-semibold uppercase tracking-[0.2em] transition-opacity hover:opacity-85"
            style={{ fontFamily: "var(--font-space)", background: "#C8F135", color: "#0A0A0A" }}
          >
            Back to Sign In
          </Link>
        )}
      </section>

      <footer>
        <Link href="/signin" className="text-sm font-medium underline underline-offset-2" style={{ fontFamily: "var(--font-inter)", color: "#C8F135" }}>
          Back to Sign In
        </Link>
      </footer>
    </main>
  );
}
