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

  return (
    <Link
      href={`/topics/${topic.id}`}
      className="anim-float"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        animationDelay: `${delay}s`,
        display: "flex",
        flexDirection: "column",
        background: "var(--card)",
        border: "1px solid var(--line)",
        borderRadius: "var(--radius)",
        overflow: "hidden",
        textDecoration: "none",
        boxShadow: hover ? "var(--shadow)" : "var(--shadow-sm)",
        transform: hover ? "translateY(-4px)" : "none",
        transition: "transform 0.22s cubic-bezier(0.22,0.68,0,1), box-shadow 0.22s ease",
      }}
    >
      {/* Colored header */}
      <div style={{
        background: topic.hue.soft,
        padding: "22px 22px 18px",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
      }}>
        <div style={{
          width: 52,
          height: 52,
          borderRadius: 16,
          background: topic.hue.base,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 8px 20px -8px ${topic.hue.base}`,
        }}>
          <TopicIcon id={topic.id} size={27} />
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {savedCount > 0 && (
            <span className="tidbit-pill" style={{ background: "var(--card)", color: "var(--brand-ink)" }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 20.5C12 20.5 3.5 15.5 3.5 9.2 3.5 6.3 5.8 4 8.6 4c1.7 0 3.2.9 4 2.2C13.2 4.9 14.7 4 16.4 4c2.8 0 5.1 2.3 5.1 5.2 0 6.3-8.5 11.3-8.5 11.3z" />
              </svg>
              {savedCount}
            </span>
          )}
          <span className="tidbit-pill" style={{ background: "var(--card)", color: topic.hue.ink }}>
            {topic.subtopics.length} concepts
          </span>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "20px 22px 22px", display: "flex", flexDirection: "column", flex: 1 }}>
        <div className="font-display" style={{ fontSize: "1.65rem", color: "var(--ink)", marginBottom: 2 }}>
          {topic.title}
        </div>
        <p style={{ color: "var(--ink-2)", fontSize: "0.92rem", lineHeight: 1.55, margin: "0 0 16px", flex: 1 }}>
          {topic.description}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
          {topic.subtopics.slice(0, 3).map((s) => (
            <span key={s.name} className="tidbit-pill" style={{ background: "var(--paper-2)", color: "var(--ink-2)", fontWeight: 600 }}>
              {s.name}
            </span>
          ))}
          {topic.subtopics.length > 3 && (
            <span style={{ color: "var(--ink-3)", padding: "5px 4px", fontSize: "0.78rem", fontWeight: 600 }}>
              +{topic.subtopics.length - 3} more
            </span>
          )}
        </div>
      </div>
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
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Search */}
      <div style={{ position: "relative", maxWidth: 480 }}>
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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 22 }} className="guide-grid">
          {filtered.map((topic, i) => (
            <TopicCard key={topic.id} topic={topic} delay={0.05 + i * 0.05} />
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "64px 20px", textAlign: "center" }}>
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
