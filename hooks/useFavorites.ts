"use client";

import { useState, useEffect, useCallback } from "react";
import {
  readFavorites,
  writeFavorites,
  addFavorite,
  removeFavorite,
  isFavorited,
  STORAGE_KEY,
  type Favorite,
} from "@/lib/favorites";

export function useFavorites() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage on mount (avoids SSR mismatch)
  useEffect(() => {
    setFavorites(readFavorites());
    setHydrated(true);
  }, []);

  // Sync across tabs / windows via the native storage event
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY) {
        setFavorites(readFavorites());
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const save = useCallback((next: Favorite[]) => {
    setFavorites(next);
    writeFavorites(next);
  }, []);

  const toggle = useCallback(
    (entry: Omit<Favorite, "savedAt">) => {
      setFavorites((prev) => {
        const next = isFavorited(prev, entry.topicSlug, entry.conceptId)
          ? removeFavorite(prev, entry.topicSlug, entry.conceptId)
          : addFavorite(prev, entry);
        writeFavorites(next);
        return next;
      });
    },
    []
  );

  const remove = useCallback(
    (topicSlug: string, conceptId: string) => {
      setFavorites((prev) => {
        const next = removeFavorite(prev, topicSlug, conceptId);
        writeFavorites(next);
        return next;
      });
    },
    []
  );

  const clearAll = useCallback(() => save([]), [save]);

  const isStarred = useCallback(
    (topicSlug: string, conceptId: string) =>
      hydrated && isFavorited(favorites, topicSlug, conceptId),
    [favorites, hydrated]
  );

  const countForTopic = useCallback(
    (topicSlug: string) =>
      hydrated ? favorites.filter((f) => f.topicSlug === topicSlug).length : 0,
    [favorites, hydrated]
  );

  return { favorites, hydrated, toggle, remove, clearAll, isStarred, countForTopic };
}
