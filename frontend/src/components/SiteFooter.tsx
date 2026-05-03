import Link from "next/link";
import {
  Building2,
  Mail,
  MapPin,
  HardHat,
  FileText,
  ShoppingCart,
  LogIn,
  UserPlus,
  Home,
  Phone,
} from "lucide-react";
import { cn } from "@/lib/utils";

const footerLinkClass = cn(
  "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-card-foreground shadow-bmp-xs transition",
  "hover:border-brand/40 hover:bg-accent hover:text-accent-foreground hover:shadow-bmp-sm",
);

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border bg-gradient-to-b from-muted/35 via-background to-background text-muted-foreground shadow-[inset_0_1px_0_0_var(--divider)] dark:from-card dark:via-background dark:to-background">
      <div className="container mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/15 ring-1 ring-brand/35">
                <Building2 className="h-6 w-6 text-brand" aria-hidden />
              </div>
              <span className="text-lg font-semibold text-foreground">BMP.tn</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              La plateforme qui connecte clients, experts et artisans pour des
              chantiers suivis de bout en bout — suivi, devis et marketplace au
              même endroit.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand/70" />
                Tunisie · projets partout sur le territoire
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-brand/70" />
                <a
                  href="mailto:contact@bmp.tn"
                  className="text-brand underline-offset-4 hover:text-brand-muted hover:underline"
                >
                  contact@bmp.tn
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-brand/70" />
                <span>Support du lundi au vendredi</span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-4">
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Compte & accès
            </h3>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/espace" className={footerLinkClass}>
                <Home className="h-4 w-4 text-brand" />
                Mon espace
              </Link>
              <Link href="/login" className={footerLinkClass}>
                <LogIn className="h-4 w-4 text-brand" />
                Connexion
              </Link>
              <Link href="/inscription" className={footerLinkClass}>
                <UserPlus className="h-4 w-4 text-brand" />
                Inscription
              </Link>
              <Link href="/contact" className={footerLinkClass}>
                <Mail className="h-4 w-4 text-brand" />
                Contact
              </Link>
            </div>
          </div>

          <div className="lg:col-span-4">
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Outils BMP.tn
            </h3>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/gestion-chantier" className={footerLinkClass}>
                <HardHat className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                Chantier
              </Link>
              <Link href="/gestion-devis-facturation" className={footerLinkClass}>
                <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                Devis
              </Link>
              <Link href="/gestion-marketplace" className={footerLinkClass}>
                <ShoppingCart className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Marketplace
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            © {year} BMP.tn — Construction digitale. Tous droits réservés.
          </p>
          <nav
            className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs"
            aria-label="Informations légales"
          >
            <span className="text-muted-foreground">Mentions légales</span>
            <span className="text-border" aria-hidden>
              ·
            </span>
            <span className="text-muted-foreground">
              Politique de confidentialité
            </span>
            <span className="text-border" aria-hidden>
              ·
            </span>
            <span className="text-muted-foreground">Cookies</span>
          </nav>
        </div>
      </div>
    </footer>
  );
}
