import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen px-6 py-12" style={{ background: "#0A0A0A" }}>
      <div className="mx-auto max-w-lg">
        {/* Header */}
        <Link href="/" className="inline-block mb-8 text-[10px] font-medium uppercase tracking-[0.15em]" style={{ fontFamily: "var(--font-space)", color: "#666660" }}>
          ← Back
        </Link>

        <h1 className="text-2xl font-bold uppercase tracking-[0.08em] mb-2" style={{ fontFamily: "var(--font-space)", color: "#F5F5F0" }}>
          Privacy Policy
        </h1>
        <p className="text-[10px] uppercase tracking-[0.15em] mb-8" style={{ fontFamily: "var(--font-space)", color: "#666660" }}>
          Last updated: April 9, 2026
        </p>

        <div className="flex flex-col gap-6 text-sm font-light leading-relaxed" style={{ fontFamily: "var(--font-inter)", color: "#999994" }}>

          <section>
            <h2 className="text-xs font-semibold uppercase tracking-[0.12em] mb-2" style={{ fontFamily: "var(--font-space)", color: "#F5F5F0" }}>
              1. Information We Collect
            </h2>
            <p className="mb-2">
              <strong style={{ color: "#F5F5F0" }}>Account information:</strong> When you create an account, we collect your email address and an encrypted password.
            </p>
            <p className="mb-2">
              <strong style={{ color: "#F5F5F0" }}>Photos:</strong> When you use the camera feature, your photos are processed to identify products. Captured images may be stored in your personal collection if you choose to save an item.
            </p>
            <p className="mb-2">
              <strong style={{ color: "#F5F5F0" }}>Saved items:</strong> We store information about products you save, including product name, brand, price, and the photo you captured.
            </p>
            <p>
              <strong style={{ color: "#F5F5F0" }}>Usage data:</strong> We may collect anonymous usage data such as pages visited and features used to improve the App.
            </p>
          </section>

          <section>
            <h2 className="text-xs font-semibold uppercase tracking-[0.12em] mb-2" style={{ fontFamily: "var(--font-space)", color: "#F5F5F0" }}>
              2. How We Use Your Information
            </h2>
            <p>
              We use your information to: provide product identification and price comparison services, maintain your saved collections, improve the App&rsquo;s accuracy and performance, and communicate with you about your account. We do not sell your personal information to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xs font-semibold uppercase tracking-[0.12em] mb-2" style={{ fontFamily: "var(--font-space)", color: "#F5F5F0" }}>
              3. Third-Party Services
            </h2>
            <p className="mb-2">
              To provide our services, we share limited data with the following third-party providers:
            </p>
            <p className="mb-1">
              <strong style={{ color: "#F5F5F0" }}>Supabase</strong> — Hosts our database and stores your account data and saved items.
            </p>
            <p className="mb-1">
              <strong style={{ color: "#F5F5F0" }}>Google (via SerpAPI)</strong> — Processes product images for visual identification and provides pricing data. Temporarily uploaded images are deleted after processing.
            </p>
            <p className="mb-1">
              <strong style={{ color: "#F5F5F0" }}>OpenAI</strong> — May process product images for identification when visual search results are inconclusive. Images are sent via API and are not stored by OpenAI for training purposes.
            </p>
            <p>
              <strong style={{ color: "#F5F5F0" }}>Skimlinks</strong> — Provides affiliate link tracking. When you click a retailer link, Skimlinks may set cookies to track the referral. See Skimlinks&rsquo; privacy policy for details.
            </p>
          </section>

          <section>
            <h2 className="text-xs font-semibold uppercase tracking-[0.12em] mb-2" style={{ fontFamily: "var(--font-space)", color: "#F5F5F0" }}>
              4. Affiliate Links & Cookies
            </h2>
            <p>
              Gimme earns commissions through affiliate links powered by Skimlinks. When you tap a retailer link, your click may be redirected through an affiliate tracking service before reaching the retailer. This may involve cookies being set on your device by the retailer or affiliate network. These cookies are used solely for purchase attribution and do not give Gimme access to your browsing history or personal data on retailer websites.
            </p>
          </section>

          <section>
            <h2 className="text-xs font-semibold uppercase tracking-[0.12em] mb-2" style={{ fontFamily: "var(--font-space)", color: "#F5F5F0" }}>
              5. Data Storage & Security
            </h2>
            <p>
              Your data is stored securely using Supabase with row-level security policies. Passwords are encrypted and never stored in plain text. We use HTTPS for all data transmission. Temporarily uploaded images for product identification are automatically deleted after processing.
            </p>
          </section>

          <section>
            <h2 className="text-xs font-semibold uppercase tracking-[0.12em] mb-2" style={{ fontFamily: "var(--font-space)", color: "#F5F5F0" }}>
              6. Your Rights
            </h2>
            <p>
              You have the right to: access your personal data, delete your account and all associated data, export your saved items, and opt out of non-essential cookies. To exercise any of these rights, contact us at the email below.
            </p>
          </section>

          <section>
            <h2 className="text-xs font-semibold uppercase tracking-[0.12em] mb-2" style={{ fontFamily: "var(--font-space)", color: "#F5F5F0" }}>
              7. Children&rsquo;s Privacy
            </h2>
            <p>
              Gimme is not intended for users under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected data from a child under 13, we will delete it promptly.
            </p>
          </section>

          <section>
            <h2 className="text-xs font-semibold uppercase tracking-[0.12em] mb-2" style={{ fontFamily: "var(--font-space)", color: "#F5F5F0" }}>
              8. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of significant changes by posting a notice in the App. Continued use after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-xs font-semibold uppercase tracking-[0.12em] mb-2" style={{ fontFamily: "var(--font-space)", color: "#F5F5F0" }}>
              9. Contact
            </h2>
            <p>
              Questions about your privacy? Reach us at{" "}
              <a href="mailto:hello@gimme.app" className="underline underline-offset-2" style={{ color: "#C8F135" }}>
                hello@gimme.app
              </a>
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}
