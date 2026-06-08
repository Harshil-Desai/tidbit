export const STORAGE_KEY = "tidbit-favorites";

export type Favorite = {
  topicSlug: string;
  topicTitle: string;
  topicIcon: string;
  topicColor: string;
  conceptId: string;
  conceptTitle: string;
  category: string;
  savedAt: number;
};

export function readFavorites(): Favorite[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeFavorites(favs: Favorite[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favs));
  } catch {
    // storage full — silently ignore
  }
}

export function isFavorited(favs: Favorite[], topicSlug: string, conceptId: string): boolean {
  return favs.some((f) => f.topicSlug === topicSlug && f.conceptId === conceptId);
}

export function addFavorite(favs: Favorite[], entry: Omit<Favorite, "savedAt">): Favorite[] {
  if (isFavorited(favs, entry.topicSlug, entry.conceptId)) return favs;
  return [...favs, { ...entry, savedAt: Date.now() }];
}

export function removeFavorite(favs: Favorite[], topicSlug: string, conceptId: string): Favorite[] {
  return favs.filter((f) => !(f.topicSlug === topicSlug && f.conceptId === conceptId));
}
