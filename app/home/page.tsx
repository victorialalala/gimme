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

const PASTEL_BGS = ["#F5F0EB", "#EBF0F5", "#F0F5EB", "#F5EBF0", "#F0EBEB", "#EBEBF0", "#F5F2EB", "#EBF5F2"];

export default function HomePage() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const [active, setActive] = useState("all");
  const [items, setItems] = useState<SavedItem[]>([]);
  const [collections, setCollections] = useState<string[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  // New collection modal
  const [showNewCollection, setShowNewCollection] = useState(false);
  const [newName, setNewName] = useState("");

  // Edit collection modal
  const [editingCollection, setEditingCollection] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  // Redirect to welcome if not signed in
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/");
    }
  }, [authLoading, user, router]);

  // Load items from Supabase
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
        const mapped = savedItems.map((item, i) => ({
          id: item.id,
          name: item.name,
          brand: item.brand,
          price: item.price,
          collection: item.collection || "other",
          bg: item.bg_color || PASTEL_BGS[i % PASTEL_BGS.length],
          image_url: item.image_url,
        }));
        setItems(mapped);

        // Build unique collection names from saved items
        const uniqueCollections = [...new Set(mapped.map((i) => i.collection))].filter(Boolean);
        setCollections(uniqueCollections);
      }
    } catch {
      // Silently fail
    }

    setDataLoading(false);
  }

  // Rename all items in a collection
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

  // Delete all items in a collection
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

  // Create new empty collection (just switches to it)
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
      <main className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#E63946", borderTopColor: "transparent" }} />
          <p className="text-xs" style={{ fontFamily: "var(--font-inter)", color: "#C4C4C4" }}>Loading your collection…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white pb-28">

      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between bg-white/90 px-5 py-4 backdrop-blur-sm">
        <h1
          className="font-display text-xl font-bold uppercase tracking-[0.1em]"
          style={{ color: "#1A1A1A" }}
        >
          GIMME
        </h1>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="text-[#8A8A8A] hover:text-[#1A1A1A] transition-colors"
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
          className="absolute right-4 top-14 z-50 flex flex-col rounded-2xl bg-white p-2 shadow-lg"
          style={{ border: "1px solid #F0F0F0", minWidth: "180px" }}
        >
          <div className="px-3 py-2">
            <p className="text-xs font-medium truncate" style={{ fontFamily: "var(--font-space)", color: "#1A1A1A" }}>
              {user?.email}
            </p>
          </div>
          <div className="h-px" style={{ background: "#F0F0F0" }} />
          <button
            onClick={async () => {
              await signOut();
              localStorage.removeItem("gimme-onboarded");
              router.replace("/");
            }}
            className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs transition-colors hover:bg-[#FAFAFA]"
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
        <p className="text-sm font-light" style={{ fontFamily: "var(--font-inter)", color: "#8A8A8A" }}>
          {items.length} {items.length === 1 ? "item" : "items"} saved
        </p>
      </div>

      {/* Collection pills */}
      <div className="flex gap-2 overflow-x-auto px-5 pb-4 pt-1 scrollbar-none">
        {/* All pill */}
        <button
          onClick={() => setActive("all")}
          className="flex-shrink-0 rounded-full px-4 py-2 text-xs font-medium transition-all"
          style={{
            fontFamily: "var(--font-space)",
            background: active === "all" ? "#E63946" : "#FAFAFA",
            color: active === "all" ? "#FFFFFF" : "#8A8A8A",
            border: active === "all" ? "none" : "1px solid #F0F0F0",
          }}
        >
          All
        </button>

        {/* Dynamic collection pills */}
        {collections.map((c) => (
          <button
            key={c}
            onClick={() => setActive(c)}
            onDoubleClick={() => {
              setEditingCollection(c);
              setEditName(c);
            }}
            className="flex-shrink-0 rounded-full px-4 py-2 text-xs font-medium capitalize transition-all"
            style={{
              fontFamily: "var(--font-space)",
              background: active === c ? "#E63946" : "#FAFAFA",
              color: active === c ? "#FFFFFF" : "#8A8A8A",
              border: active === c ? "none" : "1px solid #F0F0F0",
            }}
          >
            {c}
          </button>
        ))}

        {/* Add collection button */}
        <button
          onClick={() => setShowNewCollection(true)}
          className="flex flex-shrink-0 items-center gap-1 rounded-full px-3 py-2 text-xs transition-colors hover:bg-[#FAFAFA]"
          style={{ fontFamily: "var(--font-space)", color: "#C4C4C4", border: "1px dashed #E0E0E0" }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New
        </button>
      </div>

      {/* Edit collection bar — shows when double-tapping a pill */}
      {editingCollection && (
        <div className="mx-4 mb-4 flex items-center gap-2 rounded-2xl p-3" style={{ background: "#FAFAFA", border: "1px solid #F0F0F0" }}>
          <input
            autoFocus
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRenameCollection()}
            className="flex-1 rounded-lg bg-white px-3 py-2 text-sm outline-none"
            style={{ fontFamily: "var(--font-inter)", border: "1px solid #F0F0F0", color: "#1A1A1A" }}
          />
          <button
            onClick={handleRenameCollection}
            className="rounded-full px-3 py-2 text-[10px] font-medium uppercase tracking-[0.1em] text-white"
            style={{ fontFamily: "var(--font-space)", background: "#E63946" }}
          >
            Save
          </button>
          <button
            onClick={handleDeleteCollection}
            className="rounded-full px-3 py-2 text-[10px] font-medium uppercase tracking-[0.1em]"
            style={{ fontFamily: "var(--font-space)", color: "#E63946", border: "1px solid #F0F0F0" }}
          >
            Delete
          </button>
          <button
            onClick={() => setEditingCollection(null)}
            className="text-[#C4C4C4]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* New collection modal */}
      {showNewCollection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-6" onClick={() => setShowNewCollection(false)}>
          <div
            className="w-full max-w-sm rounded-3xl bg-white p-6"
            onClick={(e) => e.stopPropagation()}
            style={{ border: "1px solid #F0F0F0" }}
          >
            <h3 className="text-lg font-bold mb-1" style={{ fontFamily: "var(--font-space)", color: "#1A1A1A" }}>
              New Collection
            </h3>
            <p className="text-xs font-light mb-4" style={{ fontFamily: "var(--font-inter)", color: "#8A8A8A" }}>
              Give it a name — you can change it later.
            </p>
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateCollection()}
              placeholder="e.g. Birthday Wishlist"
              className="w-full rounded-xl py-3 px-4 text-sm outline-none mb-4"
              style={{ fontFamily: "var(--font-inter)", background: "#FAFAFA", border: "1px solid #F0F0F0", color: "#1A1A1A" }}
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowNewCollection(false)}
                className="flex-1 rounded-full py-3 text-xs font-medium uppercase tracking-[0.15em]"
                style={{ fontFamily: "var(--font-space)", color: "#8A8A8A", border: "1px solid #F0F0F0" }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCollection}
                className="flex-1 rounded-full py-3 text-xs font-semibold uppercase tracking-[0.15em] text-white"
                style={{ fontFamily: "var(--font-space)", background: "#E63946" }}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Item grid */}
      <div className="grid grid-cols-2 gap-3 px-4">
        {filtered.map((item) => (
          <Link
            href={`/item?id=${item.id}`}
            key={item.id}
            className="group flex flex-col overflow-hidden rounded-2xl transition-transform hover:scale-[1.02] active:scale-[0.98]"
            style={{ border: "1px solid #F0F0F0" }}
          >
            {/* Image area */}
            <div
              className="relative flex h-44 w-full items-center justify-center"
              style={{ background: item.bg }}
            >
              <span
                className="absolute left-2.5 top-2.5 rounded-full bg-white/80 px-2.5 py-0.5 text-[9px] font-medium uppercase tracking-[0.1em] backdrop-blur-sm"
                style={{ fontFamily: "var(--font-space)", color: "#1A1A1A" }}
              >
                {item.brand}
              </span>
              {item.image_url ? (
                <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
              ) : (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C4C4C4" strokeWidth="0.8">
                  <rect x="3" y="3" width="18" height="18" rx="3" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                </svg>
              )}
            </div>

            {/* Info */}
            <div className="flex flex-col gap-0.5 px-3 py-3">
              <p className="text-sm font-medium leading-tight" style={{ fontFamily: "var(--font-space)", color: "#1A1A1A" }}>
                {item.name}
              </p>
              <p className="text-xs" style={{ fontFamily: "var(--font-inter)", color: "#8A8A8A" }}>
                {item.brand}
              </p>
              <p className="mt-1 text-sm font-semibold" style={{ fontFamily: "var(--font-space)", color: "#E63946" }}>
                {item.price}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Empty state */}
      {items.length === 0 && (
        <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full" style={{ background: "#FAFAFA" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C4C4C4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </div>
          <h2 className="text-lg font-bold" style={{ fontFamily: "var(--font-space)", color: "#1A1A1A" }}>
            No items yet
          </h2>
          <p className="text-sm font-light" style={{ fontFamily: "var(--font-inter)", color: "#8A8A8A" }}>
            Tap the camera below to snap your first item.
          </p>
        </div>
      )}

      {/* Empty filtered state */}
      {items.length > 0 && filtered.length === 0 && (
        <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
          <p className="text-sm font-light" style={{ fontFamily: "var(--font-inter)", color: "#8A8A8A" }}>
            No items in this collection yet.
          </p>
        </div>
      )}

      {/* FAB — capture button */}
      <Link
        href="/capture"
        className="fixed bottom-8 left-1/2 z-50 flex h-16 w-16 -translate-x-1/2 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95"
        style={{ background: "#E63946" }}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
      </Link>

    </main>
  );
}
