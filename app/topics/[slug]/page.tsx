import { notFound } from "next/navigation";
import { topics } from "@/data/topics";
import TopicViewer from "@/components/TopicViewer";
import ConceptView from "@/components/ConceptView";
import { conceptPageTitle, conceptPageDescription, resolveSubtopic } from "@/lib/conceptUtils";

const BASE_URL = "https://tidbit.app";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ concept?: string }>;
};

export function generateStaticParams() {
  return topics.map((t) => ({ slug: t.id }));
}

export async function generateMetadata({ params, searchParams }: Props) {
  const { slug } = await params;
  const { concept } = await searchParams;
  const topic = topics.find((t) => t.id === slug);
  if (!topic) return {};

  const conceptId = concept ?? null;
  const title = conceptPageTitle(slug, conceptId);
  const description = conceptPageDescription(slug, conceptId);
  const ogImage = conceptId
    ? { url: `/api/og/${slug}/${conceptId}`, width: 1200, height: 630, alt: title }
    : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: `${BASE_URL}/topics/${slug}${conceptId ? `?concept=${conceptId}` : ""}`,
      ...(ogImage && { images: [ogImage] }),
    },
    twitter: {
      card: conceptId ? "summary_large_image" : "summary",
      title,
      description,
      ...(ogImage && { images: [ogImage.url] }),
    },
    alternates: {
      canonical: `${BASE_URL}/topics/${slug}${conceptId ? `?concept=${conceptId}` : ""}`,
    },
  };
}

function buildJsonLd(slug: string, conceptId: string | null) {
  const topic = topics.find((t) => t.id === slug);
  if (!topic) return null;

  const url = `${BASE_URL}/topics/${slug}${conceptId ? `?concept=${conceptId}` : ""}`;
  const name = conceptPageTitle(slug, conceptId).split(" | ")[0];
  const description = conceptPageDescription(slug, conceptId);

  // CourseUnit for individual concepts; Course for the whole topic
  if (conceptId) {
    return {
      "@context": "https://schema.org",
      "@type": "LearningResource",
      name,
      description,
      url,
      inLanguage: "en",
      learningResourceType: "Reference",
      educationalLevel: "Professional",
      isPartOf: {
        "@type": "Course",
        name: topic.title,
        url: `${BASE_URL}/topics/${slug}`,
        provider: { "@type": "Organization", name: "Tidbit", url: BASE_URL },
      },
    };
  }

  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: topic.title,
    description: topic.description,
    url,
    inLanguage: "en",
    hasCourseInstance: topic.subtopics.map((s) => ({
      "@type": "CourseInstance",
      name: s.name,
      description: s.description,
    })),
    provider: { "@type": "Organization", name: "Tidbit", url: BASE_URL },
    numberOfCredits: topic.subtopics.length,
  };
}

export default async function TopicPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { concept } = await searchParams;
  const topic = topics.find((t) => t.id === slug);
  if (!topic) notFound();

  const jsonLd = buildJsonLd(slug, concept ?? null);

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {concept ? (
        (() => {
          const subtopic = resolveSubtopic(topic, concept);
          return subtopic
            ? <ConceptView topic={topic} subtopic={subtopic} />
            : <TopicViewer topic={topic} />;
        })()
      ) : (
        <TopicViewer topic={topic} />
      )}
    </>
  );
}
