"use client";

import { useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import EncyclopediaLoader from "./EncyclopediaLoader";

const CloudArchitecturePatterns = dynamic(
  () => import("./CloudArchitecturePatterns"),
  { ssr: false, loading: EncyclopediaLoader }
);

interface Props {
  initialConceptId?: string;
}

export default function CloudArchitectureWrapper({ initialConceptId }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!initialConceptId || !ref.current) return;
    let attempts = 0;
    const tryClick = () => {
      const el = ref.current?.querySelector<HTMLElement>(
        `[data-concept-id="${CSS.escape(initialConceptId)}"]`
      );
      if (el) {
        el.click();
      } else if (attempts++ < 10) {
        setTimeout(tryClick, 150);
      }
    };
    setTimeout(tryClick, 100);
  }, [initialConceptId]);

  return (
    <div ref={ref} style={{ display: "contents" }}>
      <CloudArchitecturePatterns />
    </div>
  );
}
