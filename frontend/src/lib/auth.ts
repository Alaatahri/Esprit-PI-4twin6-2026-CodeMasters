"use client";

/** Rôle normalisé en minuscules (aligné sur l’API / enum Mongo). */
export function normalizeRole(role: string | undefined | null): string {
  return String(role ?? "").trim().toLowerCase();
}

export function isClientRole(role: string | undefined | null): boolean {
  return normalizeRole(role) === "client";
}

export interface BMPUser {
  _id: string;
  nom: string;
  email: string;
  role: string;
  telephone?: string;
  specialite?: string;
  experience_annees?: number;
  zones_travail?: Array<{ scope: "tn_all" | "tn_city" | "country" | "world"; value?: string }>;
  createdAt?: string;
  avatarUrl?: string;
}

export const AUTH_CHANGE_EVENT = "bmp:auth-change" as const;

const STORAGE_KEY = "bmp_user";
const ACCESS_TOKEN_KEY = "bmp_access_token";
const REFRESH_TOKEN_KEY = "bmp_refresh_token";

const AUTH_COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 7;

function setAuthSessionCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `bmp_has_auth=1; Path=/; SameSite=Lax; Max-Age=${AUTH_COOKIE_MAX_AGE_SEC}`;
}

function clearAuthSessionCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = "bmp_has_auth=; Path=/; Max-Age=0";
}

/** À appeler au chargement : restaure le cookie hint pour le middleware (sessions déjà en localStorage). */
export function ensureAuthCookie(): void {
  if (typeof window === "undefined") return;
  if (getStoredUser() && getAccessToken()) setAuthSessionCookie();
}

/** Jetons JWT renvoyés par POST /users/login ou POST /auth/refresh. */
export function setAuthTokens(accessToken: string, refreshToken?: string): void {
  if (typeof window === "undefined") return;
  const at = accessToken.trim();
  if (!at) return;
  localStorage.setItem(ACCESS_TOKEN_KEY, at);
  localStorage.setItem("bmp_token", at);
  if (refreshToken?.trim()) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken.trim());
  }
  setAuthSessionCookie();
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem(ACCESS_TOKEN_KEY) ||
    localStorage.getItem("bmp_token") ||
    null
  );
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getStoredUser(): BMPUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const u = JSON.parse(raw) as BMPUser;
    return { ...u, role: normalizeRole(u.role) };
  } catch {
    return null;
  }
}

export function setStoredUser(user: BMPUser): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  if (getAccessToken()) setAuthSessionCookie();
  try {
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  } catch {
    /* ignore */
  }
}

export function clearStoredUser(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem("bmp_token");
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  clearAuthSessionCookie();
  try {
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  } catch {
    /* ignore */
  }
}

export function isAuthenticated(): boolean {
  return getStoredUser() !== null;
}
