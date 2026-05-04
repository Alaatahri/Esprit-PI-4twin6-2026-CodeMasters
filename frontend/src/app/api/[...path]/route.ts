import { NextRequest, NextResponse } from "next/server";
import { resolveBackendOriginFromRequest } from "@/lib/server-backend-origin";

/**
 * Relais vers l'API NestJS.
 * Local : 127.0.0.1:3001. Vercel Services (vercel.json) : même origine + `/_/backend`.
 * Surcharge : BACKEND_ORIGIN (ex. API sur Railway).
 */

/** Si la 1ʳᵉ requête échoue (localhost vs 127.0.0.1), on retente une fois. */
function alternateLoopbackOrigin(origin: string): string | null {
  try {
    const u = new URL(origin);
    if (u.hostname === "localhost") {
      u.hostname = "127.0.0.1";
      return u.toString().replace(/\/$/, "");
    }
    if (u.hostname === "127.0.0.1") {
      u.hostname = "localhost";
      return u.toString().replace(/\/$/, "");
    }
  } catch {
    /* ignore */
  }
  return null;
}

export const dynamic = "force-dynamic";
/** Obligatoire pour que le relais puisse joindre localhost / le réseau local. */
export const runtime = "nodejs";

type Ctx = { params: Promise<{ path?: string[] }> };

/** Secret [Protection Bypass for Automation](https://vercel.com/docs/deployment-protection/methods-to-bypass-deployment-protection/protection-bypass-automation) — système ou copié manuellement dans les env Vercel. */
function getVercelProtectionBypassSecret(): string | undefined {
  const s =
    process.env.VERCEL_AUTOMATION_BYPASS_SECRET?.trim() ||
    process.env.VERCEL_PROTECTION_BYPASS?.trim();
  return s || undefined;
}

function backendHostIsVercelApp(backendOrigin: string): boolean {
  try {
    return new URL(backendOrigin).hostname.endsWith(".vercel.app");
  } catch {
    return false;
  }
}

/** URL complète vers Nest, avec `?x-vercel-protection-bypass=` si besoin (en complément du header). */
function buildBackendFetchUrl(
  backendOrigin: string,
  pathAndQuery: string,
  bypass?: string,
): string {
  const base = `${backendOrigin}${pathAndQuery}`;
  if (!bypass || !backendHostIsVercelApp(backendOrigin)) return base;
  try {
    const u = new URL(base);
    u.searchParams.set("x-vercel-protection-bypass", bypass);
    return u.toString();
  } catch {
    return base;
  }
}

async function proxy(req: NextRequest, context: Ctx): Promise<NextResponse> {
  const backendOrigin = resolveBackendOriginFromRequest(req);
  const { path: segments } = await context.params;
  const sub = Array.isArray(segments) ? segments.join("/") : "";
  const pathAndQuery = `/api/${sub}${req.nextUrl.search}`;

  const headers = new Headers();
  req.headers.forEach((value, key) => {
    const k = key.toLowerCase();
    if (k === "host" || k === "connection") return;
    headers.set(key, value);
  });

  let body: ArrayBuffer | undefined;
  if (req.method !== "GET" && req.method !== "HEAD") {
    try {
      body = await req.arrayBuffer();
    } catch {
      body = undefined;
    }
  }

  // Multipart / binaire : laisser fetch recalculer Content-Length (évite 400 côté Nest/multer)
  if (body !== undefined && body.byteLength > 0) {
    headers.delete("content-length");
    headers.delete("transfer-encoding");
  }

  const bypassSecret = getVercelProtectionBypassSecret();
  if (bypassSecret && backendHostIsVercelApp(backendOrigin)) {
    headers.set("x-vercel-protection-bypass", bypassSecret);
  }

  const fetchInit: RequestInit = {
    method: req.method,
    headers,
    body: body !== undefined && body.byteLength > 0 ? body : undefined,
    signal: AbortSignal.timeout(120_000),
  };

  async function forward(origin: string) {
    const url = buildBackendFetchUrl(origin, pathAndQuery, bypassSecret);
    return fetch(url, fetchInit);
  }

  try {
    const res = await forward(backendOrigin);
    const ct = res.headers.get("content-type") || "";
    const maybeNotJson = !res.ok || !ct.includes("application/json");
    if (maybeNotJson) {
      const peek = (await res.clone().text()).slice(0, 6000);
      const looksLikeVercelAuthWall =
        peek.includes("Authentication Required") ||
        (peek.includes("<!doctype html") &&
          peek.includes("vercel") &&
          peek.includes("x-vercel-protection-bypass"));
      if (looksLikeVercelAuthWall) {
        const hasSecret = Boolean(getVercelProtectionBypassSecret());
        return NextResponse.json(
          {
            error: "vercel_deployment_protection",
            message: hasSecret
              ? "L’API Vercel renvoie encore la page SSO malgré le bypass : régénérez le secret « Protection Bypass for Automation » dans les réglages du projet, mettez à jour VERCEL_AUTOMATION_BYPASS_SECRET (ou VERCEL_PROTECTION_BYPASS) sur **tous** les services (frontend + backend), puis redéployez. Sinon désactivez Vercel Authentication sur les previews ou utilisez BACKEND_ORIGIN vers une API hors Vercel (ex. Railway)."
              : "L’API sur Vercel est protégée (SSO). Vercel Dashboard → Project → Settings → Deployment Protection → activer « Protection Bypass for Automation » (doc Vercel), puis redéployer : la variable VERCEL_AUTOMATION_BYPASS_SECRET sera injectée. Vous pouvez aussi ajouter manuellement VERCEL_PROTECTION_BYPASS (même valeur que le secret) sur le service **frontend**. Alternative : désactiver la protection sur les previews, ou BACKEND_ORIGIN vers Railway.",
          },
          { status: 502 },
        );
      }
    }
    return pipeResponse(res);
  } catch (e) {
    const alt = alternateLoopbackOrigin(backendOrigin);
    if (alt) {
      try {
        const res = await forward(alt);
        return pipeResponse(res);
      } catch {
        /* erreur réseau sur les deux origines */
      }
    }
    const msg =
      e instanceof Error ? e.message : "Connexion refusée ou timeout";
    const vercelHint = process.env.VERCEL
      ? " Vérifiez que le service Nest est bien déployé (vercel.json experimentalServices) et que CORS côté API inclut l’URL du site."
      : "";
    return NextResponse.json(
      {
        error: "backend_unreachable",
        message:
          `Impossible d'atteindre le backend (${backendOrigin}). ` +
          (process.env.VERCEL
            ? ""
            : `Démarrez : cd backend && npm run start:dev. `) +
          `Sinon définissez BACKEND_ORIGIN. Détail : ${msg}.${vercelHint}`,
      },
      { status: 502 },
    );
  }
}

function pipeResponse(res: Response): NextResponse {
  const out = new NextResponse(res.body, {
    status: res.status,
    statusText: res.statusText,
  });
  res.headers.forEach((value, key) => {
    const lk = key.toLowerCase();
    if (lk === "transfer-encoding") return;
    out.headers.set(key, value);
  });
  return out;
}

export async function GET(req: NextRequest, ctx: Ctx) {
  return proxy(req, ctx);
}
export async function POST(req: NextRequest, ctx: Ctx) {
  return proxy(req, ctx);
}
export async function PUT(req: NextRequest, ctx: Ctx) {
  return proxy(req, ctx);
}
export async function PATCH(req: NextRequest, ctx: Ctx) {
  return proxy(req, ctx);
}
export async function DELETE(req: NextRequest, ctx: Ctx) {
  return proxy(req, ctx);
}
export async function HEAD(req: NextRequest, ctx: Ctx) {
  return proxy(req, ctx);
}
export async function OPTIONS(req: NextRequest, ctx: Ctx) {
  return proxy(req, ctx);
}
