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

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center" style={{ background: "#0A0A0A" }}>
        <div className="h-0.5 w-24 overflow-hidden rounded-full" style={{ background: "#222222" }}>
          <div className="h-full w-1/3 rounded-full loading-bar" style={{ background: "#C8F135" }} />
        </div>
      </main>
    );
  }

  if (!item) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center" style={{ background: "#0A0A0A" }}>
        <p className="text-sm" style={{ fontFamily: "var(--font-inter)", color: "#666660" }}>Item not found.</p>
        <Link href="/home" className="mt-4 text-xs font-medium underline underline-offset-2" style={{ color: "#C8F135" }}>
          Back to home
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-12" style={{ background: "#0A0A0A" }}>

      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-5 py-4 backdrop-blur-sm" style={{ background: "rgba(10,10,10,0.9)" }}>
        <Link href="/home" className="transition-colors" style={{ color: "#666660" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M5 12l7 7M5 12l7-7" />
          </svg>
        </Link>
        <p className="font-display text-sm font-bold uppercase tracking-[0.1em]" style={{ color: "#F5F5F0" }}>
          GIMME
        </p>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="transition-colors"
          style={{ color: "#666660" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      </header>

      {/* Product image */}
      <div
        className="mx-4 flex h-[300px] items-center justify-center overflow-hidden rounded-3xl"
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
      <div className="px-5 pt-5">
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

        {/* Collection badge + date */}
        <div className="mt-3 flex items-center gap-2">
          <span className="rounded-full px-3 py-1 text-[10px] font-medium capitalize uppercase tracking-[0.1em]" style={{ fontFamily: "var(--font-space)", background: "#141414", border: "1px solid #222222", color: "#C8F135" }}>
            {item.collection || "Saved"}
          </span>
          <span className="text-[10px]" style={{ fontFamily: "var(--font-inter)", color: "#666660" }}>
            Saved {formatDate(item.created_at)}
          </span>
        </div>

        {/* Price — hero number */}
        <p className="mt-5 text-3xl font-bold" style={{ fontFamily: "var(--font-space)", color: "#F5F5F0" }}>
          {item.price}
        </p>
      </div>

      {/* Divider */}
      <div className="mx-5 my-5 h-px" style={{ background: "#222222" }} />

      {/* Price comparison */}
      {retailers.length > 0 ? (
        <div className="px-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[10px] font-medium uppercase tracking-[0.2em]" style={{ fontFamily: "var(--font-space)", color: "#666660" }}>
              Compare Prices
            </h2>
            <p className="text-[10px] uppercase tracking-[0.15em]" style={{ fontFamily: "var(--font-space)", color: "#666660" }}>
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
                className="flex items-center justify-between rounded-xl px-4 py-4 transition-colors tap-highlight"
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
                  <p className="text-lg font-bold" style={{ fontFamily: "var(--font-space)", color: r.tag ? "#C8F135" : "#F5F5F0" }}>
                    {r.price}
                  </p>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C8F135" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </a>
            ))}
          </div>
        </div>
      ) : (
        <div className="px-5">
          <div className="flex items-center gap-2 rounded-xl px-4 py-4" style={{ background: "#141414", border: "1px solid #222222" }}>
            <div className="h-0.5 w-8 overflow-hidden rounded-full" style={{ background: "#222222" }}>
              <div className="h-full w-1/3 rounded-full loading-bar" style={{ background: "#C8F135" }} />
            </div>
            <p className="text-[10px] uppercase tracking-[0.15em]" style={{ fontFamily: "var(--font-space)", color: "#666660" }}>
              Searching for prices...
            </p>
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="mx-5 my-5 h-px" style={{ background: "#222222" }} />

      {/* Delete */}
      <div className="px-5">
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="w-full rounded-full border py-3.5 text-xs font-medium uppercase tracking-[0.15em] transition-colors"
          style={{ fontFamily: "var(--font-space)", borderColor: "#222222", color: "#E63946" }}
        >
          {deleting ? "Removing..." : "Remove from Collection"}
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
