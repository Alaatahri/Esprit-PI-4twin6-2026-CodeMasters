"use client";

import { useLayoutEffect } from "react";
import { ensureAuthCookie } from "@/lib/auth";

/** Synchronise le cookie `bmp_has_auth` avec localStorage (sessions existantes + nouveau login). */
export function AuthCookieSync() {
  useLayoutEffect(() => {
    ensureAuthCookie();
  }, []);
  return null;
}
