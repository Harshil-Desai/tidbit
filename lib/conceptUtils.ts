import { searchIndex, type SearchEntry } from "@/data/searchIndex";
import { topics, type Topic, type Subtopic } from "@/data/topics";

/** Look up a searchIndex entry by topicSlug + conceptId. */
export function findEntry(topicSlug: string, conceptId: string): SearchEntry | undefined {
  return searchIndex.find(
    (e) => e.topicSlug === topicSlug && e.conceptId === conceptId
  );
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Given a topicSlug + conceptId, return the best-matching Subtopic from
 * topics.ts.
 */
export function resolveSubtopic(
  topic: Topic,
  conceptId: string
): Subtopic | null {
  // Normalize: strip all non-alphanumeric for loose comparison
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

  // 1. Try searchIndex match first (works for indexed concepts)
  const entry = findEntry(topic.id, conceptId);
  if (entry) {
    const needle = entry.conceptTitle.toLowerCase();
    const needleNorm = normalize(entry.conceptTitle);
    const exact = topic.subtopics.find((s) => s.name.toLowerCase() === needle);
    if (exact) return exact;
    // Normalized match — handles ":" vs "—", "&" vs "and", etc.
    const normMatch = topic.subtopics.find((s) => normalize(s.name) === needleNorm);
    if (normMatch) return normMatch;
    const partial = topic.subtopics.find(
      (s) =>
        needle.startsWith(s.name.toLowerCase()) ||
        s.name.toLowerCase().startsWith(needle)
    );
    if (partial) return partial;
    const categoryWords = entry.category.toLowerCase().split(/\W+/).filter(Boolean);
    const catMatch = topic.subtopics.find((s) =>
      categoryWords.some((w) => w.length > 3 && s.name.toLowerCase().includes(w))
    );
    if (catMatch) return catMatch;
  }

  // 2. Fallback: match conceptId against slugified subtopic names
  //    (handles cases where subtopicToConceptId fell back to slugifying the name)
  const bySlug = topic.subtopics.find((s) => slugify(s.name) === conceptId);
  if (bySlug) return bySlug;

  return null;
}

/** Return the conceptId to embed in the URL for a given subtopic (best match). */
export function subtopicToConceptId(topic: Topic, subtopic: Subtopic): string | null {
  const entry = searchIndex.find(
    (e) =>
      e.topicSlug === topic.id &&
      e.conceptTitle.toLowerCase() === subtopic.name.toLowerCase()
  );
  return entry?.conceptId ?? null;
}

/** Build the shareable URL for a concept. Works in both server and client contexts. */
export function conceptUrl(topicSlug: string, conceptId: string | null): string {
  const base = `/topics/${topicSlug}`;
  return conceptId ? `${base}?concept=${conceptId}` : base;
}

/** Human-readable page title for SEO / <title>. */
export function conceptPageTitle(topicSlug: string, conceptId: string | null): string {
  const topic = topics.find((t) => t.id === topicSlug);
  if (!topic) return "Tidbit";

  if (conceptId) {
    const entry = findEntry(topicSlug, conceptId);
    if (entry) {
      return `${entry.conceptTitle} | ${topic.title} | Tidbit`;
    }
  }

  return `${topic.title} | Tidbit`;
}

/** Meta description for a concept page. */
export function conceptPageDescription(topicSlug: string, conceptId: string | null): string {
  const topic = topics.find((t) => t.id === topicSlug);
  if (!topic) return "";

  if (conceptId) {
    const entry = findEntry(topicSlug, conceptId);
    if (entry) {
      const sub = topic.subtopics.find(
        (s) => s.name.toLowerCase() === entry.conceptTitle.toLowerCase()
      );
      if (sub) return sub.description;
      return `${entry.conceptTitle}, part of the ${topic.title} guide on Tidbit.`;
    }
  }

  return topic.description;
}
