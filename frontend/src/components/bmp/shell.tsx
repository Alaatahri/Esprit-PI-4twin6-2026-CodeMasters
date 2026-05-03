import { cn } from "@/lib/utils";

/** Enveloppe page espace / dashboard : fond en couches via tokens (--shell-bg-gradient). */
export function BmpPageSurface({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bmp-page-surface min-h-screen bg-background text-foreground",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Zone principale centrée (dashboard). */
export function BmpMainContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <main
      className={cn(
        "container mx-auto px-4 py-8 sm:px-6 lg:px-8 lg:py-10",
        className,
      )}
    >
      {children}
    </main>
  );
}
