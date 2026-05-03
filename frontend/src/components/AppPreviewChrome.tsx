"use client";

import { Monitor, Smartphone, Tablet, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppPreviewProvider, useAppPreview } from "./app-preview-context";

function PreviewToolbar() {
  const ctx = useAppPreview();
  if (!ctx) return null;

  const { device, setDevice, colorMode, toggleColorMode } = ctx;

  return (
    <div
      className={cn(
        "sticky top-0 z-[200] flex justify-center border-b px-3 py-2.5 backdrop-blur-md transition-colors duration-300 ease-out sm:py-3",
        "border-border bg-background/85 text-foreground shadow-bmp-xs supports-[backdrop-filter]:bg-background/70",
      )}
    >
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        <span className="hidden text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:inline">
          Vue
        </span>
        <div
          className={cn(
            "flex items-center gap-0.5 rounded-full p-0.5 transition-colors duration-300",
            "bg-muted/80 dark:bg-muted/40",
          )}
        >
          <button
            type="button"
            onClick={() => setDevice("desktop")}
            title="Ordinateur"
            className={cn(
              "rounded-full p-2 transition-all duration-300 ease-out sm:p-2.5",
              device === "desktop"
                ? "bg-card text-foreground shadow-bmp-sm ring-1 ring-border"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <Monitor className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => setDevice("tablet")}
            title="Tablette"
            className={cn(
              "rounded-full p-2 transition-all duration-300 ease-out sm:p-2.5",
              device === "tablet"
                ? "bg-card text-foreground shadow-bmp-sm ring-1 ring-border"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <Tablet className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => setDevice("mobile")}
            title="Téléphone"
            className={cn(
              "rounded-full p-2 transition-all duration-300 ease-out sm:p-2.5",
              device === "mobile"
                ? "bg-card text-foreground shadow-bmp-sm ring-1 ring-border"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <Smartphone className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden />
          </button>
        </div>

        <div
          className="hidden h-6 w-px bg-border transition-colors duration-300 sm:block"
          aria-hidden
        />

        <button
          type="button"
          onClick={toggleColorMode}
          title={colorMode === "dark" ? "Mode clair" : "Mode sombre"}
          className={cn(
            "flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium transition-all duration-300 ease-out active:scale-[0.97] sm:text-sm",
            colorMode === "dark"
              ? "border border-brand/35 bg-brand/15 text-brand hover:bg-brand/25"
              : "border border-border bg-primary text-primary-foreground hover:bg-primary/90",
          )}
        >
          {colorMode === "dark" ? (
            <>
              <Sun
                className="h-4 w-4 shrink-0 text-brand-muted transition-transform duration-500 ease-out"
                aria-hidden
              />
              <span className="hidden sm:inline">Mode clair</span>
            </>
          ) : (
            <>
              <Moon
                className="h-4 w-4 shrink-0 opacity-90 transition-transform duration-500 ease-out"
                aria-hidden
              />
              <span className="hidden sm:inline">Mode sombre</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function DeviceFrame({ children }: { children: React.ReactNode }) {
  const ctx = useAppPreview();
  if (!ctx) return <>{children}</>;

  const { device } = ctx;

  if (device === "desktop") {
    return (
      <div className="bmp-desktop-shell">
        <div className="bmp-desktop-inner mx-auto flex min-h-0 w-full max-w-[min(100%,1680px)] flex-1 flex-col px-1.5 pb-2 sm:px-5 sm:pb-6">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bmp-device-overlay fixed inset-0 top-14 z-[140] flex items-center justify-center transition-colors duration-500 ease-out sm:top-16",
        "bg-foreground/35 backdrop-blur-sm dark:bg-black/80",
      )}
    >
      <div className="flex h-full max-h-full w-full items-center justify-center px-3 pb-6 pt-2 sm:px-6 sm:pb-10">
        <div
          className={cn(
            "bmp-device-frame flex max-h-full flex-col overflow-hidden shadow-bmp-lg ring-1 transition-[width,height,border-radius,box-shadow,background-color,border-color,border-width] duration-500 ease-out",
            "bg-background ring-border",
            device === "tablet" &&
              "h-[min(82dvh,calc(100dvh-5rem))] w-[min(92vw,760px)] rounded-[1.25rem] border-[10px] border-muted sm:rounded-[1.5rem] sm:border-[12px]",
            device === "mobile" &&
              "h-[min(82dvh,calc(100dvh-5rem))] w-[min(92vw,400px)] rounded-[1.75rem] border-[9px] border-muted dark:border-zinc-900 sm:rounded-[2rem] sm:border-[10px]",
          )}
        >
          {device === "mobile" && (
            <div className="flex shrink-0 justify-center pt-2">
              <div
                className="h-1.5 w-14 rounded-full bg-foreground/35 dark:bg-black/75 sm:w-16"
                aria-hidden
              />
            </div>
          )}
          <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <PreviewToolbar />
      <DeviceFrame>{children}</DeviceFrame>
    </div>
  );
}

export function AppPreviewChrome({ children }: { children: React.ReactNode }) {
  return (
    <AppPreviewProvider>
      <Shell>{children}</Shell>
    </AppPreviewProvider>
  );
}
