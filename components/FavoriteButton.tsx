"use client";

import { useState } from "react";
import { useFavorites } from "@/hooks/useFavorites";
import type { Favorite } from "@/lib/favorites";

type Props = Omit<Favorite, "savedAt"> & {
  size?: "sm" | "md";
  showLabel?: boolean;
};

export default function FavoriteButton({ size = "md", showLabel = false, ...entry }: Props) {
  const { toggle, isStarred, hydrated } = useFavorites();
  const starred = isStarred(entry.topicSlug, entry.conceptId);
  const [burst, setBurst] = useState(false);

  if (!hydrated) {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "var(--radius-pill)",
          border: "1px solid var(--line)",
          background: "var(--card)",
          padding: showLabel ? "8px 14px" : "8px",
          color: "var(--ink-3)",
          width: showLabel ? undefined : size === "sm" ? 28 : 32,
          height: showLabel ? undefined : size === "sm" ? 28 : 32,
        }}
        aria-hidden
      >
        <HeartIcon filled={false} size={size} />
      </span>
    );
  }

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!starred) { setBurst(true); setTimeout(() => setBurst(false), 420); }
        toggle(entry);
      }}
      title={starred ? "Remove from saved" : "Save concept"}
      aria-label={starred ? `Remove "${entry.conceptTitle}" from saved` : `Save "${entry.conceptTitle}"`}
      aria-pressed={starred}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        background: starred ? "var(--brand-soft)" : "var(--card)",
        border: `1px solid ${starred ? "var(--brand)" : "var(--line)"}`,
        color: starred ? "var(--brand-ink)" : "var(--ink-2)",
        borderRadius: "var(--radius-pill)",
        padding: showLabel ? "8px 14px" : (size === "sm" ? "6px" : "8px"),
        fontWeight: 700,
        fontSize: "0.82rem",
        cursor: "pointer",
        transition: "all 0.18s ease",
      }}
    >
      <span style={{ display: "inline-flex", animation: burst ? "heart-burst 0.42s ease both" : "none" }}>
        <HeartIcon filled={starred} size={size} />
      </span>
      {showLabel && <span>{starred ? "Saved" : "Save"}</span>}
    </button>
  );
}

function HeartIcon({ filled, size }: { filled: boolean; size: "sm" | "md" }) {
  const s = size === "sm" ? 14 : 17;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24"
      fill={filled ? "var(--brand)" : "none"}
      stroke={filled ? "var(--brand)" : "currentColor"}
      strokeWidth="2"
    >
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M12 20.5C12 20.5 3.5 15.5 3.5 9.2 3.5 6.3 5.8 4 8.6 4c1.7 0 3.2.9 4 2.2C13.2 4.9 14.7 4 16.4 4c2.8 0 5.1 2.3 5.1 5.2 0 6.3-8.5 11.3-8.5 11.3z" />
    </svg>
  );
}
