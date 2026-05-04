/**
 * URL de base pour l'API NestJS.
 *
 * Par défaut : `/api` — le trafic est relayé vers le backend via `app/api/[...path]`
 * (et rewrites) : le bypass **Deployment Protection** ne s’applique que côté serveur Next.
 *
 * Surcharge : `NEXT_PUBLIC_API_URL` (ex. `https://api.mondomaine.tn/api` sur Railway).
 *
 * **Important (option A, tout sur Vercel)** : ne pas définir `NEXT_PUBLIC_API_URL` vers
 * une URL `*.vercel.app`… Le navigateur appellerait l’API **en direct** → page SSO
 * « Authentication Required ». On force alors `/api` pour repasser par le relais.
 */
export function getApiBaseUrl(): string {
  const env = process.env.NEXT_PUBLIC_API_URL;
  if (typeof env === "string" && env.trim() !== "") {
    let base = env.trim().replace(/\/$/, "");
    // Erreur fréquente : `NEXT_PUBLIC_API_URL=http://127.0.0.1:3001` sans `/api`
    // alors que Nest utilise `app.setGlobalPrefix('api')` → 404 sur `/auth/...`.
    if (/^https?:\/\//i.test(base) && !/\/api(\/|$)/i.test(base)) {
      base = `${base}/api`;
    }
    try {
      if (new URL(base).hostname.endsWith(".vercel.app")) {
        return "/api";
      }
    } catch {
      /* URL invalide → retomber sur /api */
      return "/api";
    }
    return base;
  }
  return "/api";
}
