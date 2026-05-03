"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Briefcase,
  FileText,
  ShoppingCart,
  ArrowRight,
  HardHat,
  Calculator,
  Package,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStoredUser, type BMPUser } from "@/lib/auth";
import { GuestLandingShowcase } from "@/components/GuestLandingShowcase";
import { cn } from "@/lib/utils";

const modules = [
  {
    href: "/gestion-chantier",
    title: "Gestion de Chantier",
    description: "Planification, suivi des projets et avancement en temps réel.",
    icon: Briefcase,
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80",
    color: "from-amber-500 to-orange-600",
    label: "Accéder",
  },
  {
    href: "/gestion-devis-facturation",
    title: "Devis & Facturation",
    description: "Devis et facturation assistés par IA pour vos chantiers.",
    icon: FileText,
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80",
    color: "from-blue-500 to-cyan-600",
    label: "Accéder",
  },
  {
    href: "/gestion-marketplace",
    title: "Marketplace",
    description: "Matériaux et équipements de construction. Commandez en ligne.",
    icon: ShoppingCart,
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80",
    color: "from-emerald-500 to-teal-600",
    label: "Voir le catalogue",
  },
];

export default function EspacePage() {
  const router = useRouter();
  const [user, setUser] = useState<BMPUser | null>(null);
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    const stored = getStoredUser();
    setUser(stored);

    if (stored?.role === "client") {
      router.replace("/espace/client");
    } else if (stored?.role === "expert") {
      router.replace("/espace/expert");
    } else if (stored?.role === "artisan") {
      router.replace("/espace/artisan");
    } else if (stored?.role === "livreur") {
      router.replace("/espace/livreur");
    } else if (stored?.role === "admin") {
      router.replace("/espace/admin");
    }
    setBootstrapped(true);
  }, [router]);

  const redirecting =
    bootstrapped &&
    user &&
    (user.role === "client" ||
      user.role === "expert" ||
      user.role === "artisan" ||
      user.role === "livreur" ||
      user.role === "admin");

  if (!bootstrapped || redirecting) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-muted-foreground">
        <Loader2 className="h-10 w-10 animate-spin text-brand" aria-hidden />
        <p className="text-sm text-body-secondary">
          {redirecting ? "Redirection vers votre espace…" : "Chargement…"}
        </p>
      </div>
    );
  }

  const isGuest = !user;

  return (
    <div className="space-y-16 lg:space-y-24">
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-bmp-md"
      >
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1200&q=80"
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="bmp-hero-scrim absolute inset-0" aria-hidden />
        </div>
        <div className="relative px-6 py-12 text-center sm:px-10 sm:py-16 lg:px-14 lg:py-20">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-white/30 bg-white/15 backdrop-blur-sm">
            <HardHat className="h-8 w-8 text-bmp-hero-title" />
          </div>
          <h1 className="mb-4 text-3xl font-bold text-bmp-hero-title sm:text-4xl lg:text-5xl">
            Bienvenue sur{" "}
            <span className="bg-gradient-to-r from-amber-50 to-amber-100 bg-clip-text text-transparent">
              BMP.tn
            </span>
          </h1>
          <p className="text-bmp-hero-subtitle mx-auto mb-4 max-w-2xl text-lg">
            {isGuest
              ? "La plateforme qui connecte clients, experts et artisans pour des chantiers suivis de bout en bout."
              : "Accédez à vos outils de gestion de chantier, devis et marketplace depuis un seul espace."}
          </p>
          {isGuest && (
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/inscription"
                className="inline-flex w-full items-center justify-center rounded-2xl bmp-btn-primary px-7 py-3 text-sm font-semibold transition sm:w-auto"
              >
                Commencer gratuitement
              </Link>
              <Link
                href="/login"
                className={cn(
                  "inline-flex w-full items-center justify-center rounded-2xl border px-7 py-3 text-sm font-semibold backdrop-blur-sm transition sm:w-auto",
                  "border-[rgba(255,255,255,0.55)] bg-white/12 text-bmp-hero-title hover:bg-white/22",
                )}
              >
                Connexion
              </Link>
            </div>
          )}
        </div>
      </motion.section>

      {isGuest && <GuestLandingShowcase />}

      <section>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8 text-center text-xl font-semibold text-foreground sm:text-left"
        >
          {isGuest ? "Découvrez les outils BMP.tn" : "Nos modules"}
        </motion.h2>
        <div className="grid gap-6 md:grid-cols-3 lg:gap-8">
          {modules.map((mod, i) => {
            const Icon = mod.icon;
            return (
              <motion.div
                key={mod.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
              >
                <Link
                  href={mod.href}
                  className="group block h-full overflow-hidden rounded-2xl border border-border bg-card shadow-bmp-sm transition-all duration-300 hover:border-brand/35 hover:shadow-bmp-md"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={mod.image}
                      alt={mod.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent dark:from-black/85" />
                    <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3">
                      <div
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-bmp-sm",
                          mod.color,
                        )}
                      >
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-lg font-bold text-white drop-shadow-md">
                        {mod.title}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="mb-4 line-clamp-2 text-sm text-body-secondary">
                      {mod.description}
                    </p>
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-brand transition-all group-hover:gap-3">
                      {mod.label}
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        <Link
          href="/gestion-chantier"
          className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-bmp-xs transition hover:border-brand/35 hover:shadow-bmp-sm"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 transition-transform group-hover:scale-105">
            <Briefcase className="h-6 w-6 text-brand" />
          </div>
          <div>
            <p className="font-medium text-foreground">Gestion de Chantier</p>
            <p className="text-xs text-muted-foreground">Projets & suivi</p>
          </div>
          <ArrowRight className="ml-auto h-5 w-5 text-brand/60" />
        </Link>
        <Link
          href="/gestion-devis-facturation"
          className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-bmp-xs transition hover:border-sky-500/40 hover:shadow-bmp-sm"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/15 transition-transform group-hover:scale-105 dark:bg-sky-500/20">
            <Calculator className="h-6 w-6 text-sky-600 dark:text-sky-400" />
          </div>
          <div>
            <p className="font-medium text-foreground">Devis & Facturation</p>
            <p className="text-xs text-muted-foreground">Devis IA</p>
          </div>
          <ArrowRight className="ml-auto h-5 w-5 text-sky-600/60 dark:text-sky-400/60" />
        </Link>
        <Link
          href="/gestion-marketplace"
          className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-bmp-xs transition hover:border-emerald-500/40 hover:shadow-bmp-sm"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/15 transition-transform group-hover:scale-105 dark:bg-emerald-500/20">
            <Package className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="font-medium text-foreground">Marketplace</p>
            <p className="text-xs text-muted-foreground">Catalogue B2B</p>
          </div>
          <ArrowRight className="ml-auto h-5 w-5 text-emerald-600/60 dark:text-emerald-400/60" />
        </Link>
      </motion.section>
    </div>
  );
}
