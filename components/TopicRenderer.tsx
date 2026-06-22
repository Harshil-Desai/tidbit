"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Topic } from "@/data/topics";
import { subtopicToConceptId } from "@/lib/conceptUtils";
import FavoriteButton from "@/components/FavoriteButton";

interface Props {
  topic: Topic;
}

export default function TopicRenderer({ topic }: Props) {
  const router = useRouter();

  const openConcept = (conceptId: string) => {
    router.push(`/topics/${topic.id}?concept=${conceptId}`);
  };

  return (
    <div
      className="tidbit-card"
      role="list"
      aria-label={`${topic.title} concepts`}
      style={{ overflow: "hidden" }}
    >
      {topic.subtopics.map((s, i) => {
        const conceptId = subtopicToConceptId(topic, s) ?? s.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        return (
          <ConceptRow
            key={s.name}
            topic={topic}
            name={s.name}
            description={s.description}
            conceptId={conceptId}
            index={i}
            isLast={i === topic.subtopics.length - 1}
            onOpen={() => openConcept(conceptId)}
          />
        );
      })}
    </div>
  );
}

interface RowProps {
  topic: Topic;
  name: string;
  description: string;
  conceptId: string;
  index: number;
  isLast: boolean;
  onOpen: () => void;
}

function ConceptRow({ topic, name, description, conceptId, index, isLast, onOpen }: RowProps) {
  const [hover, setHover] = useState(false);

  return (
    <>
      <div
        role="listitem"
        onClick={onOpen}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "clamp(12px, 2vw, 16px)",
          padding: "clamp(12px, 3vw, 16px) clamp(12px, 3vw, 18px)",
          borderRadius: "calc(var(--radius, 22px) * 0.6)",
          cursor: "pointer",
          background: hover ? "var(--paper-2)" : "transparent",
          transition: "background 0.15s ease",
        }}
      >
        {/* Index */}
        <span
          aria-hidden="true"
          style={{
            fontSize: "0.8rem",
            color: topic.hue.base,
            fontWeight: 700,
            width: 26,
            flexShrink: 0,
            fontFamily: "ui-monospace, monospace",
          }}
        >
          {String(index + 1).padStart(2, "0")}
        </span>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
            <span style={{ fontWeight: 700, color: "var(--ink)", fontSize: "1.02rem" }}>{name}</span>
          </div>
          <div style={{
            color: "var(--ink-2)",
            fontSize: "0.9rem",
            lineHeight: 1.5,
            marginTop: 3,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 1,
            WebkitBoxOrient: "vertical",
          }}>
            {description}
          </div>
        </div>

        {/* Favorite — stop propagation */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{ flexShrink: 0 }}
        >
          <FavoriteButton
            size="sm"
            topicSlug={topic.id}
            topicTitle={topic.title}
            topicIcon={topic.icon}
            topicColor={topic.color}
            conceptId={conceptId}
            conceptTitle={name}
            category={description.slice(0, 60)}
          />
        </div>

        {/* Arrow */}
        <svg
          aria-hidden="true"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke={topic.hue.base}
          strokeWidth="2.4"
          style={{
            flexShrink: 0,
            opacity: hover ? 1 : 0.35,
            transform: hover ? "translateX(2px)" : "none",
            transition: "all 0.15s ease",
          }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
        </svg>
      </div>

      {/* Divider */}
      {!isLast && (
        <div style={{ height: 1, background: "var(--line-soft)", margin: "0 18px" }} aria-hidden="true" />
      )}
    </>
  );
}
