"use client";

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

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";

const footerLinkClass =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card/60 px-4 py-2.5 text-sm text-foreground transition hover:border-brand/35 hover:bg-amber-500/10 hover:text-foreground min-h-[44px] dark:border-white/10 dark:bg-white/[0.04] dark:text-gray-200 dark:hover:border-amber-500/35 dark:hover:text-amber-900 dark:text-amber-100";

export default function SiteFooter() {
  const pathname = usePathname();
  const { t, lang } = useLanguage();
  const [isLivreur, setIsLivreur] = useState(false);
  const year = new Date().getFullYear();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const parsed = JSON.parse(user);
      if (parsed.role === "livreur") setIsLivreur(true);
    }
  }, []);

  if (isLivreur || pathname?.startsWith("/espace-livreur")) {
    return null;
  }

  return (
    <footer
      dir={lang === "ar-SA" ? "rtl" : "ltr"}
      className="mt-auto border-t border-border bg-background text-muted-foreground dark:border-white/10 dark:bg-gradient-to-b dark:from-gray-950 dark:to-black dark:text-gray-400"
    >
      <div className="container mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/15 ring-1 ring-amber-500/30">
                <Building2 className="h-6 w-6 text-amber-400" aria-hidden />
              </div>
              <span className="text-lg font-semibold text-foreground dark:text-white">BMP.tn</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground dark:text-gray-500">
              {t("footer_desc")}
            </p>
            <ul className="mt-5 space-y-2 text-sm text-muted-foreground dark:text-gray-500">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-500/60" />
                {t("footer_location")}
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-amber-500/60" />
                <a
                  href="mailto:contact@bmp.tn"
                  className="text-amber-200/80 hover:text-amber-700 dark:text-amber-300"
                >
                  contact@bmp.tn
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-amber-500/60" />
                <span>{t("footer_support")}</span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-4">
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground dark:text-gray-500">
              {t("footer_section_account")}
            </h3>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/espace" className={footerLinkClass}>
                <Home className="h-4 w-4 text-amber-400/80" />
                {t("nav_dashboard")}
              </Link>
              <Link href="/login" className={footerLinkClass}>
                <LogIn className="h-4 w-4 text-amber-400/80" />
                {t("connexion")}
              </Link>
              <Link href="/inscription" className={footerLinkClass}>
                <UserPlus className="h-4 w-4 text-amber-400/80" />
                {t("footer_sign_up")}
              </Link>
              <Link href="/contact" className={footerLinkClass}>
                <Mail className="h-4 w-4 text-amber-400/80" />
                {t("contact")}
              </Link>
            </div>
          </div>

          <div className="lg:col-span-4">
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground dark:text-gray-500">
              {t("footer_section_tools")}
            </h3>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/gestion-chantier" className={footerLinkClass}>
                <HardHat className="h-4 w-4 text-sky-400/80" />
                {t("nav_chantier")}
              </Link>
              <Link href="/gestion-devis-facturation" className={footerLinkClass}>
                <FileText className="h-4 w-4 text-blue-400/80" />
                {t("nav_devis")}
              </Link>
              <Link href="/gestion-marketplace" className={footerLinkClass}>
                <ShoppingCart className="h-4 w-4 text-emerald-400/80" />
                {t("marketplace")}
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-border dark:border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground/80 dark:text-gray-600">
            © {year} BMP.tn — {t("footer_copyright")}
          </p>
          <nav
            className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs"
            aria-label={t("footer_aria_legal")}
          >
            <span className="text-muted-foreground dark:text-gray-500">{t("footer_legal")}</span>
            <span className="text-muted-foreground/50 dark:text-gray-700" aria-hidden>
              ·
            </span>
            <span className="text-muted-foreground dark:text-gray-500">{t("footer_privacy")}</span>
            <span className="text-muted-foreground/50 dark:text-gray-700" aria-hidden>
              ·
            </span>
            <span className="text-muted-foreground dark:text-gray-500">{t("footer_cookies")}</span>
          </nav>
        </div>
      </div>
    </footer>
  );
}
