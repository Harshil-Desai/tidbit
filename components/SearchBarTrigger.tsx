"use client";

import { useEffect, useState } from "react";

export default function SearchBarTrigger() {
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().includes("MAC"));
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("tidbit:open-search"));
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <button
      onClick={() => window.dispatchEvent(new CustomEvent("tidbit:open-search"))}
      style={{
        background: "var(--card)",
        color: "var(--ink)",
        border: "1px solid var(--line)",
        borderRadius: "var(--radius-pill)",
        padding: "14px 22px",
        fontWeight: 700,
        fontSize: "1rem",
        display: "inline-flex",
        alignItems: "center",
        gap: 9,
        cursor: "pointer",
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4-4" strokeLinecap="round" />
      </svg>
      Search everything
      <kbd style={{ fontSize: "0.72rem", color: "var(--ink-3)", fontFamily: "ui-monospace, monospace" }}>
        {isMac ? "⌘K" : "Ctrl+K"}
      </kbd>
    </button>
  );
}
