import { ImageResponse } from "next/og";
import { topics } from "@/data/topics";
import { searchIndex } from "@/data/searchIndex";
import { getPalette } from "@/lib/ogColors";

export const runtime = "edge";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ topic: string; concept: string }> }
) {
  const { topic: topicSlug, concept: conceptId } = await params;

  const topic = topics.find((t) => t.id === topicSlug);
  const entry = searchIndex.find(
    (e) => e.topicSlug === topicSlug && e.conceptId === conceptId
  );

  if (!topic || !entry) {
    return new Response("Not found", { status: 404 });
  }

  // Find the matching subtopic description if available
  const subtopic = topic.subtopics.find(
    (s) => s.name.toLowerCase() === entry.conceptTitle.toLowerCase()
  );
  const description = subtopic?.description ?? entry.category;

  const pal = getPalette(topic.color);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: `linear-gradient(135deg, ${pal.gradFrom} 0%, ${pal.gradTo} 100%)`,
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background texture dots */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `radial-gradient(circle, ${pal.accentSoft}22 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
        />

        {/* Top accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            background: `linear-gradient(90deg, ${pal.accent}, ${pal.accentSoft})`,
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            padding: "60px 72px",
            justifyContent: "space-between",
          }}
        >
          {/* Top row: topic pill */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: pal.pill,
                color: pal.pillText,
                borderRadius: 999,
                padding: "8px 20px",
                fontSize: 16,
                fontWeight: 600,
                letterSpacing: "0.02em",
              }}
            >
              <span>{topic.title}</span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "rgba(255,255,255,0.55)",
                borderRadius: 999,
                padding: "8px 16px",
                fontSize: 14,
                fontWeight: 600,
                color: pal.accent,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              {entry.category}
            </div>
          </div>

          {/* Centre: concept title + description */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20, flex: 1, justifyContent: "center", paddingTop: 32, paddingBottom: 16 }}>
            <div
              style={{
                fontSize: entry.conceptTitle.length > 40 ? 52 : 62,
                fontWeight: 800,
                color: pal.accent,
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
              }}
            >
              {entry.conceptTitle}
            </div>
            <div
              style={{
                fontSize: 24,
                color: pal.accentSoft,
                lineHeight: 1.5,
                fontWeight: 400,
                maxWidth: 820,
              }}
            >
              {description}
            </div>
          </div>

          {/* Bottom row: site branding */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderTop: `1.5px solid ${pal.accentSoft}44`,
              paddingTop: 24,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                color: pal.accent,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: pal.accent,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: pal.pillText,
                  fontSize: 16,
                  fontWeight: 800,
                }}
              >
                B
              </div>
              <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.01em" }}>
                Tidbit
              </span>
            </div>
            <div
              style={{
                fontSize: 16,
                color: pal.accentSoft,
                fontWeight: 500,
              }}
            >
              tidbit.app
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
