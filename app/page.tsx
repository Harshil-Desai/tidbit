import TopicGrid from "@/components/TopicGrid";
import SearchBarTrigger from "@/components/SearchBarTrigger";
import { topics } from "@/data/topics";

export default function Home() {
  const totalSubtopics = topics.reduce((sum, t) => sum + t.subtopics.length, 0);

  return (
    <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 28px", paddingTop: 56, paddingBottom: 80 }}>
      {/* Hero */}
      <section style={{ maxWidth: 820, margin: "0 auto 64px", textAlign: "center" }}>
        <div className="anim-float" style={{ animationDelay: "0.02s" }}>
          <span className="tidbit-pill" style={{ background: "var(--brand-soft)", color: "var(--brand-ink)", display: "inline-flex", alignItems: "center", gap: 6 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            {topics.length} guides · {totalSubtopics} bite-sized concepts
          </span>
        </div>

        <h1 className="font-display anim-float" style={{
          fontSize: "clamp(3rem, 7vw, 5.4rem)",
          color: "var(--ink)",
          margin: "22px 0 0",
          animationDelay: "0.08s",
        }}>
          Big ideas,<br />
          served in{" "}
          <em style={{ color: "var(--brand)", fontStyle: "italic" }}>small bites.</em>
        </h1>

        <p className="anim-float" style={{
          fontSize: "1.18rem",
          color: "var(--ink-2)",
          lineHeight: 1.65,
          maxWidth: 560,
          margin: "24px auto 0",
          animationDelay: "0.14s",
        }}>
          Tidbit turns dense, intimidating tech into friendly visual guides you can actually
          digest: system design, databases, AI, and more.
        </p>

        <div className="anim-float" style={{
          display: "flex",
          gap: 12,
          justifyContent: "center",
          marginTop: 34,
          flexWrap: "wrap",
          animationDelay: "0.2s",
        }}>
          <a
            href="#guides"
            style={{
              background: "var(--brand)",
              color: "#fff",
              border: "none",
              borderRadius: "var(--radius-pill)",
              padding: "14px 26px",
              fontWeight: 700,
              fontSize: "1rem",
              boxShadow: "0 14px 30px -12px var(--brand)",
              textDecoration: "none",
              display: "inline-block",
              cursor: "pointer",
            }}
          >
            Browse the guides
          </a>
          <SearchBarTrigger />
        </div>
      </section>

      {/* Guide grid */}
      <section id="guides" style={{ scrollMarginTop: 90 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 22, flexWrap: "wrap", gap: 8 }}>
          <h2 className="font-display" style={{ fontSize: "2.2rem", color: "var(--ink)", margin: 0 }}>
            The guides
          </h2>
          <span style={{ color: "var(--ink-3)", fontSize: "0.95rem" }}>
            Pick a shelf and start nibbling.
          </span>
        </div>
        <TopicGrid />
      </section>
    </div>
  );
}
