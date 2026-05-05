"use client";

import { useEffect, useMemo, useState } from "react";

type Props = Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  "src" | "onError"
> & {
  src: string;
  /** Image utilisée si `src` échoue (403/404/timeout côté host). */
  fallbackSrc: string;
};

/**
 * Remplace `<img>` pour éviter les images cassées.
 * Si `src` échoue, on bascule sur `fallbackSrc`.
 */
export function SafeImg({ src, fallbackSrc, ...rest }: Props) {
  const normalized = useMemo(() => (src || "").trim(), [src]);
  const fallback = useMemo(() => (fallbackSrc || "").trim(), [fallbackSrc]);
  const [current, setCurrent] = useState(normalized);

  useEffect(() => {
    setCurrent(normalized);
  }, [normalized]);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...rest}
      src={current}
      referrerPolicy="no-referrer"
      loading={rest.loading ?? "lazy"}
      onError={() => {
        if (fallback && current !== fallback) {
          setCurrent(fallback);
        }
      }}
    />
  );
}

