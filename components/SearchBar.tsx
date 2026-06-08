"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  type KeyboardEvent,
} from "react";
import { useRouter } from "next/navigation";
import { topics } from "@/data/topics";
import TopicIcon from "@/components/TopicIcon";
import { searchIndex, type SearchEntry } from "@/data/searchIndex";

type ResultGroup = {
  topicSlug: string;
  topicTitle: string;
  topicIcon: string;
  items: SearchEntry[];
};

function buildGroups(entries: SearchEntry[]): ResultGroup[] {
  const map = new Map<string, ResultGroup>();
  for (const e of entries) {
    if (!map.has(e.topicSlug)) {
      map.set(e.topicSlug, {
        topicSlug: e.topicSlug,
        topicTitle: e.topicTitle,
        topicIcon: e.topicIcon,
        items: [],
      });
    }
    map.get(e.topicSlug)!.items.push(e);
  }
  return Array.from(map.values());
}

const TOPIC_ENTRIES = topics.map((t) => ({
  topicSlug: t.id,
  topicTitle: t.title,
  topicIcon: t.icon,
  topicColor: t.color,
  conceptId: "",
  conceptTitle: t.description.slice(0, 60) + "...",
  category: `${t.subtopics.length} concepts`,
}));

export default function SearchBar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().includes("MAC"));
    function onKey(e: globalThis.KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    }
    function onCustom() { setOpen(true); }
    window.addEventListener("keydown", onKey);
    window.addEventListener("tidbit:open-search", onCustom);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("tidbit:open-search", onCustom);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setCursor(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    } else {
      setQuery("");
    }
  }, [open]);

  useEffect(() => { setCursor(0); }, [query]);

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLLIElement>("[data-active='true']");
    el?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  const results: SearchEntry[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const scored: Array<{ entry: SearchEntry; score: number }> = [];
    for (const entry of searchIndex) {
      const titleMatch = entry.conceptTitle.toLowerCase().includes(q);
      const catMatch = entry.category.toLowerCase().includes(q);
      const topicMatch = entry.topicTitle.toLowerCase().includes(q);
      if (!titleMatch && !catMatch && !topicMatch) continue;
      let score = 0;
      if (entry.conceptTitle.toLowerCase().startsWith(q)) score += 3;
      else if (titleMatch) score += 2;
      if (catMatch) score += 1;
      if (topicMatch) score += 0.5;
      scored.push({ entry, score });
    }
    return scored.sort((a, b) => b.score - a.score).slice(0, 40).map((s) => s.entry);
  }, [query]);

  const groups = useMemo(
    () => (query.trim() ? buildGroups(results) : buildGroups(TOPIC_ENTRIES)),
    [query, results]
  );

  const flatItems = useMemo(() => groups.flatMap((g) => g.items), [groups]);

  const navigate = useCallback(
    (entry: SearchEntry) => {
      const url = entry.conceptId
        ? `/topics/${entry.topicSlug}?concept=${entry.conceptId}`
        : `/topics/${entry.topicSlug}`;
      router.push(url);
      setOpen(false);
      setQuery("");
    },
    [router]
  );

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setCursor((c) => Math.min(c + 1, flatItems.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setCursor((c) => Math.max(c - 1, 0));
      } else if (e.key === "Enter") {
        const item = flatItems[cursor];
        if (item) navigate(item);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    },
    [cursor, flatItems, navigate]
  );

  let itemIndex = 0;

  return (
    <>
      {/* Desktop trigger */}
      <button
        onClick={() => setOpen(true)}
        className="hidden sm:flex"
        aria-label="Open search"
        style={{
          alignItems: "center",
          gap: 10,
          background: "var(--card)",
          border: "1px solid var(--line)",
          borderRadius: "var(--radius-pill)",
          padding: "8px 12px 8px 14px",
          color: "var(--ink-3)",
          fontSize: "0.86rem",
          fontWeight: 500,
          cursor: "pointer",
        }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4-4" strokeLinecap="round" />
        </svg>
        <span>Search</span>
        <kbd style={{
          fontSize: "0.7rem",
          background: "var(--paper-2)",
          border: "1px solid var(--line)",
          borderRadius: 6,
          padding: "2px 6px",
          color: "var(--ink-3)",
          fontFamily: "ui-monospace, monospace",
        }}>
          {isMac ? "⌘K" : "Ctrl+K"}
        </kbd>
      </button>

      {/* Mobile trigger */}
      <button
        onClick={() => setOpen(true)}
        className="sm:hidden"
        aria-label="Open search"
        style={{ display: "flex", width: 36, height: 36, alignItems: "center", justifyContent: "center", background: "var(--card)", border: "1px solid var(--line)", borderRadius: "var(--radius-pill)", color: "var(--ink-2)", cursor: "pointer" }}
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4-4" strokeLinecap="round" />
        </svg>
      </button>

      {/* Palette modal */}
      {open && (
        <div
          onMouseDown={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 90,
            background: "rgba(44,34,48,0.42)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            padding: "12vh 20px 20px",
            animation: "overlay-in 0.15s ease both",
          }}
        >
          <div
            onMouseDown={(e) => e.stopPropagation()}
            className="tidbit-card"
            onKeyDown={onKeyDown}
            style={{
              width: "100%",
              maxWidth: 580,
              overflow: "hidden",
              boxShadow: "var(--shadow)",
              animation: "sheet-in 0.2s cubic-bezier(0.22,0.68,0,1) both",
            }}
          >
            {/* Input */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", borderBottom: "1px solid var(--line)" }}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth="2.2">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4-4" strokeLinecap="round" />
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search guides and concepts..."
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontSize: "1.05rem",
                  color: "var(--ink)",
                  fontFamily: "inherit",
                }}
                autoComplete="off"
                spellCheck={false}
              />
              <kbd style={{ fontSize: "0.7rem", background: "var(--paper-2)", border: "1px solid var(--line)", borderRadius: 6, padding: "3px 7px", color: "var(--ink-3)", fontFamily: "ui-monospace, monospace" }}>
                esc
              </kbd>
            </div>

            {/* Results */}
            <div style={{ maxHeight: "52vh", overflowY: "auto", padding: 8 }}>
              {flatItems.length === 0 && query.trim() ? (
                <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--ink-3)" }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true" style={{ marginBottom: 6 }}>
                    <circle cx="11" cy="11" r="7" />
                    <path d="M21 21l-4-4" />
                  </svg>
                  No matches for &ldquo;{query}&rdquo;
                </div>
              ) : (
                <ul ref={listRef} role="listbox" style={{ margin: 0, padding: 0, listStyle: "none" }}>
                  {groups.map((group) =>
                    group.items.map((entry) => {
                      const idx = itemIndex++;
                      const isActive = cursor === idx;
                      const topic = topics.find((t) => t.id === group.topicSlug);
                      return (
                        <li
                          key={`${entry.topicSlug}-${entry.conceptId || entry.conceptTitle}`}
                          role="option"
                          aria-selected={isActive}
                          data-active={isActive}
                          onMouseEnter={() => setCursor(idx)}
                          onClick={() => navigate(entry)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 13,
                            padding: "11px 13px",
                            borderRadius: "calc(var(--radius) * 0.5)",
                            background: isActive ? "var(--paper-2)" : "transparent",
                            cursor: "pointer",
                            marginBottom: 2,
                          }}
                        >
                          <div style={{
                            width: 34,
                            height: 34,
                            borderRadius: 11,
                            background: topic ? topic.hue.base : "var(--paper-2)",
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}>
                            <TopicIcon id={group.topicSlug} size={18} strokeWidth={2.2} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 700, color: "var(--ink)", fontSize: "0.96rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {entry.conceptTitle}
                            </div>
                            <div style={{ fontSize: "0.8rem", color: "var(--ink-3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {group.topicTitle}
                            </div>
                          </div>
                          <span className="tidbit-pill" style={{ background: "transparent", color: "var(--ink-3)", border: "1px solid var(--line)", fontSize: "0.66rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                            {entry.conceptId ? "concept" : "guide"}
                          </span>
                        </li>
                      );
                    })
                  )}
                </ul>
              )}
            </div>

            {/* Footer */}
            <div style={{ display: "flex", gap: 16, padding: "10px 18px", borderTop: "1px solid var(--line)", color: "var(--ink-3)", fontSize: "0.76rem" }}>
              <span><kbd style={{ fontFamily: "ui-monospace, monospace" }}>↑↓</kbd> navigate</span>
              <span><kbd style={{ fontFamily: "ui-monospace, monospace" }}>↵</kbd> open</span>
              <span style={{ marginLeft: "auto" }}>
                {query.trim() ? `${flatItems.length} result${flatItems.length !== 1 ? "s" : ""}` : `${searchIndex.length} concepts`}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
