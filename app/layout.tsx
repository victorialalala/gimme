import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import Script from "next/script";
import AuthProvider from "./components/AuthProvider";
import "./globals.css";

// Bold, geometric, fashion-magazine energy
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Clean body text
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  title: "GIMME",
  description: "See it. Snap it. Save it. Buy it.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable} h-full`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0A0A0A" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <Script
          src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"
          strategy="beforeInteractive"
        />
        {/* Skimlinks affiliate link tracking — converts outbound retailer links to tracked affiliate links */}
        <Script
          src="https://s.skimresources.com/js/301271X1789210.skimlinks.js"
          strategy="afterInteractive"
        />
      </head>
      <body className="h-full antialiased" style={{ background: "#0A0A0A", color: "#F5F5F0" }}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
