"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../components/AuthProvider";
import { supabase } from "../lib/supabase";

type SavedItem = {
  id: string;
  name: string;
  brand: string;
  price: string;
  collection: string;
  bg: string;
  image_url: string | null;
};

export default function HomePage() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const [active, setActive] = useState("all");
  const [items, setItems] = useState<SavedItem[]>([]);
  const [collections, setCollections] = useState<string[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  const [showNewCollection, setShowNewCollection] = useState(false);
  const [newName, setNewName] = useState("");

  const [editingCollection, setEditingCollection] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  async function loadData() {
    if (!user) return;

    try {
      const { data: savedItems, error } = await supabase
        .from("saved_items")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && savedItems) {
        const mapped = savedItems.map((item) => ({
          id: item.id,
          name: item.name,
          brand: item.brand,
          price: item.price,
          collection: item.collection || "other",
          bg: "#141414",
          image_url: item.image_url,
        }));
        setItems(mapped);
        const uniqueCollections = [...new Set(mapped.map((i) => i.collection))].filter(Boolean);
        setCollections(uniqueCollections);
      }
    } catch {
      // Silently fail
    }

    setDataLoading(false);
  }

  async function handleRenameCollection() {
    if (!user || !editingCollection || !editName.trim()) return;
    const newSlug = editName.trim().toLowerCase();
    await supabase
      .from("saved_items")
      .update({ collection: newSlug })
      .eq("user_id", user.id)
      .eq("collection", editingCollection);
    setEditingCollection(null);
    setEditName("");
    if (active === editingCollection) setActive(newSlug);
    loadData();
  }

  async function handleDeleteCollection() {
    if (!user || !editingCollection) return;
    const confirmed = window.confirm(`Delete all items in "${editingCollection}"?`);
    if (!confirmed) return;
    await supabase
      .from("saved_items")
      .delete()
      .eq("user_id", user.id)
      .eq("collection", editingCollection);
    setEditingCollection(null);
    setActive("all");
    loadData();
  }

  function handleCreateCollection() {
    if (!newName.trim()) return;
    const slug = newName.trim().toLowerCase();
    if (!collections.includes(slug)) {
      setCollections((prev) => [...prev, slug]);
    }
    setActive(slug);
    setShowNewCollection(false);
    setNewName("");
  }

  const filtered = active === "all" ? items : items.filter((i) => i.collection === active);

  if (authLoading || dataLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center" style={{ background: "#0A0A0A" }}>
        <div className="flex flex-col items-center gap-3">
          {/* Lime loading bar */}
          <div className="h-0.5 w-32 overflow-hidden rounded-full" style={{ background: "#222222" }}>
            <div className="h-full w-1/3 rounded-full loading-bar" style={{ background: "#C8F135" }} />
          </div>
          <p className="text-xs" style={{ fontFamily: "var(--font-inter)", color: "#666660" }}>Loading your collection...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-28" style={{ background: "#0A0A0A" }}>

      {/* Header — generous top padding */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-5 pt-6 pb-4 backdrop-blur-sm" style={{ background: "rgba(10,10,10,0.9)" }}>
        <h1
          className="font-display text-xl font-bold uppercase tracking-[0.1em]"
          style={{ color: "#F5F5F0" }}
        >
          GIMME
        </h1>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="transition-colors"
          style={{ color: "#666660" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </header>

      {/* Settings dropdown */}
      {showSettings && (
        <div
          className="absolute right-4 top-16 z-50 flex flex-col rounded-2xl p-2"
          style={{ background: "#1A1A1A", border: "1px solid #222222", minWidth: "180px" }}
        >
          <div className="px-3 py-2">
            <p className="text-xs font-medium truncate" style={{ fontFamily: "var(--font-space)", color: "#F5F5F0" }}>
              {user?.email}
            </p>
          </div>
          <div className="h-px" style={{ background: "#222222" }} />
          <button
            onClick={async () => {
              await signOut();
              localStorage.removeItem("gimme-onboarded");
              router.replace("/");
            }}
            className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs transition-colors tap-highlight"
            style={{ fontFamily: "var(--font-space)", color: "#E63946" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign Out
          </button>
        </div>
      )}

      {/* Subhead */}
      <div className="px-5 pb-2">
        <p className="text-xs font-light uppercase tracking-[0.15em]" style={{ fontFamily: "var(--font-space)", color: "#666660" }}>
          {items.length} {items.length === 1 ? "item" : "items"} saved
        </p>
      </div>

      {/* Collection pills */}
      <div className="flex gap-2 overflow-x-auto px-5 pb-4 pt-1 scrollbar-none">
        <button
          onClick={() => setActive("all")}
          className="flex-shrink-0 rounded-full px-4 py-2 text-[10px] font-medium uppercase tracking-[0.15em] transition-all"
          style={{
            fontFamily: "var(--font-space)",
            background: active === "all" ? "#C8F135" : "#141414",
            color: active === "all" ? "#0A0A0A" : "#666660",
            border: active === "all" ? "1px solid #C8F135" : "1px solid #222222",
          }}
        >
          All
        </button>

        {collections.map((c) => (
          <button
            key={c}
            onClick={() => setActive(c)}
            onDoubleClick={() => {
              setEditingCollection(c);
              setEditName(c);
            }}
            className="flex-shrink-0 rounded-full px-4 py-2 text-[10px] font-medium capitalize uppercase tracking-[0.15em] transition-all"
            style={{
              fontFamily: "var(--font-space)",
              background: active === c ? "#C8F135" : "#141414",
              color: active === c ? "#0A0A0A" : "#666660",
              border: active === c ? "1px solid #C8F135" : "1px solid #222222",
            }}
          >
            {c}
          </button>
        ))}

        <button
          onClick={() => setShowNewCollection(true)}
          className="flex flex-shrink-0 items-center gap-1 rounded-full px-3 py-2 text-[10px] uppercase tracking-[0.15em] transition-colors"
          style={{ fontFamily: "var(--font-space)", color: "#666660", border: "1px dashed #222222" }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New
        </button>
      </div>

      {/* Edit collection bar */}
      {editingCollection && (
        <div className="mx-4 mb-4 flex items-center gap-2 rounded-2xl p-3" style={{ background: "#141414", border: "1px solid #222222" }}>
          <input
            autoFocus
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRenameCollection()}
            className="flex-1 rounded-lg px-3 py-2 text-sm outline-none"
            style={{ fontFamily: "var(--font-inter)", background: "#1A1A1A", border: "1px solid #222222", color: "#F5F5F0" }}
          />
          <button
            onClick={handleRenameCollection}
            className="rounded-full px-3 py-2 text-[10px] font-medium uppercase tracking-[0.1em]"
            style={{ fontFamily: "var(--font-space)", background: "#C8F135", color: "#0A0A0A" }}
          >
            Save
          </button>
          <button
            onClick={handleDeleteCollection}
            className="rounded-full px-3 py-2 text-[10px] font-medium uppercase tracking-[0.1em]"
            style={{ fontFamily: "var(--font-space)", color: "#E63946", border: "1px solid #222222" }}
          >
            Delete
          </button>
          <button onClick={() => setEditingCollection(null)} style={{ color: "#666660" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* New collection modal */}
      {showNewCollection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6" style={{ background: "rgba(10,10,10,0.8)" }} onClick={() => setShowNewCollection(false)}>
          <div
            className="w-full max-w-sm rounded-3xl p-6"
            onClick={(e) => e.stopPropagation()}
            style={{ background: "#1A1A1A", border: "1px solid #222222" }}
          >
            <h3 className="text-lg font-bold mb-1" style={{ fontFamily: "var(--font-space)", color: "#F5F5F0" }}>
              New Collection
            </h3>
            <p className="text-xs font-light mb-4" style={{ fontFamily: "var(--font-inter)", color: "#666660" }}>
              Give it a name - you can change it later.
            </p>
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateCollection()}
              placeholder="e.g. Birthday Wishlist"
              className="w-full rounded-xl py-3 px-4 text-sm outline-none mb-4"
              style={{ fontFamily: "var(--font-inter)", background: "#141414", border: "1px solid #222222", color: "#F5F5F0" }}
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowNewCollection(false)}
                className="flex-1 rounded-full py-3 text-xs font-medium uppercase tracking-[0.15em]"
                style={{ fontFamily: "var(--font-space)", color: "#666660", border: "1px solid #222222" }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCollection}
                className="flex-1 rounded-full py-3 text-xs font-semibold uppercase tracking-[0.15em]"
                style={{ fontFamily: "var(--font-space)", background: "#C8F135", color: "#0A0A0A" }}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Item grid — 2 columns */}
      <div className="grid grid-cols-2 gap-3 px-4">
        {filtered.map((item) => (
          <Link
            href={`/item?id=${item.id}`}
            key={item.id}
            className="group flex flex-col overflow-hidden rounded-xl transition-transform hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: "#141414", border: "1px solid #222222" }}
          >
            {/* Image area */}
            <div
              className="relative flex h-44 w-full items-center justify-center"
              style={{ background: "#141414" }}
            >
              {/* Brand pill overlaid on image */}
              <span
                className="absolute left-2.5 top-2.5 z-10 rounded-full px-2.5 py-0.5 text-[9px] font-medium uppercase tracking-[0.15em] backdrop-blur-sm"
                style={{ fontFamily: "var(--font-space)", background: "rgba(10,10,10,0.7)", color: "#C8F135" }}
              >
                {item.brand}
              </span>
              {item.image_url ? (
                <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
              ) : (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#222222" strokeWidth="0.8">
                  <rect x="3" y="3" width="18" height="18" rx="3" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                </svg>
              )}
            </div>

            {/* Info */}
            <div className="flex flex-col gap-0.5 px-3 py-3">
              <p className="text-sm font-medium leading-tight" style={{ fontFamily: "var(--font-space)", color: "#F5F5F0" }}>
                {item.name}
              </p>
              <p className="text-xs" style={{ fontFamily: "var(--font-inter)", color: "#666660" }}>
                {item.brand}
              </p>
              <p className="mt-1 text-sm font-semibold" style={{ fontFamily: "var(--font-space)", color: "#C8F135" }}>
                {item.price}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Empty state */}
      {items.length === 0 && (
        <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full" style={{ background: "#141414", border: "1px solid #222222" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#666660" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </div>
          <h2 className="text-lg font-bold" style={{ fontFamily: "var(--font-space)", color: "#F5F5F0" }}>
            No items yet
          </h2>
          <p className="text-sm font-light" style={{ fontFamily: "var(--font-inter)", color: "#666660" }}>
            Tap GIMME below to snap your first item.
          </p>
        </div>
      )}

      {/* Empty filtered state */}
      {items.length > 0 && filtered.length === 0 && (
        <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
          <p className="text-sm font-light" style={{ fontFamily: "var(--font-inter)", color: "#666660" }}>
            No items in this collection yet.
          </p>
        </div>
      )}

      {/* FAB — GIMME wordmark button */}
      <Link
        href="/capture"
        className="fixed bottom-8 left-1/2 z-50 flex h-[72px] w-[72px] -translate-x-1/2 items-center justify-center rounded-full transition-transform hover:scale-105 active:scale-95"
        style={{
          background: "#C8F135",
          boxShadow: "0 4px 24px rgba(200,241,53,0.25), 0 0 0 1px rgba(200,241,53,0.1)",
        }}
      >
        <span
          className="font-display text-[11px] font-bold uppercase tracking-[0.08em]"
          style={{ color: "#0A0A0A" }}
        >
          GIMME
        </span>
      </Link>

    </main>
  );
}
