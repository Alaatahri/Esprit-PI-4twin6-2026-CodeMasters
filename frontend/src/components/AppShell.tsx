"use client";

import { useEffect, useMemo, useState } from "react";
import { AppPreviewChrome } from "@/components/AppPreviewChrome";

/**
 * Par défaut, l'app s'affiche "normalement" (comme avant).
 * Le mode preview (barre device + toggle) est activable uniquement via `?preview=1`.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    try {
      const p = new URLSearchParams(window.location.search);
      setEnabled(p.get("preview") === "1");
    } catch {
      setEnabled(false);
    }
  }, []);

  const content = useMemo(() => children, [children]);

  if (!enabled) return <>{content}</>;
  return <AppPreviewChrome>{content}</AppPreviewChrome>;
}

