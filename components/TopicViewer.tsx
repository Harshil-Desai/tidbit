"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { type Topic } from "@/data/topics";
import TopicRenderer from "@/components/TopicRenderer";
import TopicIcon from "@/components/TopicIcon";

// ─── Breadcrumb ──────────────────────────────────────────────────────────────

function Breadcrumb({ topic }: { topic: Topic }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", fontSize: "0.86rem", color: "var(--ink-3)", listStyle: "none", margin: 0, padding: 0 }}>
        <li>
          <Link href="/" style={{ color: "var(--ink-2)", fontWeight: 600, textDecoration: "none" }}>
            Home
          </Link>
        </li>
        <li style={{ opacity: 0.5 }}>/</li>
        <li>
          <Link href="/topics" style={{ color: "var(--ink-2)", fontWeight: 600, textDecoration: "none" }}>
            Guides
          </Link>
        </li>
        <li style={{ opacity: 0.5 }}>/</li>
        <li style={{ color: "var(--ink)", fontWeight: 600 }}>{topic.title}</li>
      </ol>
    </nav>
  );
}

// ─── Share button ─────────────────────────────────────────────────────────────

function ShareButton({ topicSlug }: { topicSlug: string }) {
  const copyLink = useCallback(async () => {
    const url = `${window.location.origin}/topics/${topicSlug}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const inp = document.createElement("input");
      inp.value = url;
      document.body.appendChild(inp);
      inp.select();
      document.execCommand("copy");
      document.body.removeChild(inp);
    }
  }, [topicSlug]);

  return (
    <button
      onClick={copyLink}
      title="Copy guide link"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        background: "var(--card)",
        border: "1px solid var(--line)",
        color: "var(--ink-2)",
        borderRadius: "var(--radius-pill)",
        padding: "8px 14px",
        fontWeight: 700,
        fontSize: "0.82rem",
        cursor: "pointer",
        transition: "all 0.18s ease",
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <circle cx="18" cy="5" r="2.5" />
        <circle cx="6" cy="12" r="2.5" />
        <circle cx="18" cy="19" r="2.5" />
        <path strokeLinecap="round" d="M8.2 10.8l7.6-4.4M8.2 13.2l7.6 4.4" />
      </svg>
      Share
    </button>
  );
}

// ─── Main viewer ──────────────────────────────────────────────────────────────

interface Props {
  topic: Topic;
}

export default function TopicViewer({ topic }: Props) {
  return (
    <div style={{ maxWidth: 1120, margin: "0 auto", padding: "36px 28px 80px", display: "flex", flexDirection: "column", gap: 32 }}>
      {/* Breadcrumb + controls */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <Breadcrumb topic={topic} />
        <ShareButton topicSlug={topic.id} />
      </div>

      {/* Guide header */}
      <div className="anim-float" style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{
          width: 72,
          height: 72,
          borderRadius: 20,
          background: topic.hue.base,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          boxShadow: `0 14px 32px -12px ${topic.hue.base}`,
        }}>
          <TopicIcon id={topic.id} size={34} />
        </div>
        <div style={{ flex: 1, minWidth: 240 }}>
          <h1 className="font-display" style={{ fontSize: "clamp(2.2rem, 5vw, 3.2rem)", color: "var(--ink)", margin: "2px 0 8px", lineHeight: 1.05 }}>
            {topic.title}
          </h1>
          <p style={{ color: "var(--ink-2)", fontSize: "1.05rem", lineHeight: 1.6, maxWidth: 640, margin: "0 0 14px" }}>
            {topic.description}
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <span className="tidbit-pill" style={{ background: topic.hue.soft, color: topic.hue.ink }}>
              {topic.subtopics.length} concepts
            </span>
            <span className="tidbit-pill" style={{ background: "var(--paper-2)", color: "var(--ink-2)" }}>
              Interactive diagrams
            </span>
          </div>
        </div>
      </div>

      {/* Concept list */}
      <TopicRenderer topic={topic} />
    </div>
  );
}
