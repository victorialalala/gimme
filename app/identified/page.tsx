"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { useAuth } from "../components/AuthProvider";
import { supabase } from "../lib/supabase";

type Product = {
  brand: string;
  name: string;
  category: string;
  description: string;
  estimated_price: string;
  confidence: number;
};

type Retailer = {
  retailer: string;
  title: string;
  price: string;
  price_num: number;
  link: string;
  thumbnail: string | null;
  tag?: string;
};

const PASTEL_BGS: Record<string, string> = {
  watches: "#F5F0EB",
  bags: "#EBF0F5",
  sneakers: "#F0F5EB",
  shoes: "#F0F5EB",
  jewelry: "#F5EBF0",
  clothing: "#F0EBEB",
  accessories: "#EBEBF0",
  electronics: "#EBF0F5",
  home: "#F5F2EB",
  other: "#FAFAFA",
};

function IdentifiedContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [stage, setStage] = useState<"scanning" | "found" | "error">("scanning");
  const [product, setProduct] = useState<Product | null>(null);
  const [retailers, setRetailers] = useState<Retailer[]>([]);
  const [imageData, setImageData] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const base64 = sessionStorage.getItem("gimme-capture");
    const searchQuery = sessionStorage.getItem("gimme-search-query");

    if (base64) {
      // We have a photo — send it to GPT-4o
      setImageData(base64);
      identifyFromImage(base64);
    } else if (searchQuery) {
      // Text search — use GPT-4o to parse the query into a product
      identifyFromText(searchQuery);
    } else {
      // No image or query — go back
      router.replace("/capture");
    }
  }, [router]);

  async function identifyFromImage(base64: string) {
    try {
      const res = await fetch("/api/identify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64 }),
      });

      if (!res.ok) throw new Error("Identification failed");

      const data: Product = await res.json();
      setProduct(data);
      setStage("found");

      // Now fetch prices in the background
      fetchPrices(data.brand, data.name);
    } catch (err) {
      console.error("Identify error:", err);
      setStage("error");
    }
  }

  async function identifyFromText(query: string) {
    // For text search, we create a simple product from the query
    // and go straight to price search
    const parts = query.split(" ");
    const mockProduct: Product = {
      brand: parts[0] || "Unknown",
      name: query,
      category: "other",
      description: query,
      estimated_price: "Searching…",
      confidence: 70,
    };
    setProduct(mockProduct);
    setStage("found");
    fetchPrices(mockProduct.brand, mockProduct.name);
  }

  async function fetchPrices(brand: string, name: string) {
    try {
      const res = await fetch("/api/prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand, name }),
      });

      if (!res.ok) return; // Silently fail — prices are optional

      const data = await res.json();
      if (data.retailers && data.retailers.length > 0) {
        setRetailers(data.retailers);
        // Update estimated price with real best price
        if (product) {
          setProduct((prev) =>
            prev ? { ...prev, estimated_price: data.retailers[0].price } : prev
          );
        }
      }
    } catch (err) {
      console.error("Price fetch error:", err);
      // Not critical — item still identified
    }
  }

  async function handleSave() {
    if (!user || !product || saving) return;
    setSaving(true);

    try {
      const { error } = await supabase.from("saved_items").insert({
        user_id: user.id,
        name: product.name,
        brand: product.brand,
        price: product.estimated_price,
        collection: product.category,
        bg_color: PASTEL_BGS[product.category] || PASTEL_BGS.other,
        description: product.description,
        image_url: imageData ? null : null, // We'll add image upload later
      });

      if (error) throw error;
      setSaved(true);

      // Go to home after a beat
      setTimeout(() => router.push("/home"), 1200);
    } catch (err) {
      console.error("Save error:", err);
      setSaving(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4">
        <Link href="/capture" className="text-[#8A8A8A] hover:text-[#1A1A1A] transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M5 12l7 7M5 12l7-7" />
          </svg>
        </Link>
        <p className="font-display text-sm font-bold uppercase tracking-[0.1em]" style={{ color: "#1A1A1A" }}>
          GIMME
        </p>
        <div className="w-5" />
      </header>

      {stage === "scanning" && (
        /* ── Scanning state ── */
        <div className="flex flex-1 flex-col items-center justify-center px-6">
          <div
            className="relative flex h-[280px] w-full max-w-sm items-center justify-center overflow-hidden rounded-3xl"
            style={{ background: "#F5F0EB" }}
          >
            {/* Show the captured image while scanning */}
            {imageData && (
              <img
                src={`data:image/jpeg;base64,${imageData}`}
                alt="Captured"
                className="h-full w-full object-cover"
              />
            )}

            {/* Scan shimmer overlay */}
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(180deg, transparent 0%, rgba(230,57,70,0.08) 50%, transparent 100%)",
                animation: "shimmer 2s ease-in-out infinite",
              }}
            />

            {/* Scanning label */}
            <div
              className="absolute bottom-4 left-4 right-4 flex items-center gap-2 rounded-xl px-4 py-3"
              style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(8px)" }}
            >
              <div className="h-3 w-3 rounded-full" style={{ background: "#E63946", animation: "pulse 1.5s ease infinite" }} />
              <p className="text-xs font-medium" style={{ fontFamily: "var(--font-space)", color: "#1A1A1A" }}>
                Identifying item…
              </p>
            </div>
          </div>

          <p className="mt-6 text-center text-xs font-light" style={{ fontFamily: "var(--font-inter)", color: "#C4C4C4" }}>
            Asking GPT-4o to identify this item…
          </p>
        </div>
      )}

      {stage === "error" && (
        /* ── Error state ── */
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full mb-4" style={{ background: "#FDEBED" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E63946" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" />
            </svg>
          </div>
          <h2 className="text-lg font-bold mb-2" style={{ fontFamily: "var(--font-space)", color: "#1A1A1A" }}>
            Couldn&rsquo;t identify
          </h2>
          <p className="text-sm font-light mb-6" style={{ fontFamily: "var(--font-inter)", color: "#8A8A8A" }}>
            Try a clearer photo or use the search tab instead.
          </p>
          <button
            onClick={() => router.push("/capture")}
            className="rounded-full px-8 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white"
            style={{ fontFamily: "var(--font-space)", background: "#E63946" }}
          >
            Try Again
          </button>
        </div>
      )}

      {stage === "found" && product && (
        /* ── Found state ── */
        <div className="flex flex-1 flex-col items-center px-6 py-4 pb-12">
          {/* Match image */}
          <div
            className="fade-up relative flex h-[260px] w-full max-w-sm items-center justify-center overflow-hidden rounded-3xl"
            style={{ background: PASTEL_BGS[product.category] || "#F5F0EB" }}
          >
            {imageData ? (
              <img
                src={`data:image/jpeg;base64,${imageData}`}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#C4C4C4" strokeWidth="0.8">
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
              </svg>
            )}

            {/* Confidence badge */}
            <div
              className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full px-3 py-1.5"
              style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(8px)" }}
            >
              <div
                className="h-2 w-2 rounded-full"
                style={{ background: product.confidence >= 70 ? "#22C55E" : product.confidence >= 40 ? "#F59E0B" : "#EF4444" }}
              />
              <span className="text-[10px] font-medium" style={{ fontFamily: "var(--font-space)", color: "#1A1A1A" }}>
                {product.confidence}% match
              </span>
            </div>
          </div>

          {/* Item info */}
          <div className="fade-up-1 mt-6 w-full max-w-sm">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em]" style={{ fontFamily: "var(--font-space)", color: "#E63946" }}>
              Identified
            </p>
            <h2 className="mt-1 text-2xl font-bold" style={{ fontFamily: "var(--font-space)", color: "#1A1A1A" }}>
              {product.name}
            </h2>
            <p className="mt-0.5 text-sm" style={{ fontFamily: "var(--font-inter)", color: "#8A8A8A" }}>
              {product.brand} · {product.description}
            </p>
            <p className="mt-3 text-2xl font-bold" style={{ fontFamily: "var(--font-space)", color: "#1A1A1A" }}>
              {product.estimated_price}
            </p>
            <p className="text-xs" style={{ fontFamily: "var(--font-inter)", color: "#C4C4C4" }}>
              {retailers.length > 0
                ? `${retailers.length} retailers found`
                : "Searching for prices…"}
            </p>
          </div>

          {/* Retailers (if loaded) */}
          {retailers.length > 0 && (
            <div className="fade-up-2 mt-5 w-full max-w-sm">
              <div className="flex flex-col gap-2">
                {retailers.map((r, i) => (
                  <a
                    key={i}
                    href={r.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-2xl px-4 py-3 transition-colors hover:bg-[#FAFAFA]"
                    style={{
                      border: r.tag ? "1.5px solid #E63946" : "1px solid #F0F0F0",
                      background: r.tag ? "#FDEBED" : "white",
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate" style={{ fontFamily: "var(--font-space)", color: "#1A1A1A" }}>
                          {r.retailer}
                        </p>
                        {r.tag && (
                          <span
                            className="flex-shrink-0 rounded-full px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.08em]"
                            style={{ fontFamily: "var(--font-space)", background: "#E63946", color: "#FFFFFF" }}
                          >
                            {r.tag}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="ml-3 text-base font-bold flex-shrink-0" style={{ fontFamily: "var(--font-space)", color: r.tag ? "#E63946" : "#1A1A1A" }}>
                      {r.price}
                    </p>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="fade-up-2 mt-6 flex w-full max-w-sm flex-col gap-3">
            <button
              onClick={handleSave}
              disabled={saving || saved}
              className="w-full rounded-full py-4 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-85 disabled:opacity-60"
              style={{ fontFamily: "var(--font-space)", background: saved ? "#22C55E" : "#E63946" }}
            >
              {saved ? "Saved!" : saving ? "Saving…" : "Save to Collection"}
            </button>
            <button
              onClick={() => {
                sessionStorage.removeItem("gimme-capture");
                sessionStorage.removeItem("gimme-search-query");
                router.push("/capture");
              }}
              className="w-full py-3 text-xs font-light underline underline-offset-4 transition-opacity hover:opacity-70"
              style={{ fontFamily: "var(--font-inter)", color: "#C4C4C4" }}
            >
              Not the right item? Try again
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default function IdentifiedPage() {
  return (
    <Suspense>
      <IdentifiedContent />
    </Suspense>
  );
}
