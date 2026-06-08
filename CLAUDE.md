# Byte-Sized Knowledge — Claude Code Guide

## Project Overview

A Next.js 16 App Router site that serves interactive revision guides for six major CS topics. Each topic is a self-contained encyclopedia (large JSX file) with its own internal navigation, SVG diagrams, and code examples. The outer shell manages routing, search, favourites, dark mode, and SEO.

## Tech Stack

- **Next.js 16.2.7** — App Router, SSG for topic pages, Edge runtime for OG image API
- **React 19** — Client components for all interactive UI
- **Tailwind CSS v4** — `@import "tailwindcss"` + `@custom-variant dark` for class-based dark mode
- **TypeScript 5** — strict throughout; JSX encyclopedia files remain `.jsx`
- **No external UI library** — all components are hand-rolled

## Commands

```bash
npm run dev      # start dev server (requires Node ≥ 18; use nvm use 22)
npm run build    # production build
npm run start    # serve production build
```

> On this machine: `nvm use 22.14.0` before running any npm command.

## Directory Structure

```
app/
  layout.tsx                   # root layout: header, skip link, theme script, dark mode
  page.tsx                     # home page (hero + TopicGrid)
  globals.css                  # Tailwind v4 imports, CSS vars, dark vars, animations
  robots.ts                    # /robots.txt via Next.js Metadata API
  sitemap.ts                   # /sitemap.xml — covers all topics + 124 concept deep-links
  favorites/page.tsx           # favourites list (client component, localStorage)
  topics/
    page.tsx                   # /topics index (placeholder)
    [slug]/page.tsx            # topic page — generateMetadata + JSON-LD + TopicViewer
  api/og/[topic]/[concept]/
    route.tsx                  # Edge route: 1200×630 OG image via next/og ImageResponse

components/
  TopicGrid.tsx                # home page card grid with search filter + saved badge
  TopicViewer.tsx              # topic page shell: breadcrumb, tablist, ShareButton, TopicRenderer
  TopicRenderer.tsx            # open/close drawer, subtopic list with heart + share icons
  SearchBar.tsx                # Cmd/Ctrl+K command palette — searches topics + all 124 concepts
  FavoriteButton.tsx           # animated heart; reads/writes via useFavorites hook
  FavoritesNavItem.tsx         # nav link with live count badge
  SharePopover.tsx             # floating popover: OG preview, copy URL, native share
  ThemeToggle.tsx              # sun/moon button; delegates to useTheme hook
  encyclopedias/
    *.jsx                      # six self-contained encyclopedia apps (do not restructure)
    *Wrapper.tsx               # next/dynamic wrappers — accept initialConceptId, DOM-click nav
    EncyclopediaLoader.tsx     # shared spinner shown while encyclopedia chunk loads

data/
  topics.ts                    # Topic[] — id, title, description, icon, color, subtopics[]
  searchIndex.ts               # SearchEntry[] — 124 entries across all 6 encyclopedias

hooks/
  useFavorites.ts              # localStorage r/w + storage event cross-tab sync
  useTheme.ts                  # localStorage theme pref + system pref listener

lib/
  favorites.ts                 # pure read/write helpers for favourites (SSR-safe)
  conceptUtils.ts              # resolveSubtopic, subtopicToConceptId, conceptPageTitle, etc.
  ogColors.ts                  # maps Tailwind gradient classes → hex palettes for OG images
```

## Key Patterns

### Encyclopedia Integration

Each encyclopedia (`*.jsx`) is a self-contained React app with its own internal navigation state. They are **not modified beyond one attribute**: every nav button has `data-concept-id="..."` added so wrappers can deep-link via `querySelector(...).click()`.

The wrapper pattern:
1. `next/dynamic` with `ssr: false` and `loading: EncyclopediaLoader`
2. `useEffect` retries `querySelector('[data-concept-id="${id}"]')?.click()` up to 10× after mount to handle async render

### Deep Linking (`?concept=`)

URL: `/topics/system-design?concept=load-balancing`

Flow: `page.tsx` reads `searchParams.concept` → passes to `TopicViewer` as `initialConceptId` → `resolveSubtopic()` selects the correct tab → `TopicRenderer` auto-opens the drawer → wrapper DOM-clicks the nav item.

### Dark Mode (Tailwind v4)

`@custom-variant dark (&:where(.dark, .dark *));` in `globals.css` enables `dark:` classes when `<html class="dark">` is set. A blocking inline `<script>` in `layout.tsx` reads `localStorage.getItem('bsk-theme')` before first paint to prevent flash.

### OG Image Generation

`/api/og/[topic]/[concept]` is an Edge route using `ImageResponse` from `next/og`. It looks up the topic + concept from static data (no DB), renders a 1200×630 JSX template with inline styles, and returns a PNG. Palette is sourced from `lib/ogColors.ts`.

### Favourites

Stored at `localStorage["byte-sized-knowledge-favorites"]` as `Favorite[]`. The `useFavorites` hook hydrates on mount (avoiding SSR mismatch) and listens to the native `storage` event for cross-tab sync.

### Search Index

`data/searchIndex.ts` is a static array of 124 `SearchEntry` objects — no runtime extraction from encyclopedias. It is the source of truth for the command palette, deep-link resolution, OG metadata, and structured data.

## Data Conventions

- **Topic slug** (`topicSlug` / `topic.id`): kebab-case, e.g. `"system-design"`
- **Concept ID** (`conceptId`): matches the encyclopedia's internal identifier:
  - SystemDesign, DesignPatterns → slug of title, e.g. `"load-balancing"`
  - AiLlm, Postgres, ProductionAiAgents → numeric string, e.g. `"8"`
  - CloudArchitecture → string slug, e.g. `"circuit-breaker"`
- **Topic color** (`topic.color`): Tailwind gradient class, e.g. `"from-blue-100 to-blue-200"` — used in cards, OG images, and drawer headers

## Adding a New Topic

1. Add a `.jsx` encyclopedia file to `components/encyclopedias/`
2. Add `data-concept-id="..."` to each nav button in the encyclopedia
3. Create a `*Wrapper.tsx` with `next/dynamic` + `initialConceptId` click logic
4. Add the topic to `data/topics.ts` with id, title, description, icon, color, subtopics
5. Add all concepts to `data/searchIndex.ts`
6. Add the entry to `ENCYCLOPEDIA_MAP` in `components/TopicRenderer.tsx`
7. Add the hex palette to `lib/ogColors.ts`

## Accessibility Notes

- TabBar uses `role="tablist"` / `role="tab"` with arrow-key navigation (←→ + Home/End)
- Encyclopedia drawer: focus moves to close button on open, returns to trigger on close
- All decorative SVGs and emoji have `aria-hidden="true"`
- Skip-to-content link visible on `:focus` (`.skip-link` in `globals.css`)
- `forced-colors` media query in `globals.css` for Windows High Contrast

## SEO Notes

- `app/sitemap.ts` generates 131 URLs (3 static + 6 topics + 124 concepts)
- JSON-LD: topic pages → `schema.org/Course`; concept pages → `schema.org/LearningResource`
- OG image URL is set in `generateMetadata` when `?concept=` is present; `twitter:card` switches to `summary_large_image`
- `metadataBase` is set to `https://bytesizedknowledge.com` in root layout
