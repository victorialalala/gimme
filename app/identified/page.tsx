"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { useAuth } from "../components/AuthProvider";
import { supabase } from "../lib/supabase";

type Product = {
  brand: string;
  name: string;
  model: string;
  color: string;
  category: string;
  description: string;
  estimated_price: string;
  confidence: number;
  match_source: "lens" | "ai";
  search_query: string;
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

type SimilarItem = {
  title: string;
  brand: string;
  price: string;
  link: string;
  thumbnail: string;
};

function IdentifiedContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [stage, setStage] = useState<"scanning" | "found" | "similar" | "error">("scanning");
  const [product, setProduct] = useState<Product | null>(null);
  const [retailers, setRetailers] = useState<Retailer[]>([]);
  const [similarItems, setSimilarItems] = useState<SimilarItem[]>([]);
  const [imageData, setImageData] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pricesFailed, setPricesFailed] = useState(false);

  useEffect(() => {
    const base64 = localStorage.getItem("gimme-capture");

    if (!base64) {
      router.replace("/capture");
      return;
    }

    setImageData(base64);

    // Restore cached result if we already identified this capture
    const cached = localStorage.getItem("gimme-product");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setProduct(parsed);
        setStage("found");
        fetchPrices(parsed);
        return;
      } catch {
        // bad cache — fall through to re-identify
      }
    }

    identifyFromImage(base64);
  }, [router]);

  async function identifyFromImage(base64: string) {
    try {
      const res = await fetch("/api/identify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64 }),
      });

      if (!res.ok) throw new Error("Identification failed");

      const data = await res.json();
      const { similar_items, ...productData } = data;
      setProduct(productData as Product);
      localStorage.setItem("gimme-product", JSON.stringify(productData));

      // Low confidence + similar items available → show "You might also like"
      if (productData.confidence < 70 && similar_items && similar_items.length > 0) {
        setSimilarItems(similar_items);
        setStage("similar");
      } else {
        setStage("found");
        fetchPrices(productData as Product);
      }
    } catch (err) {
      console.error("Identify error:", err);
      setStage("error");
    }
  }

  async function fetchPrices(prod: Product) {
    try {
      const res = await fetch("/api/prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand: prod.brand,
          name: prod.name,
          model: prod.model,
          search_query: prod.search_query,
        }),
      });

      if (!res.ok) return;

      const data = await res.json();
      if (data.retailers && data.retailers.length > 0) {
        setRetailers(data.retailers);
        if (product) {
          setProduct((prev) =>
            prev ? { ...prev, estimated_price: data.retailers[0].price } : prev
          );
        }
      }
    } catch (err) {
      console.error("Price fetch error:", err);
      setPricesFailed(true);
    }
  }

  async function handleSave() {
    if (!user || !product || saving) return;
    setSaving(true);

    try {
      let imageUrl: string | null = null;

      if (imageData) {
        const fileName = `${user.id}/${Date.now()}.jpg`;
        const byteString = atob(imageData);
        const bytes = new Uint8Array(byteString.length);
        for (let i = 0; i < byteString.length; i++) {
          bytes[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: "image/jpeg" });

        const { error: uploadError } = await supabase.storage
          .from("item-images")
          .upload(fileName, blob, { contentType: "image/jpeg" });

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from("item-images")
            .getPublicUrl(fileName);
          imageUrl = urlData.publicUrl;
        } else {
          console.error("Upload error:", uploadError);
        }
      }

      const { error } = await supabase.from("saved_items").insert({
        user_id: user.id,
        name: product.name,
        brand: product.brand,
        price: product.estimated_price,
        collection: product.category,
        bg_color: "#141414",
        description: product.description,
        image_url: imageUrl,
      });

      if (error) throw error;
      setSaved(true);

      localStorage.removeItem("gimme-capture");
      localStorage.removeItem("gimme-product");

      setTimeout(() => router.push("/home"), 1200);
    } catch (err) {
      console.error("Save error:", err);
      setSaving(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col" style={{ background: "#0A0A0A" }}>
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4">
        <Link href="/capture" className="transition-colors" style={{ color: "#666660" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M5 12l7 7M5 12l7-7" />
          </svg>
        </Link>
        <p className="font-display text-sm font-bold uppercase tracking-[0.1em]" style={{ color: "#F5F5F0" }}>
          GIMME
        </p>
        <div className="w-5" />
      </header>

      {stage === "scanning" && (
        <div className="flex flex-1 flex-col items-center justify-center px-6">
          <div
            className="relative flex h-[280px] w-full max-w-sm items-center justify-center overflow-hidden rounded-3xl"
            style={{ background: "#141414" }}
          >
            {imageData && (
              <img
                src={`data:image/jpeg;base64,${imageData}`}
                alt="Captured"
                className="h-full w-full object-cover"
              />
            )}

            {/* Scan overlay */}
            <div className="absolute inset-0 scan-shimmer" />

            {/* Lime pulsing viewfinder brackets */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute left-4 top-4 h-6 w-6 border-l-2 border-t-2 rounded-tl-sm lime-pulse" style={{ borderColor: "#C8F135" }} />
              <div className="absolute right-4 top-4 h-6 w-6 border-r-2 border-t-2 rounded-tr-sm lime-pulse" style={{ borderColor: "#C8F135" }} />
              <div className="absolute bottom-4 left-4 h-6 w-6 border-l-2 border-b-2 rounded-bl-sm lime-pulse" style={{ borderColor: "#C8F135" }} />
              <div className="absolute bottom-4 right-4 h-6 w-6 border-r-2 border-b-2 rounded-br-sm lime-pulse" style={{ borderColor: "#C8F135" }} />
            </div>

            {/* Scanning label */}
            <div
              className="absolute bottom-4 left-4 right-4 flex items-center gap-2 rounded-xl px-4 py-3"
              style={{ background: "rgba(10,10,10,0.8)", backdropFilter: "blur(8px)" }}
            >
              <div className="h-0.5 w-8 overflow-hidden rounded-full" style={{ background: "#222222" }}>
                <div className="h-full w-1/3 rounded-full loading-bar" style={{ background: "#C8F135" }} />
              </div>
              <p className="text-[10px] font-medium uppercase tracking-[0.15em]" style={{ fontFamily: "var(--font-space)", color: "#F5F5F0" }}>
                Identifying...
              </p>
            </div>
          </div>

          <p className="mt-6 text-center text-[10px] font-medium uppercase tracking-[0.2em]" style={{ fontFamily: "var(--font-space)", color: "#666660" }}>
            Scanning product databases...
          </p>
        </div>
      )}

      {stage === "error" && (
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full mb-4" style={{ background: "#141414", border: "1px solid #222222" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E63946" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" />
            </svg>
          </div>
          <h2 className="text-lg font-bold mb-2" style={{ fontFamily: "var(--font-space)", color: "#F5F5F0" }}>
            Couldn&rsquo;t identify
          </h2>
          <p className="text-sm font-light mb-6" style={{ fontFamily: "var(--font-inter)", color: "#666660" }}>
            Try again or retake with better lighting.
          </p>
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <button
              onClick={() => { if (imageData) { setStage("scanning"); identifyFromImage(imageData); } }}
              className="w-full rounded-full px-8 py-3 text-xs font-semibold uppercase tracking-[0.2em]"
              style={{ fontFamily: "var(--font-space)", background: "#C8F135", color: "#0A0A0A" }}
            >
              Retry
            </button>
            <button
              onClick={() => router.push("/capture")}
              className="w-full py-3 text-xs font-light underline underline-offset-4 transition-opacity hover:opacity-70"
              style={{ fontFamily: "var(--font-inter)", color: "#666660" }}
            >
              Retake Photo
            </button>
          </div>
        </div>
      )}

      {stage === "similar" && (
        <div className="flex flex-1 flex-col items-center px-6 py-4 pb-12">
          {/* User's photo */}
          {imageData && (
            <div
              className="fade-up relative flex h-[200px] w-full max-w-sm items-center justify-center overflow-hidden rounded-3xl mb-6"
              style={{ background: "#141414" }}
            >
              <img
                src={`data:image/jpeg;base64,${imageData}`}
                alt="Your photo"
                className="h-full w-full object-cover opacity-60"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="rounded-full px-4 py-2" style={{ background: "rgba(10,10,10,0.85)", backdropFilter: "blur(8px)" }}>
                  <p className="text-[10px] font-medium uppercase tracking-[0.15em]" style={{ fontFamily: "var(--font-space)", color: "#666660" }}>
                    No exact match found
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Section label */}
          <div className="fade-up-1 w-full max-w-sm mb-4">
            <p className="text-[10px] font-medium uppercase tracking-[0.15em]" style={{ fontFamily: "var(--font-space)", color: "#C8F135" }}>
              You might also like
            </p>
          </div>

          {/* Similar items — editorial card layout */}
          <div className="fade-up-2 w-full max-w-sm flex flex-col gap-4">
            {similarItems.map((item, i) => (
              <a
                key={i}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group overflow-hidden rounded-2xl transition-transform active:scale-[0.98]"
                style={{ background: "#141414", border: "1px solid #222222" }}
              >
                {/* Large product image — crisp, editorial */}
                <div className="relative h-52 w-full overflow-hidden" style={{ background: "#1A1A1A" }}>
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    loading="eager"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    style={{ imageRendering: "auto", WebkitBackfaceVisibility: "hidden" }}
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.style.display = "none";
                    }}
                  />
                </div>

                {/* Info bar */}
                <div className="flex items-center justify-between px-4 py-3.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-medium uppercase tracking-[0.12em] mb-0.5" style={{ fontFamily: "var(--font-space)", color: "#C8F135" }}>
                      {item.brand}
                    </p>
                    <p className="text-sm font-medium truncate" style={{ fontFamily: "var(--font-space)", color: "#F5F5F0" }}>
                      {item.title}
                    </p>
                  </div>
                  <div className="ml-3 flex items-center gap-2 flex-shrink-0">
                    <p className="text-base font-bold" style={{ fontFamily: "var(--font-space)", color: "#F5F5F0" }}>
                      {item.price}
                    </p>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C8F135" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </a>
            ))}
          </div>

          <p className="mt-2.5 text-center text-[11px] font-light tracking-wide" style={{ fontFamily: "var(--font-inter)", color: "#444440" }}>
            Gimme may earn a small commission on purchases
          </p>

          {/* Try again */}
          <button
            onClick={() => {
              localStorage.removeItem("gimme-capture");
              localStorage.removeItem("gimme-product");
              router.push("/capture");
            }}
            className="mt-6 w-full max-w-sm rounded-full py-4 text-xs font-semibold uppercase tracking-[0.2em] transition-opacity hover:opacity-85"
            style={{ fontFamily: "var(--font-space)", background: "#C8F135", color: "#0A0A0A" }}
          >
            Try Again
          </button>
        </div>
      )}

      {stage === "found" && product && (
        <div className="flex flex-1 flex-col items-center px-6 py-4 pb-12">
          {/* Match image */}
          <div
            className="fade-up relative flex h-[260px] w-full max-w-sm items-center justify-center overflow-hidden rounded-3xl"
            style={{ background: "#141414" }}
          >
            {imageData ? (
              <img
                src={`data:image/jpeg;base64,${imageData}`}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#222222" strokeWidth="0.8">
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
              </svg>
            )}

            {/* Confidence badge */}
            <div
              className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full px-3 py-1.5"
              style={{ background: "rgba(10,10,10,0.8)", backdropFilter: "blur(8px)" }}
            >
              <div
                className="h-2 w-2 rounded-full"
                style={{ background: product.confidence >= 70 ? "#C8F135" : product.confidence >= 40 ? "#C8F135" : "#666660", opacity: product.confidence >= 70 ? 1 : 0.5 }}
              />
              <span className="text-[10px] font-medium uppercase tracking-[0.08em]" style={{ fontFamily: "var(--font-space)", color: "#F5F5F0" }}>
                {product.confidence >= 85
                  ? "Exact match"
                  : product.confidence >= 70
                  ? "Strong match"
                  : product.confidence >= 40
                  ? "Likely match"
                  : "Approximate"}
              </span>
            </div>

            {/* Match source pill */}
            {product.match_source === "lens" && (
              <div
                className="absolute left-3 top-3 rounded-full px-2.5 py-1"
                style={{ background: "rgba(10,10,10,0.8)", backdropFilter: "blur(8px)" }}
              >
                <span className="text-[9px] font-medium uppercase tracking-[0.08em]" style={{ fontFamily: "var(--font-space)", color: "#666660" }}>
                  Visual match
                </span>
              </div>
            )}
          </div>

          {/* Item info */}
          <div className="fade-up-1 mt-6 w-full max-w-sm">
            <p className="text-[10px] font-medium uppercase tracking-[0.15em]" style={{ fontFamily: "var(--font-space)", color: "#C8F135" }}>
              {product.brand}
            </p>
            <h2 className="mt-1 text-2xl font-bold" style={{ fontFamily: "var(--font-space)", color: "#F5F5F0" }}>
              {product.name}
            </h2>
            {(product.model || product.color) && (
              <p className="mt-0.5 text-xs font-medium uppercase tracking-[0.1em]" style={{ fontFamily: "var(--font-space)", color: "#666660" }}>
                {[product.model, product.color].filter(Boolean).join(" · ")}
              </p>
            )}
            <p className="mt-1 text-sm font-light" style={{ fontFamily: "var(--font-inter)", color: "#666660" }}>
              {product.description}
            </p>
            <p className="mt-3 text-2xl font-bold" style={{ fontFamily: "var(--font-space)", color: "#C8F135" }}>
              {product.estimated_price}
            </p>
            <p className="text-[10px] uppercase tracking-[0.15em]" style={{ fontFamily: "var(--font-space)", color: "#666660" }}>
              {retailers.length > 0
                ? `${retailers.length} retailers found`
                : pricesFailed
                ? "Couldn\u2019t find prices"
                : "Searching for prices..."}
            </p>
          </div>

          {/* Retailers */}
          {retailers.length > 0 && (
            <div className="fade-up-2 mt-5 w-full max-w-sm">
              <div className="flex flex-col gap-2.5">
                {retailers.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => window.open(r.link, "_blank", "noopener,noreferrer")}
                    className="flex w-full items-center justify-between rounded-xl px-4 py-3.5 transition-colors tap-highlight"
                    style={{
                      border: r.tag ? "1px solid #C8F135" : "1px solid #222222",
                      background: r.tag ? "rgba(200,241,53,0.05)" : "#141414",
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate" style={{ fontFamily: "var(--font-space)", color: "#F5F5F0" }}>
                          {r.retailer}
                        </p>
                        {r.tag && (
                          <span
                            className="flex-shrink-0 rounded-full px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.08em]"
                            style={{ fontFamily: "var(--font-space)", background: "#C8F135", color: "#0A0A0A" }}
                          >
                            {r.tag}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="ml-3 flex items-center gap-2 flex-shrink-0">
                      <p className="text-base font-bold" style={{ fontFamily: "var(--font-space)", color: r.tag ? "#C8F135" : "#F5F5F0" }}>
                        {r.price}
                      </p>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C8F135" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
              <p className="mt-2.5 text-center text-[11px] font-light tracking-wide" style={{ fontFamily: "var(--font-inter)", color: "#444440" }}>
                Gimme may earn a small commission on purchases
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="fade-up-2 mt-6 flex w-full max-w-sm flex-col gap-3">
            <button
              onClick={handleSave}
              disabled={saving || saved}
              className="w-full rounded-full py-4 text-xs font-semibold uppercase tracking-[0.2em] transition-opacity hover:opacity-85 disabled:opacity-60"
              style={{ fontFamily: "var(--font-space)", background: saved ? "#C8F135" : "#C8F135", color: "#0A0A0A" }}
            >
              {saved ? "Saved!" : saving ? "Saving..." : "Save to Collection"}
            </button>
            <button
              onClick={() => {
                localStorage.removeItem("gimme-capture");
                localStorage.removeItem("gimme-product");
                router.push("/capture");
              }}
              className="w-full py-3 text-xs font-light underline underline-offset-4 transition-opacity hover:opacity-70"
              style={{ fontFamily: "var(--font-inter)", color: "#666660" }}
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
