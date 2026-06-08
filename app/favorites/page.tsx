"use client";

import { useMemo, useCallback } from "react";
import Link from "next/link";
import { useFavorites } from "@/hooks/useFavorites";
import FavoriteButton from "@/components/FavoriteButton";
import TopicIcon from "@/components/TopicIcon";
import { topics } from "@/data/topics";
import type { Favorite } from "@/lib/favorites";

type Group = { topicSlug: string; topicTitle: string; topicIcon: string; topicColor: string; items: Favorite[] };

function groupByTopic(favs: Favorite[]): Group[] {
  const map = new Map<string, Group>();
  for (const f of favs) {
    if (!map.has(f.topicSlug)) {
      map.set(f.topicSlug, {
        topicSlug: f.topicSlug,
        topicTitle: f.topicTitle,
        topicIcon: f.topicIcon,
        topicColor: f.topicColor,
        items: [],
      });
    }
    map.get(f.topicSlug)!.items.push(f);
  }
  for (const g of map.values()) g.items.sort((a, b) => b.savedAt - a.savedAt);
  return Array.from(map.values());
}

function EmptyState() {
  return (
    <div className="tidbit-card" style={{ marginTop: 28, padding: "60px 30px", textAlign: "center", boxShadow: "var(--shadow-sm)" }}>
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ marginBottom: 8 }}>
        <path d="M12 20.5C12 20.5 3.5 15.5 3.5 9.2 3.5 6.3 5.8 4 8.6 4c1.7 0 3.2.9 4 2.2C13.2 4.9 14.7 4 16.4 4c2.8 0 5.1 2.3 5.1 5.2 0 6.3-8.5 11.3-8.5 11.3z" />
      </svg>
      <div className="font-display" style={{ fontSize: "1.8rem", color: "var(--ink)", marginBottom: 8 }}>Nothing saved yet</div>
      <p style={{ color: "var(--ink-2)", maxWidth: 380, margin: "0 auto 24px" }}>
        Tap the heart on any concept and it will land here, your own pocket revision list.
      </p>
      <Link
        href="/"
        style={{
          display: "inline-block",
          background: "var(--brand)",
          color: "#fff",
          border: "none",
          borderRadius: "var(--radius-pill)",
          padding: "12px 22px",
          fontWeight: 700,
          textDecoration: "none",
          boxShadow: "0 10px 24px -8px var(--brand)",
        }}
      >
        Browse the guides
      </Link>
    </div>
  );
}

function ConceptRow({ fav }: { fav: Favorite }) {
  const conceptUrl = fav.conceptId
    ? `/topics/${fav.topicSlug}?concept=${fav.conceptId}`
    : `/topics/${fav.topicSlug}`;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", transition: "background 0.12s ease" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--paper-2)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <Link href={conceptUrl} style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--ink)", textDecoration: "none", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {fav.conceptTitle}
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
          <span style={{ fontSize: "0.8rem", color: "var(--ink-3)" }}>{fav.category}</span>
        </div>
      </div>
      <div style={{ flexShrink: 0 }}>
        <FavoriteButton
          size="sm"
          topicSlug={fav.topicSlug}
          topicTitle={fav.topicTitle}
          topicIcon={fav.topicIcon}
          topicColor={fav.topicColor}
          conceptId={fav.conceptId}
          conceptTitle={fav.conceptTitle}
          category={fav.category}
        />
      </div>
    </div>
  );
}

function TopicGroup({ group }: { group: Group }) {
  const topic = topics.find((t) => t.id === group.topicSlug);
  const hue = topic?.hue ?? { base: "var(--brand)", ink: "var(--brand-ink)", soft: "var(--brand-soft)" };

  return (
    <div className="tidbit-card" style={{ overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
      <div style={{ background: hue.soft, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: hue.base, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <TopicIcon id={group.topicSlug} size={18} strokeWidth={2.2} />
          </div>
          <Link href={`/topics/${group.topicSlug}`} style={{ fontWeight: 800, color: "var(--ink)", fontSize: "1rem", textDecoration: "none" }}>
            {group.topicTitle}
          </Link>
        </div>
        <span className="tidbit-pill" style={{ background: "var(--card)", color: hue.ink }}>
          {group.items.length} saved
        </span>
      </div>
      <div>
        {group.items.map((fav, i) => (
          <div key={`${fav.topicSlug}-${fav.conceptId}`}>
            {i > 0 && <div style={{ height: 1, background: "var(--line-soft)", margin: "0 18px" }} />}
            <ConceptRow fav={fav} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function FavoritesPage() {
  const { favorites, hydrated, clearAll } = useFavorites();
  const groups = useMemo(() => groupByTopic(favorites), [favorites]);
  const total = favorites.length;

  const exportJSON = useCallback(() => {
    const data = JSON.stringify(favorites, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tidbit-favorites.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [favorites]);

  return (
    <div style={{ maxWidth: 820, margin: "0 auto", padding: "36px 28px 80px" }}>
      {/* Page header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
        <div style={{ width: 56, height: 56, borderRadius: 18, background: "var(--brand-soft)", color: "var(--brand)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="var(--brand)" stroke="none">
            <path d="M12 20.5C12 20.5 3.5 15.5 3.5 9.2 3.5 6.3 5.8 4 8.6 4c1.7 0 3.2.9 4 2.2C13.2 4.9 14.7 4 16.4 4c2.8 0 5.1 2.3 5.1 5.2 0 6.3-8.5 11.3-8.5 11.3z" />
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 className="font-display" style={{ fontSize: "2.6rem", color: "var(--ink)", margin: 0, lineHeight: 1.04 }}>
            Your saved bites
          </h1>
          <span style={{ color: "var(--ink-2)", display: "block", marginTop: 2 }}>
            {hydrated && total > 0
              ? `${total} concept${total !== 1 ? "s" : ""} on your revision list`
              : "Your personal revision list"}
          </span>
        </div>

        {hydrated && total > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <button
              onClick={exportJSON}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "var(--card)", border: "1px solid var(--line)", borderRadius: "var(--radius-pill)", padding: "8px 14px", fontSize: "0.82rem", fontWeight: 600, color: "var(--ink-2)", cursor: "pointer" }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Export
            </button>
            <button
              onClick={() => { if (confirm(`Remove all ${total} saved concepts?`)) clearAll(); }}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "var(--card)", border: "1px solid #fca5a5", borderRadius: "var(--radius-pill)", padding: "8px 14px", fontSize: "0.82rem", fontWeight: 600, color: "#ef4444", cursor: "pointer" }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {!hydrated ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 28 }}>
          {[1, 2].map((i) => (
            <div key={i} className="tidbit-card skeleton" style={{ height: 160 }} />
          ))}
        </div>
      ) : total === 0 ? (
        <EmptyState />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 24, marginTop: 28 }}>
          {groups.map((g) => (
            <TopicGroup key={g.topicSlug} group={g} />
          ))}
        </div>
      )}
    </div>
  );
}
