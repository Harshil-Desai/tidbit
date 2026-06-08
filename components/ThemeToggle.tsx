"use client";

import { useTheme } from "@/hooks/useTheme";

export default function ThemeToggle() {
  const { resolved, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      aria-label={resolved === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      title={resolved === "dark" ? "Light mode" : "Dark mode"}
      style={{
        display: "flex",
        width: 36,
        height: 36,
        alignItems: "center",
        justifyContent: "center",
        background: "var(--card)",
        border: "1px solid var(--line)",
        borderRadius: "var(--radius-pill)",
        color: "var(--ink-2)",
        cursor: "pointer",
        transition: "background 0.15s ease, color 0.15s ease",
      }}
    >
      {resolved === "dark" ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

function MoonIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 13.5A8 8 0 1 1 10.5 4a6.5 6.5 0 0 0 9.5 9.5z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="4.5" />
      <path strokeLinecap="round" d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8" />
    </svg>
  );
}
