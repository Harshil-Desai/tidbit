import type { Metadata } from "next";
import { Newsreader } from "next/font/google";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import FavoritesNavItem from "@/components/FavoritesNavItem";
import ThemeToggle from "@/components/ThemeToggle";
import "./globals.css";

const BASE_URL = "https://tidbit.app";

const newsreader = Newsreader({
  variable: "--font-display",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Tidbit",
    template: "%s | Tidbit",
  },
  description:
    "Quick revision guides for major CS topics: system design, design patterns, databases, cloud architecture, and AI. Big ideas served in small bites.",
  keywords: [
    "system design", "design patterns", "PostgreSQL internals", "cloud architecture",
    "AI", "LLM", "machine learning", "software engineering", "computer science",
  ],
  authors: [{ name: "Tidbit" }],
  openGraph: {
    siteName: "Tidbit",
    type: "website",
    locale: "en_US",
  },
  twitter: { card: "summary", site: "@tidbitapp" },
  robots: { index: true, follow: true },
};

const themeScript = `
(function(){
  try {
    var t = localStorage.getItem('bsk-theme') || 'system';
    var dark = t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (dark) document.documentElement.classList.add('dark');
  } catch(e) {}
})();
`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${newsreader.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col transition-colors duration-300" style={{ background: "var(--paper)", color: "var(--ink)" }}>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>

        <header style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          background: "color-mix(in srgb, var(--paper) 82%, transparent)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          borderBottom: "1px solid var(--line)",
        }}>
          <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 clamp(16px, 5vw, 28px)", height: "clamp(56px, 12vw, 68px)", display: "flex", alignItems: "center", gap: "clamp(12px, 3vw, 26px)" }}>
            {/* Wordmark */}
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: "clamp(6px, 1.5vw, 10px)", textDecoration: "none" }}>
              <svg width={24} height={24} viewBox="0 0 32 32" aria-hidden="true" style={{ flexShrink: 0, minWidth: 24, minHeight: 24 }}>
                <defs>
                  <mask id="bite-24">
                    <rect x="0" y="0" width="32" height="32" rx="9" fill="#fff" />
                    <circle cx="30" cy="4" r="7.5" fill="#000" />
                  </mask>
                </defs>
                <rect x="0" y="0" width="32" height="32" rx="9" fill="var(--brand)" mask="url(#bite-24)" />
                <circle cx="11.5" cy="19" r="2.1" fill="#fff" />
                <circle cx="20.5" cy="19" r="2.1" fill="#fff" />
              </svg>
              <span className="font-display" style={{ fontSize: "clamp(1.2rem, 4vw, 1.5rem)", color: "var(--ink)", lineHeight: 1 }}>
                Tidbit
              </span>
            </Link>

            {/* Nav links */}
            <nav aria-label="Main navigation" style={{ display: "flex", gap: 22, marginLeft: 8 }} className="hidden sm:flex">
              <NavLink href="/">Home</NavLink>
              <NavLink href="/topics">Guides</NavLink>
            </nav>

            {/* Right side */}
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
              <SearchBar />
              <FavoritesNavItem />
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main id="main-content" className="flex-1" tabIndex={-1}>
          {children}
        </main>

        <footer style={{ borderTop: "1px solid var(--line)", marginTop: 20 }}>
          <div style={{ maxWidth: 1120, margin: "0 auto", padding: "clamp(16px, 5vw, 28px)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "clamp(8px, 2vw, 14px)" }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: "clamp(6px, 1.5vw, 10px)", textDecoration: "none" }}>
              <svg width={20} height={20} viewBox="0 0 32 32" aria-hidden="true" style={{ flexShrink: 0, minWidth: 20, minHeight: 20 }}>
                <defs>
                  <mask id="bite-20">
                    <rect x="0" y="0" width="32" height="32" rx="9" fill="#fff" />
                    <circle cx="30" cy="4" r="7.5" fill="#000" />
                  </mask>
                </defs>
                <rect x="0" y="0" width="32" height="32" rx="9" fill="var(--brand)" mask="url(#bite-20)" />
                <circle cx="11.5" cy="19" r="2.1" fill="#fff" />
                <circle cx="20.5" cy="19" r="2.1" fill="#fff" />
              </svg>
              <span className="font-display" style={{ fontSize: "clamp(0.95rem, 2vw, 1.1rem)", color: "var(--ink)", lineHeight: 1 }}>Tidbit</span>
            </Link>
            <span style={{ color: "var(--ink-3)", fontSize: "0.86rem" }}>
              Big ideas, served in small bites
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      style={{ fontSize: "0.92rem", fontWeight: 500, color: "var(--ink-2)", textDecoration: "none", padding: "6px 2px", borderBottom: "2px solid transparent", transition: "color 0.15s ease" }}
      className="hover:text-[var(--ink)]"
    >
      {children}
    </Link>
  );
}
