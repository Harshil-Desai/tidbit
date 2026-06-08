export type OgPalette = {
  gradFrom: string;
  gradTo: string;
  accent: string;     // darker shade used for text/borders
  accentSoft: string; // medium shade for supporting text
  pill: string;       // pill background
  pillText: string;   // pill text
};

const palettes: Record<string, OgPalette> = {
  "from-blue-100 to-blue-200": {
    gradFrom: "#dbeafe", gradTo: "#bfdbfe",
    accent: "#1d4ed8", accentSoft: "#3b82f6",
    pill: "#1e3a8a", pillText: "#eff6ff",
  },
  "from-purple-100 to-purple-200": {
    gradFrom: "#f3e8ff", gradTo: "#e9d5ff",
    accent: "#7c3aed", accentSoft: "#a78bfa",
    pill: "#4c1d95", pillText: "#faf5ff",
  },
  "from-cyan-100 to-cyan-200": {
    gradFrom: "#cffafe", gradTo: "#a5f3fc",
    accent: "#0e7490", accentSoft: "#06b6d4",
    pill: "#164e63", pillText: "#ecfeff",
  },
  "from-sky-100 to-sky-200": {
    gradFrom: "#e0f2fe", gradTo: "#bae6fd",
    accent: "#0369a1", accentSoft: "#0ea5e9",
    pill: "#0c4a6e", pillText: "#f0f9ff",
  },
  "from-emerald-100 to-emerald-200": {
    gradFrom: "#d1fae5", gradTo: "#a7f3d0",
    accent: "#065f46", accentSoft: "#10b981",
    pill: "#064e3b", pillText: "#ecfdf5",
  },
  "from-orange-100 to-orange-200": {
    gradFrom: "#ffedd5", gradTo: "#fed7aa",
    accent: "#c2410c", accentSoft: "#f97316",
    pill: "#7c2d12", pillText: "#fff7ed",
  },
};

export function getPalette(tailwindColor: string): OgPalette {
  return (
    palettes[tailwindColor] ?? {
      gradFrom: "#f1f5f9", gradTo: "#e2e8f0",
      accent: "#334155", accentSoft: "#64748b",
      pill: "#1e293b", pillText: "#f8fafc",
    }
  );
}
