interface Props {
  id: string;
  size?: number;
  strokeWidth?: number;
}

export default function TopicIcon({ id, size = 24, strokeWidth = 2.1 }: Props) {
  const p = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (id) {
    case "system-design":
      return (
        <svg {...p}>
          <rect x="3" y="3" width="7" height="7" rx="2" />
          <rect x="14" y="3" width="7" height="7" rx="2" />
          <rect x="8.5" y="14" width="7" height="7" rx="2" />
          <path d="M6.5 10v1.5a2 2 0 0 0 2 2M17.5 10v1.5a2 2 0 0 1-2 2" />
        </svg>
      );
    case "design-patterns":
      return (
        <svg {...p}>
          <path d="M9 4.5h6a1.5 1.5 0 0 1 1.5 1.5v1a1.5 1.5 0 0 0 3 0V6" />
          <path d="M19.5 9v6a1.5 1.5 0 0 1-1.5 1.5h-1a1.5 1.5 0 0 0 0 3H18" />
          <path d="M15 19.5H9a1.5 1.5 0 0 1-1.5-1.5v-1a1.5 1.5 0 0 0-3 0V18" />
          <path d="M4.5 15V9a1.5 1.5 0 0 1 1.5-1.5h1a1.5 1.5 0 0 0 0-3H6" />
        </svg>
      );
    case "postgres-internals":
      return (
        <svg {...p}>
          <ellipse cx="12" cy="5.5" rx="7" ry="2.6" />
          <path d="M5 5.5v6c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6v-6" />
          <path d="M5 11.5v6c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6v-6" />
        </svg>
      );
    case "cloud-architecture":
      return (
        <svg {...p}>
          <path d="M7 18a4 4 0 0 1-.5-7.97A5.5 5.5 0 0 1 17 9.5a3.5 3.5 0 0 1 .5 6.97" />
          <path d="M7 18h10" />
        </svg>
      );
    case "ai-llm":
      return (
        <svg {...p}>
          <circle cx="6" cy="6" r="2.2" />
          <circle cx="18" cy="6" r="2.2" />
          <circle cx="12" cy="18" r="2.2" />
          <path d="M8 7l3 9M16 7l-3 9M8 6h8" />
        </svg>
      );
    case "production-ai-agents":
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="3.2" />
          <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
        </svg>
      );
    default:
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="8" />
        </svg>
      );
  }
}
