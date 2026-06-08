"use client";

import Link from "next/link";
import { useFavorites } from "@/hooks/useFavorites";

export default function FavoritesNavItem() {
  const { favorites, hydrated } = useFavorites();
  const count = hydrated ? favorites.length : 0;

  return (
    <Link
      href="/favorites"
      aria-label={`Saved concepts${count > 0 ? ` (${count})` : ""}`}
      style={{
        position: "relative",
        display: "flex",
        width: 36,
        height: 36,
        alignItems: "center",
        justifyContent: "center",
        background: "var(--card)",
        border: "1px solid var(--line)",
        borderRadius: "var(--radius-pill)",
        color: count > 0 ? "var(--brand)" : "var(--ink-2)",
        textDecoration: "none",
        transition: "color 0.15s ease",
      }}
    >
      <svg width="17" height="17" viewBox="0 0 24 24"
        fill={count > 0 ? "var(--brand)" : "none"}
        stroke={count > 0 ? "var(--brand)" : "currentColor"}
        strokeWidth="2"
      >
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M12 20.5C12 20.5 3.5 15.5 3.5 9.2 3.5 6.3 5.8 4 8.6 4c1.7 0 3.2.9 4 2.2C13.2 4.9 14.7 4 16.4 4c2.8 0 5.1 2.3 5.1 5.2 0 6.3-8.5 11.3-8.5 11.3z" />
      </svg>
      {count > 0 && (
        <span style={{
          position: "absolute",
          top: -6,
          right: -6,
          background: "var(--brand)",
          color: "#fff",
          borderRadius: 999,
          minWidth: 18,
          height: 18,
          fontSize: "0.66rem",
          fontWeight: 800,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 4px",
          border: "2px solid var(--paper)",
        }}>
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
