import { MetadataRoute } from "next";
import { topics } from "@/data/topics";
import { searchIndex } from "@/data/searchIndex";

const BASE_URL = "https://tidbit.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/topics`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/favorites`, lastModified: now, changeFrequency: "never", priority: 0.2 },
  ];

  const topicRoutes: MetadataRoute.Sitemap = topics.map((t) => ({
    url: `${BASE_URL}/topics/${t.id}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  // One URL per concept so search engines can index deep-linked content
  const conceptRoutes: MetadataRoute.Sitemap = searchIndex.map((e) => ({
    url: `${BASE_URL}/topics/${e.topicSlug}?concept=${e.conceptId}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...topicRoutes, ...conceptRoutes];
}
