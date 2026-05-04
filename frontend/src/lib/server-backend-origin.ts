import type { NextRequest } from "next/server";

/**
 * URL publique du déploiement Vercel (hôte uniquement), pour éviter
 * `DNS_HOSTNAME_RESOLVED_PRIVATE` : ne pas utiliser `req.nextUrl.origin` pour les fetch
 * sortants depuis une Function — ce host peut résoudre en adresse privée côté plateforme.
 *
 * @see https://vercel.com/docs/projects/environment-variables#system-environment-variables
 */
export function vercelDeploymentBackendOrigin(): string | null {
  const raw =
    process.env.VERCEL_URL?.trim() ||
    process.env.VERCEL_BRANCH_URL?.trim();
  if (!raw) return null;
  const host = raw.replace(/^https?:\/\//i, "").split("/")[0]?.trim();
  if (!host) return null;
  return `https://${host}/_/backend`.replace(/\/$/, "");
}

/**
 * URL de base du NestJS (sans slash final), pour rewrites Next et le relais `app/api/[...path]`.
 *
 * 1) `BACKEND_ORIGIN` ou `NEXT_PUBLIC_BACKEND_ORIGIN` si définis (ex. Railway en prod).
 * 2) Sur Vercel **sans** override : `https://${VERCEL_URL}/_/backend` (hôte public du déploiement).
 * 3) Sinon : développement local sur 127.0.0.1:3001.
 */
export function resolveBackendOriginFromRequest(_req: NextRequest): string {
  const explicit =
    process.env.BACKEND_ORIGIN?.trim() ||
    process.env.NEXT_PUBLIC_BACKEND_ORIGIN?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  if (process.env.VERCEL) {
    const fromVercelEnv = vercelDeploymentBackendOrigin();
    if (fromVercelEnv) return fromVercelEnv;
  }
  return "http://127.0.0.1:3001";
}

/** Pour `next.config.ts` (pas de `NextRequest` à l’évaluation des rewrites). */
export function resolveBackendOriginAtBuildTime(): string {
  const explicit =
    process.env.BACKEND_ORIGIN?.trim() ||
    process.env.NEXT_PUBLIC_BACKEND_ORIGIN?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  if (process.env.VERCEL) {
    const fromVercelEnv = vercelDeploymentBackendOrigin();
    if (fromVercelEnv) return fromVercelEnv;
  }
  return "http://127.0.0.1:3001";
}
