"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { topics, type Topic } from "@/data/topics";
import { useFavorites } from "@/hooks/useFavorites";
import TopicIcon from "@/components/TopicIcon";

function TopicCard({ topic, delay }: { topic: Topic; delay: number }) {
  const { countForTopic, hydrated } = useFavorites();
  const savedCount = hydrated ? countForTopic(topic.id) : 0;
  const [hover, setHover] = useState(false);
  const isLocked = topic.comingSoon;

  const cardContent = (
    <>
      {/* Colored header */}
      <div style={{
        background: topic.hue.soft,
        padding: "clamp(18px, 4vw, 24px) clamp(18px, 4vw, 24px) clamp(14px, 3vw, 20px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "clamp(12px, 3vw, 16px)",
      }}>
        <div style={{
          width: "clamp(48px, 10vw, 56px)",
          height: "clamp(48px, 10vw, 56px)",
          borderRadius: "clamp(14px, 2.5vw, 18px)",
          background: topic.hue.base,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 10px 24px -8px ${topic.hue.base}`,
          flexShrink: 0,
        }}>
          <TopicIcon id={topic.id} size={28} />
        </div>
        {savedCount > 0 && (
          <span className="tidbit-pill" style={{ background: "var(--card)", color: "var(--brand)", fontWeight: 700, fontSize: "0.8rem" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 20.5C12 20.5 3.5 15.5 3.5 9.2 3.5 6.3 5.8 4 8.6 4c1.7 0 3.2.9 4 2.2C13.2 4.9 14.7 4 16.4 4c2.8 0 5.1 2.3 5.1 5.2 0 6.3-8.5 11.3-8.5 11.3z" />
            </svg>
            {savedCount}
          </span>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: "clamp(18px, 4vw, 24px) clamp(18px, 4vw, 24px) clamp(18px, 4vw, 24px)", display: "flex", flexDirection: "column", flex: 1 }}>
        <div className="font-display" style={{ fontSize: "clamp(1.4rem, 5vw, 1.75rem)", color: "var(--ink)", marginBottom: 10, lineHeight: 1.2 }}>
          {topic.title}
        </div>
        <p style={{ color: "var(--ink-2)", fontSize: "0.95rem", lineHeight: 1.6, margin: "0 0 18px", flex: 1 }}>
          {topic.description}
        </p>
        {topic.subtopics.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {topic.subtopics.slice(0, 3).map((s) => (
              <span key={s.name} className="tidbit-pill" style={{ background: topic.hue.soft, color: topic.hue.base, fontWeight: 700, fontSize: "0.8rem" }}>
                {s.name}
              </span>
            ))}
            {topic.subtopics.length > 3 && (
              <span style={{ color: "var(--ink-2)", padding: "6px 8px", fontSize: "0.8rem", fontWeight: 700 }}>
                +{topic.subtopics.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {isLocked && (
        <div style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0, 0, 0, 0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 8,
          backdropFilter: "blur(2px)",
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span style={{ color: "#fff", fontSize: "0.9rem", fontWeight: 700, textAlign: "center" }}>
            Coming Soon
          </span>
        </div>
      )}
    </>
  );

  const cardStyle = {
    animationDelay: `${delay}s`,
    display: "flex" as const,
    flexDirection: "column" as const,
    background: "var(--card)",
    border: "1px solid var(--line)",
    borderRadius: "var(--radius)",
    overflow: "hidden" as const,
    textDecoration: "none" as const,
    boxShadow: hover ? "var(--shadow)" : "var(--shadow-sm)",
    transform: hover ? "translateY(-4px)" : "none",
    transition: "transform 0.22s cubic-bezier(0.22,0.68,0,1), box-shadow 0.22s ease",
    opacity: isLocked ? 0.6 : 1,
    cursor: isLocked ? "default" : "pointer",
    position: "relative" as const,
  };

  if (isLocked) {
    return (
      <div
        className="anim-float"
        style={cardStyle}
      >
        {cardContent}
      </div>
    );
  }

  return (
    <Link
      href={`/topics/${topic.id}`}
      className="anim-float"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={cardStyle}
    >
      {cardContent}
    </Link>
  );
}

export default function TopicGrid() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return topics;
    return topics.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.subtopics.some((s) => s.name.toLowerCase().includes(q))
    );
  }, [query]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "clamp(20px, 4vw, 28px)" }}>
      {/* Search */}
      <div style={{ position: "relative", maxWidth: "100%", width: "clamp(280px, 90vw, 480px)" }}>
        <div style={{ position: "absolute", inset: "0 auto 0 14px", display: "flex", alignItems: "center", pointerEvents: "none" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth="2.2">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4-4" strokeLinecap="round" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Filter guides and concepts..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            width: "100%",
            padding: "12px 40px 12px 42px",
            borderRadius: "var(--radius-pill)",
            border: "1px solid var(--line)",
            background: "var(--card)",
            color: "var(--ink)",
            fontSize: "0.95rem",
            outline: "none",
            transition: "border-color 0.15s ease",
          }}
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            style={{ position: "absolute", inset: "0 12px 0 auto", display: "flex", alignItems: "center", background: "none", border: "none", color: "var(--ink-3)", cursor: "pointer" }}
            aria-label="Clear search"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {query && (
        <p style={{ color: "var(--ink-3)", fontSize: "0.88rem", marginTop: -14 }}>
          {filtered.length === 0 ? "No guides found." : `${filtered.length} guide${filtered.length !== 1 ? "s" : ""} matched`}
        </p>
      )}

      {filtered.length > 0 ? (
        <div style={{ display: "grid", gap: "clamp(16px, 4vw, 22px)" }} className="guide-grid">
          {filtered.map((topic, i) => (
            <TopicCard key={topic.id} topic={topic} delay={0.05 + i * 0.05} />
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "clamp(6px, 1.5vw, 8px)", padding: "clamp(40px, 10vw, 64px) clamp(16px, 5vw, 20px)", textAlign: "center" }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4-4" />
          </svg>
          <p style={{ color: "var(--ink-2)", fontSize: "0.95rem" }}>No guides match &ldquo;{query}&rdquo;</p>
          <button
            onClick={() => setQuery("")}
            style={{ background: "none", border: "none", color: "var(--brand-ink)", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer" }}
          >
            Clear search
          </button>
        </div>
      )}
    </div>
  );
}
