import type { NextRequest } from "next/server";

/**
 * URL de base du NestJS (sans slash final), pour rewrites Next et le relais `app/api/[...path]`.
 *
 * 1) `BACKEND_ORIGIN` ou `NEXT_PUBLIC_BACKEND_ORIGIN` si définis (ex. Railway en prod).
 * 2) Sur Vercel **sans** override : même hôte que la requête + `/_/backend` (voir `vercel.json` experimentalServices).
 * 3) Sinon : développement local sur 127.0.0.1:3001.
 */
export function resolveBackendOriginFromRequest(req: NextRequest): string {
  const explicit =
    process.env.BACKEND_ORIGIN?.trim() ||
    process.env.NEXT_PUBLIC_BACKEND_ORIGIN?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  if (process.env.VERCEL) {
    return `${req.nextUrl.origin}/_/backend`.replace(/\/$/, "");
  }
  return "http://127.0.0.1:3001";
}

/** Pour `next.config.ts` (pas de `NextRequest` à l’évaluation des rewrites). */
export function resolveBackendOriginAtBuildTime(): string {
  const explicit =
    process.env.BACKEND_ORIGIN?.trim() ||
    process.env.NEXT_PUBLIC_BACKEND_ORIGIN?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  if (process.env.VERCEL && process.env.VERCEL_URL) {
    const host = process.env.VERCEL_URL.replace(/^https?:\/\//i, "")
      .split("/")[0]
      ?.trim();
    if (host) return `https://${host}/_/backend`;
  }
  return "http://127.0.0.1:3001";
}
