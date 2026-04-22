"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "../lib/supabase";

type ItemData = {
  id: string;
  name: string;
  brand: string;
  price: string;
  description: string | null;
  image_url: string | null;
  collection: string;
};

type Retailer = {
  retailer: string;
  price: string;
  price_num: number;
  link: string;
  tag?: string;
};

function ShareContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("s");

  const [item, setItem] = useState<ItemData | null>(null);
  const [bestRetailer, setBestRetailer] = useState<Retailer | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!token) { setNotFound(true); setLoading(false); return; }

    async function load() {
      const { data, error } = await supabase
        .from("saved_items")
        .select("id, name, brand, price, description, image_url, collection")
        .eq("share_token", token)
        .single();

      if (error || !data) { setNotFound(true); setLoading(false); return; }

      setItem(data);
      setLoading(false);

      // Fetch prices to get the best/lowest price link
      try {
        const res = await fetch("/api/prices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ brand: data.brand, name: data.name }),
        });
        if (res.ok) {
          const priceData = await res.json();
          if (priceData.retailers && priceData.retailers.length > 0) {
            setBestRetailer(priceData.retailers[0]); // already sorted lowest first
          }
        }
      } catch {
        // optional
      }
    }

    load();
  }, [token]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center" style={{ background: "#0A0A0A" }}>
        <div className="h-0.5 w-24 overflow-hidden rounded-full" style={{ background: "#222222" }}>
          <div className="h-full w-1/3 rounded-full loading-bar" style={{ background: "#C8F135" }} />
        </div>
      </main>
    );
  }

  if (notFound || !item) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center" style={{ background: "#0A0A0A" }}>
        <p className="font-display text-2xl font-bold uppercase tracking-[0.12em] mb-4" style={{ color: "#F5F5F0" }}>GIMME</p>
        <p className="text-sm" style={{ fontFamily: "var(--font-inter)", color: "#666660" }}>This item is no longer available.</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center" style={{ background: "#0A0A0A" }}>

      {/* Header */}
      <header className="w-full flex items-center justify-center px-5 py-5">
        <p className="font-display text-sm font-bold uppercase tracking-[0.12em]" style={{ color: "#F5F5F0" }}>GIMME</p>
      </header>

      {/* Product image */}
      <div
        className="mx-4 w-full max-w-sm flex h-[340px] items-center justify-center overflow-hidden rounded-3xl"
        style={{ background: "#141414" }}
      >
        {item.image_url ? (
          <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
        ) : (
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#222222" strokeWidth="0.6">
            <rect x="3" y="3" width="18" height="18" rx="3" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
          </svg>
        )}
      </div>

      {/* Product info */}
      <div className="w-full max-w-sm px-5 pt-6">
        <p className="text-[10px] font-medium uppercase tracking-[0.15em]" style={{ fontFamily: "var(--font-space)", color: "#C8F135" }}>
          {item.brand}
        </p>
        <h1 className="mt-1 text-2xl font-bold" style={{ fontFamily: "var(--font-space)", color: "#F5F5F0" }}>
          {item.name}
        </h1>
        {item.description && (
          <p className="mt-1 text-sm font-light" style={{ fontFamily: "var(--font-inter)", color: "#666660" }}>
            {item.description}
          </p>
        )}

        {/* Best price */}
        {bestRetailer ? (
          <div className="mt-6">
            <p className="text-[10px] font-medium uppercase tracking-[0.15em] mb-3" style={{ fontFamily: "var(--font-space)", color: "#666660" }}>
              Best price
            </p>
            <button
              onClick={() => {
                if (bestRetailer.link) window.open(bestRetailer.link, "_blank", "noopener,noreferrer");
              }}
              className="w-full flex items-center justify-between rounded-2xl px-5 py-5 transition-opacity active:opacity-70"
              style={{ background: "#C8F135" }}
            >
              <div className="text-left">
                <p className="text-xs font-medium uppercase tracking-[0.1em]" style={{ fontFamily: "var(--font-space)", color: "#0A0A0A", opacity: 0.6 }}>
                  {bestRetailer.retailer}
                </p>
                <p className="text-2xl font-bold mt-0.5" style={{ fontFamily: "var(--font-space)", color: "#0A0A0A" }}>
                  {bestRetailer.price}
                </p>
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="mt-6">
            <div className="flex items-center gap-2 rounded-2xl px-5 py-5" style={{ background: "#141414", border: "1px solid #222222" }}>
              <div className="h-0.5 w-8 overflow-hidden rounded-full" style={{ background: "#222222" }}>
                <div className="h-full w-1/3 rounded-full loading-bar" style={{ background: "#C8F135" }} />
              </div>
              <p className="text-[10px] uppercase tracking-[0.15em]" style={{ fontFamily: "var(--font-space)", color: "#666660" }}>
                Finding best price...
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <p className="mt-6 text-center text-[10px]" style={{ fontFamily: "var(--font-inter)", color: "#444440" }}>
          Shared via GIMME · See it. Snap it. Buy it.
        </p>
      </div>
    </main>
  );
}

export default function SharePage() {
  return (
    <Suspense>
      <ShareContent />
    </Suspense>
  );
}
