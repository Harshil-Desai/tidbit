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
          <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 28px", height: 68, display: "flex", alignItems: "center", gap: 26 }}>
            {/* Wordmark */}
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
              <TidbitLogo size={30} />
              <span className="font-display" style={{ fontSize: "1.5rem", color: "var(--ink)", lineHeight: 1 }}>
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
          <div style={{ maxWidth: 1120, margin: "0 auto", padding: "28px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
              <TidbitLogo size={24} />
              <span className="font-display" style={{ fontSize: "1.1rem", color: "var(--ink)", lineHeight: 1 }}>Tidbit</span>
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

function TidbitLogo({ size = 30 }: { size?: number }) {
  const id = `bite-${size}`;
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" style={{ flexShrink: 0 }}>
      <defs>
        <mask id={id}>
          <rect x="0" y="0" width="32" height="32" rx="9" fill="#fff" />
          <circle cx="30" cy="4" r="7.5" fill="#000" />
        </mask>
      </defs>
      <rect x="0" y="0" width="32" height="32" rx="9" fill="var(--brand)" mask={`url(#${id})`} />
      <circle cx="11.5" cy="19" r="2.1" fill="#fff" />
      <circle cx="20.5" cy="19" r="2.1" fill="#fff" />
    </svg>
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
