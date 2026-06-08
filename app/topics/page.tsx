import TopicGrid from "@/components/TopicGrid";
import { topics } from "@/data/topics";

export const metadata = {
  title: "Guides",
  description: "All Tidbit guides: system design, design patterns, PostgreSQL internals, cloud architecture, AI and LLMs, and production AI agents.",
};

export default function TopicsPage() {
  const totalConcepts = topics.reduce((sum, t) => sum + t.subtopics.length, 0);

  return (
    <div style={{ maxWidth: 1120, margin: "0 auto", padding: "36px 28px 80px" }}>
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ marginBottom: 12 }}>
          <span className="tidbit-pill" style={{ background: "var(--brand-soft)", color: "var(--brand-ink)" }}>
            {topics.length} guides · {totalConcepts} concepts
          </span>
        </div>
        <h1 className="font-display" style={{ fontSize: "clamp(2.4rem, 5vw, 3.6rem)", color: "var(--ink)", margin: "0 0 12px", lineHeight: 1 }}>
          All guides
        </h1>
        <p style={{ color: "var(--ink-2)", fontSize: "1.1rem", lineHeight: 1.6, maxWidth: 560, margin: 0 }}>
          Pick a shelf and start nibbling. Each guide is a self-contained visual reference built for engineers who want to go deep fast.
        </p>
      </div>

      <TopicGrid />
    </div>
  );
}
