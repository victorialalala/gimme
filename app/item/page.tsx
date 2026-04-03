"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "../components/AuthProvider";
import { supabase } from "../lib/supabase";

type ItemData = {
  id: string;
  name: string;
  brand: string;
  price: string;
  collection: string;
  bg_color: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
};

type Retailer = {
  retailer: string;
  title: string;
  price: string;
  price_num: number;
  link: string;
  tag?: string;
};

function ItemContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const itemId = searchParams.get("id");

  const [item, setItem] = useState<ItemData | null>(null);
  const [retailers, setRetailers] = useState<Retailer[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  // Load item from Supabase
  useEffect(() => {
    if (!user || !itemId) return;

    async function loadItem() {
      const { data, error } = await supabase
        .from("saved_items")
        .select("*")
        .eq("id", itemId)
        .eq("user_id", user!.id)
        .single();

      if (error || !data) {
        console.error("Load item error:", error);
        setLoading(false);
        return;
      }

      setItem(data);
      setLoading(false);

      // Fetch live prices in the background
      try {
        const res = await fetch("/api/prices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ brand: data.brand, name: data.name }),
        });
        if (res.ok) {
          const priceData = await res.json();
          if (priceData.retailers) {
            setRetailers(priceData.retailers);
          }
        }
      } catch {
        // Price fetch is optional
      }
    }

    loadItem();
  }, [user, itemId]);

  async function handleDelete() {
    if (!user || !itemId || deleting) return;
    setDeleting(true);

    const { error } = await supabase
      .from("saved_items")
      .delete()
      .eq("id", itemId)
      .eq("user_id", user.id);

    if (!error) {
      router.push("/home");
    } else {
      setDeleting(false);
    }
  }

  // Format date
  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-8 w-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#E63946", borderTopColor: "transparent" }} />
      </main>
    );
  }

  if (!item) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center">
        <p className="text-sm" style={{ fontFamily: "var(--font-inter)", color: "#8A8A8A" }}>Item not found.</p>
        <Link href="/home" className="mt-4 text-xs font-medium underline underline-offset-2" style={{ color: "#E63946" }}>
          Back to home
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white pb-12">

      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between bg-white/90 px-5 py-4 backdrop-blur-sm">
        <Link href="/home" className="text-[#8A8A8A] hover:text-[#1A1A1A] transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M5 12l7 7M5 12l7-7" />
          </svg>
        </Link>
        <p className="font-display text-sm font-bold uppercase tracking-[0.1em]" style={{ color: "#1A1A1A" }}>
          GIMME
        </p>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-[#C4C4C4] hover:text-[#E63946] transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      </header>

      {/* Product image */}
      <div
        className="mx-4 flex h-[300px] items-center justify-center overflow-hidden rounded-3xl"
        style={{ background: item.bg_color || "#F5F0EB" }}
      >
        {item.image_url ? (
          <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
        ) : (
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#C4C4C4" strokeWidth="0.6">
            <rect x="3" y="3" width="18" height="18" rx="3" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
          </svg>
        )}
      </div>

      {/* Product info */}
      <div className="px-5 pt-5">
        <p className="text-xs font-medium uppercase tracking-[0.15em]" style={{ fontFamily: "var(--font-space)", color: "#8A8A8A" }}>
          {item.brand}
        </p>
        <h1 className="mt-1 text-2xl font-bold" style={{ fontFamily: "var(--font-space)", color: "#1A1A1A" }}>
          {item.name}
        </h1>
        {item.description && (
          <p className="mt-1 text-sm font-light" style={{ fontFamily: "var(--font-inter)", color: "#8A8A8A" }}>
            {item.description}
          </p>
        )}

        {/* Collection badge + date */}
        <div className="mt-3 flex items-center gap-2">
          <span className="rounded-full px-3 py-1 text-[10px] font-medium capitalize" style={{ fontFamily: "var(--font-space)", background: "#FDEBED", color: "#E63946" }}>
            {item.collection || "Saved"}
          </span>
          <span className="text-[10px]" style={{ fontFamily: "var(--font-inter)", color: "#C4C4C4" }}>
            Saved {formatDate(item.created_at)}
          </span>
        </div>

        {/* Price */}
        <p className="mt-4 text-3xl font-bold" style={{ fontFamily: "var(--font-space)", color: "#1A1A1A" }}>
          {item.price}
        </p>
      </div>

      {/* Divider */}
      <div className="mx-5 my-5 h-px" style={{ background: "#F0F0F0" }} />

      {/* Price comparison */}
      {retailers.length > 0 ? (
        <div className="px-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-[0.1em]" style={{ fontFamily: "var(--font-space)", color: "#1A1A1A" }}>
              Compare Prices
            </h2>
            <p className="text-[10px]" style={{ fontFamily: "var(--font-inter)", color: "#C4C4C4" }}>
              Live prices
            </p>
          </div>

          <div className="flex flex-col gap-2.5">
            {retailers.map((r, i) => (
              <a
                key={i}
                href={r.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-2xl px-4 py-4 transition-colors hover:bg-[#FAFAFA]"
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
                <p className="ml-3 text-lg font-bold flex-shrink-0" style={{ fontFamily: "var(--font-space)", color: r.tag ? "#E63946" : "#1A1A1A" }}>
                  {r.price}
                </p>
              </a>
            ))}
          </div>
        </div>
      ) : (
        <div className="px-5">
          <div className="flex items-center gap-2 rounded-2xl px-4 py-4" style={{ background: "#FAFAFA" }}>
            <div className="h-4 w-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#C4C4C4", borderTopColor: "transparent" }} />
            <p className="text-xs" style={{ fontFamily: "var(--font-inter)", color: "#8A8A8A" }}>
              Searching for prices…
            </p>
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="mx-5 my-5 h-px" style={{ background: "#F0F0F0" }} />

      {/* Delete */}
      <div className="px-5">
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="w-full rounded-full border py-3.5 text-xs font-medium uppercase tracking-[0.15em] transition-colors hover:bg-[#FDEBED]"
          style={{ fontFamily: "var(--font-space)", borderColor: "#F0F0F0", color: "#E63946" }}
        >
          {deleting ? "Removing…" : "Remove from Collection"}
        </button>
      </div>
    </main>
  );
}

export default function ItemPage() {
  return (
    <Suspense>
      <ItemContent />
    </Suspense>
  );
}
