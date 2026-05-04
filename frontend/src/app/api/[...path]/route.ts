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

  const fetchInit: RequestInit = {
    method: req.method,
    headers,
    body: body !== undefined && body.byteLength > 0 ? body : undefined,
    signal: AbortSignal.timeout(120_000),
  };

  async function forward(origin: string) {
    return fetch(`${origin}${pathAndQuery}`, fetchInit);
  }

  try {
    const res = await forward(backendOrigin);
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
