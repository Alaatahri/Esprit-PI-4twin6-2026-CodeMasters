import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const LOGIN = "/login";

function loginRedirect(request: NextRequest): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = LOGIN;
  const dest = request.nextUrl.pathname + request.nextUrl.search;
  url.searchParams.set("returnUrl", dest);
  return NextResponse.redirect(url);
}

export function middleware(request: NextRequest) {
  const hint = request.cookies.get("bmp_has_auth")?.value === "1";
  if (hint) return NextResponse.next();
  return loginRedirect(request);
}

export const config = {
  matcher: [
    // Ne pas bloquer l'accueil (/espace) : navigation publique.
    "/espace/client/:path*",
    "/espace/expert/:path*",
    "/espace/artisan/:path*",
    "/espace/admin/:path*",
    "/espace/livreur/:path*",
    "/espace/profil/:path*",
    "/espace-livreur",
    "/espace-livreur/:path*",
    "/gestion-devis-facturation",
    "/gestion-devis-facturation/:path*",
    "/messages/:path*",
    "/expert/:path*",
    "/artisan/:path*",
  ],
};
