"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { BMP_THEME_STORAGE_KEY, type BMPThemeMode } from "@/lib/theme-storage";

export type PreviewDevice = "desktop" | "tablet" | "mobile";
export type ColorMode = BMPThemeMode;

type AppPreviewContextValue = {
  device: PreviewDevice;
  setDevice: (d: PreviewDevice) => void;
  colorMode: ColorMode;
  setColorMode: (m: ColorMode) => void;
  toggleColorMode: () => void;
};

const AppPreviewContext = createContext<AppPreviewContextValue | null>(null);

function applyHtmlTheme(mode: ColorMode) {
  if (typeof document === "undefined") return;
  const html = document.documentElement;
  if (mode === "dark") {
    html.classList.add("dark");
    html.classList.remove("light");
  } else {
    html.classList.add("light");
    html.classList.remove("dark");
  }
  try {
    localStorage.setItem(BMP_THEME_STORAGE_KEY, mode);
  } catch {
    /* ignore quota / private mode */
  }
}

export function useAppPreview() {
  return useContext(AppPreviewContext);
}

export function AppPreviewProvider({ children }: { children: React.ReactNode }) {
  const [device, setDevice] = useState<PreviewDevice>("desktop");
  const [colorMode, setColorModeState] = useState<ColorMode>("dark");

  /** Aligne React avec la classe déjà posée par BMP_THEME_BOOT_SCRIPT (anti-flash). */
  useLayoutEffect(() => {
    const light = document.documentElement.classList.contains("light");
    setColorModeState(light ? "light" : "dark");
  }, []);

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key !== BMP_THEME_STORAGE_KEY || !e.newValue) return;
      if (e.newValue !== "light" && e.newValue !== "dark") return;
      const mode = e.newValue as ColorMode;
      setColorModeState(mode);
      applyHtmlTheme(mode);
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setColorMode = useCallback((mode: ColorMode) => {
    setColorModeState(mode);
    applyHtmlTheme(mode);
  }, []);

  const toggleColorMode = useCallback(() => {
    setColorModeState((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      applyHtmlTheme(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      device,
      setDevice,
      colorMode,
      setColorMode,
      toggleColorMode,
    }),
    [device, colorMode, setColorMode, toggleColorMode],
  );

  return (
    <AppPreviewContext.Provider value={value}>
      {children}
    </AppPreviewContext.Provider>
  );
}
