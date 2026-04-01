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
  title: "GIMME — Shazam for things you want.",
  description: "See it. Snap it. Save it. Buy it.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable} h-full`}>
      <head>
        <Script
          src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"
          strategy="beforeInteractive"
        />
      </head>
      <body className="h-full bg-white text-[#1A1A1A] antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
