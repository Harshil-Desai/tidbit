"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type MouseEvent,
} from "react";

interface Props {
  topicSlug: string;
  conceptId: string;
  conceptTitle: string;
}

type CopyState = "idle" | "copied";

function useOrigin() {
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);
  return origin;
}

export default function SharePopover({ topicSlug, conceptId, conceptTitle }: Props) {
  const [open, setOpen] = useState(false);
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const origin = useOrigin();
  const ref = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const shareUrl = origin
    ? `${origin}/topics/${topicSlug}?concept=${conceptId}`
    : `/topics/${topicSlug}?concept=${conceptId}`;

  const ogImageUrl = `/api/og/${topicSlug}/${conceptId}`;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function onDown(e: globalThis.MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Reset image state each time popover opens
  useEffect(() => {
    if (open) {
      setImgLoaded(false);
      setImgError(false);
    }
  }, [open]);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      const inp = document.createElement("input");
      inp.value = shareUrl;
      document.body.appendChild(inp);
      inp.select();
      document.execCommand("copy");
      document.body.removeChild(inp);
    }
    setCopyState("copied");
    setTimeout(() => setCopyState("idle"), 2000);
  }, [shareUrl]);

  const nativeShare = useCallback(async () => {
    if (!navigator.share) return;
    try {
      await navigator.share({ title: conceptTitle, url: shareUrl });
    } catch {
      // user cancelled — fine
    }
  }, [conceptTitle, shareUrl]);

  const canNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  function stopProp(e: MouseEvent) {
    e.stopPropagation();
  }

  return (
    <div className="relative" ref={ref} onClick={stopProp}>
      {/* Trigger */}
      <button
        ref={btnRef}
        onClick={() => setOpen((o) => !o)}
        title="Share this concept"
        aria-label={`Share "${conceptTitle}"`}
        aria-expanded={open}
        className={`inline-flex items-center justify-center h-6 w-6 rounded-full transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 ${
          open
            ? "text-indigo-600 bg-indigo-50"
            : "text-gray-300 hover:text-indigo-500 hover:bg-indigo-50"
        }`}
      >
        <ShareIcon />
      </button>

      {/* Popover */}
      {open && (
        <div className="absolute right-0 bottom-full mb-2 z-40 w-80 rounded-2xl border border-gray-200 bg-white shadow-xl ring-1 ring-black/5 overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="text-sm font-semibold text-gray-900 truncate pr-4">
              {conceptTitle}
            </span>
            <button
              onClick={() => setOpen(false)}
              className="shrink-0 text-gray-400 hover:text-gray-700 transition-colors"
              aria-label="Close"
            >
              <XIcon />
            </button>
          </div>

          {/* OG image preview */}
          <div className="px-4 pt-3 pb-1">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-2">
              Knowledge Card
            </p>
            <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50 aspect-[1200/630]">
              {!imgLoaded && !imgError && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-gray-500" />
                </div>
              )}
              {imgError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-gray-400">
                  <ImageOffIcon />
                  <span className="text-xs">Preview unavailable</span>
                </div>
              ) : (
                <img
                  src={ogImageUrl}
                  alt={`${conceptTitle} knowledge card`}
                  className={`w-full h-full object-cover transition-opacity duration-300 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
                  onLoad={() => setImgLoaded(true)}
                  onError={() => setImgError(true)}
                />
              )}
            </div>
            <a
              href={ogImageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1.5 flex items-center justify-end gap-1 text-[11px] text-gray-400 hover:text-gray-600 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalIcon />
              Open full size
            </a>
          </div>

          {/* URL row */}
          <div className="px-4 pt-2 pb-3">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-2">
              Shareable Link
            </p>
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 pl-3 pr-1.5 py-1.5">
              <span className="flex-1 text-xs text-gray-600 truncate font-mono">
                {origin
                  ? shareUrl.replace(origin, "")
                  : `/topics/${topicSlug}?concept=${conceptId}`}
              </span>
              <button
                onClick={copyLink}
                className={`shrink-0 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
                  copyState === "copied"
                    ? "bg-green-100 text-green-700"
                    : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"
                }`}
              >
                {copyState === "copied" ? (
                  <>
                    <CheckIcon /> Copied
                  </>
                ) : (
                  <>
                    <CopyIcon /> Copy
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className={`px-4 pb-4 flex gap-2 ${canNativeShare ? "" : "hidden"}`}>
            <button
              onClick={nativeShare}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
              <ShareIcon />
              Share via…
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Micro icons ──────────────────────────────────────────────────────────────

function ShareIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
    </svg>
  );
}

function ImageOffIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
    </svg>
  );
}
