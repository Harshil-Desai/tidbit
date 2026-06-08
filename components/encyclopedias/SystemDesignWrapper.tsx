"use client";

import { useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import EncyclopediaLoader from "./EncyclopediaLoader";

const SystemDesignEncyclopedia = dynamic(
  () => import("./SystemDesignEncyclopedia"),
  { ssr: false, loading: EncyclopediaLoader }
);

interface Props {
  initialConceptId?: string;
}

export default function SystemDesignWrapper({ initialConceptId }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!initialConceptId || !ref.current) return;
    // Retry a few times to let the encyclopedia render its nav
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
    <div ref={ref} style={{ height: "100%", display: "contents" }}>
      <SystemDesignEncyclopedia />
    </div>
  );
}
