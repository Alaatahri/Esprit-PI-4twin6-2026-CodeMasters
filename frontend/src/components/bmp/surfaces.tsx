import { cn } from "@/lib/utils";

/** Carte / panneau standard : surface élevée, bordure et ombre sémantiques. */
export function BmpCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card text-card-foreground shadow-bmp-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Liste vide ou état secondaire — fond muted léger. */
export function BmpInsetPanel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-muted/40 px-6 py-12 text-center shadow-bmp-xs dark:bg-muted/25",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Liste / ligne interactive cliquable. */
export function BmpRowCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card/90 px-4 py-4 shadow-bmp-xs transition hover:border-brand/35 hover:bg-accent/60 hover:shadow-bmp-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}
