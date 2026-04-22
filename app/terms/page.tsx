import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen px-6 py-12" style={{ background: "#0A0A0A" }}>
      <div className="mx-auto max-w-lg">
        {/* Header */}
        <Link href="/" className="inline-block mb-8 text-[10px] font-medium uppercase tracking-[0.15em]" style={{ fontFamily: "var(--font-space)", color: "#666660" }}>
          ← Back
        </Link>

        <h1 className="text-2xl font-bold uppercase tracking-[0.08em] mb-2" style={{ fontFamily: "var(--font-space)", color: "#F5F5F0" }}>
          Terms of Service
        </h1>
        <p className="text-[10px] uppercase tracking-[0.15em] mb-8" style={{ fontFamily: "var(--font-space)", color: "#666660" }}>
          Last updated: April 9, 2026
        </p>

        <div className="flex flex-col gap-6 text-sm font-light leading-relaxed" style={{ fontFamily: "var(--font-inter)", color: "#999994" }}>

          <section>
            <h2 className="text-xs font-semibold uppercase tracking-[0.12em] mb-2" style={{ fontFamily: "var(--font-space)", color: "#F5F5F0" }}>
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using Gimme (&ldquo;the App&rdquo;), you agree to be bound by these Terms of Service. If you do not agree, please do not use the App.
            </p>
          </section>

          <section>
            <h2 className="text-xs font-semibold uppercase tracking-[0.12em] mb-2" style={{ fontFamily: "var(--font-space)", color: "#F5F5F0" }}>
              2. Description of Service
            </h2>
            <p>
              Gimme is a visual product identification and price comparison service. You can photograph products, and we use image recognition technology to identify them and display pricing information from third-party retailers. Gimme does not sell products directly. All purchases are made through third-party retailer websites.
            </p>
          </section>

          <section>
            <h2 className="text-xs font-semibold uppercase tracking-[0.12em] mb-2" style={{ fontFamily: "var(--font-space)", color: "#F5F5F0" }}>
              3. Affiliate Disclosure
            </h2>
            <p>
              Gimme participates in affiliate marketing programs, including Skimlinks. When you click a retailer link and make a purchase, Gimme may earn a small commission at no additional cost to you. These commissions help support the App. Affiliate relationships do not influence which products or retailers are displayed — results are based solely on relevance and price.
            </p>
          </section>

          <section>
            <h2 className="text-xs font-semibold uppercase tracking-[0.12em] mb-2" style={{ fontFamily: "var(--font-space)", color: "#F5F5F0" }}>
              4. User Accounts
            </h2>
            <p>
              You must create an account to save items. You are responsible for maintaining the confidentiality of your login credentials and for all activity under your account. You must be at least 13 years old to use the App.
            </p>
          </section>

          <section>
            <h2 className="text-xs font-semibold uppercase tracking-[0.12em] mb-2" style={{ fontFamily: "var(--font-space)", color: "#F5F5F0" }}>
              5. User Content
            </h2>
            <p>
              Photos you capture through the App are temporarily processed for identification purposes and may be stored in your personal collection. You retain ownership of your photos. By using the App, you grant Gimme a limited license to process your images solely for the purpose of product identification.
            </p>
          </section>

          <section>
            <h2 className="text-xs font-semibold uppercase tracking-[0.12em] mb-2" style={{ fontFamily: "var(--font-space)", color: "#F5F5F0" }}>
              6. Accuracy of Information
            </h2>
            <p>
              Product identification, pricing, and availability information are provided by third-party services and may not always be accurate or up to date. Gimme makes no guarantees regarding the accuracy of product identification, pricing, or retailer availability. Always verify details on the retailer&rsquo;s website before making a purchase.
            </p>
          </section>

          <section>
            <h2 className="text-xs font-semibold uppercase tracking-[0.12em] mb-2" style={{ fontFamily: "var(--font-space)", color: "#F5F5F0" }}>
              7. Prohibited Use
            </h2>
            <p>
              You may not use the App to violate any laws, infringe on intellectual property rights, transmit harmful content, or attempt to reverse-engineer, modify, or exploit the App&rsquo;s services.
            </p>
          </section>

          <section>
            <h2 className="text-xs font-semibold uppercase tracking-[0.12em] mb-2" style={{ fontFamily: "var(--font-space)", color: "#F5F5F0" }}>
              8. Limitation of Liability
            </h2>
            <p>
              Gimme is provided &ldquo;as is&rdquo; without warranties of any kind. To the fullest extent permitted by law, Gimme shall not be liable for any indirect, incidental, or consequential damages arising from your use of the App, including but not limited to purchases made through third-party retailer links.
            </p>
          </section>

          <section>
            <h2 className="text-xs font-semibold uppercase tracking-[0.12em] mb-2" style={{ fontFamily: "var(--font-space)", color: "#F5F5F0" }}>
              9. Termination
            </h2>
            <p>
              We reserve the right to suspend or terminate your account at any time for violation of these Terms. You may delete your account at any time by contacting us.
            </p>
          </section>

          <section>
            <h2 className="text-xs font-semibold uppercase tracking-[0.12em] mb-2" style={{ fontFamily: "var(--font-space)", color: "#F5F5F0" }}>
              10. Changes to Terms
            </h2>
            <p>
              We may update these Terms from time to time. Continued use of the App after changes constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xs font-semibold uppercase tracking-[0.12em] mb-2" style={{ fontFamily: "var(--font-space)", color: "#F5F5F0" }}>
              11. Contact
            </h2>
            <p>
              Questions about these Terms? Reach us at{" "}
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
