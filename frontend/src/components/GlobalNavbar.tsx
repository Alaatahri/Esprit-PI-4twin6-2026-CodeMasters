"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CartCounter } from '@/components/CartCounter';
import {
  Building2,
  Home,
  Briefcase,
  ShoppingCart,
  FileText,
  ClipboardList,
  Mail,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Camera,
  MessageCircle,
  FolderKanban,
  Layers,
  BarChart3, // ⭐ AJOUTÉ pour les statistiques
  Sun,
  Moon,
  type LucideIcon,
} from "lucide-react";
import {
  getStoredUser,
  clearStoredUser,
  isClientRole,
  normalizeRole,
  AUTH_CHANGE_EVENT,
  type BMPUser,
} from "@/lib/auth";
import { fetchUnreadCount } from "@/lib/messages-api";
import { BMP_THEME_STORAGE_KEY, type BMPThemeMode } from "@/lib/theme-storage";
import { useLanguage } from "@/components/LanguageProvider";

export default function GlobalNavbar() {
  const { t, lang } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<BMPUser | null>(null);
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [colorMode, setColorMode] = useState<BMPThemeMode>("dark");

  useEffect(() => {
    setMounted(true);
    setUser(getStoredUser());
    try {
      const saved = localStorage.getItem(BMP_THEME_STORAGE_KEY);
      if (saved === "light" || saved === "dark") setColorMode(saved);
      else setColorMode(document.documentElement.classList.contains("light") ? "light" : "dark");
    } catch {
      setColorMode("dark");
    }
  }, []);

  useEffect(() => {
    const sync = () => setUser(getStoredUser());
    window.addEventListener(AUTH_CHANGE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const userId = user?._id ?? "";

  useEffect(() => {
    if (!userId) {
      setUnreadMessages(0);
      return;
    }
    const tick = async () => {
      try {
        const n = await fetchUnreadCount(userId);
        setUnreadMessages(typeof n === "number" && n > 0 ? n : 0);
      } catch {
        setUnreadMessages(0);
      }
    };
    void tick();
    const id = window.setInterval(tick, 45_000);
    return () => window.clearInterval(id);
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    void (async () => {
      try {
        const n = await fetchUnreadCount(userId);
        setUnreadMessages(typeof n === "number" && n > 0 ? n : 0);
      } catch {
        setUnreadMessages(0);
      }
    })();
  }, [pathname, userId]);

  const baseNavItems = useMemo(() => {
    // Invité : navigation publique (accueil + marketplace + contact).
    if (!user) {
      return [
        { key: "home", href: "/espace", label: "Accueil", icon: Home },
        {
          key: "marketplace",
          href: "/gestion-marketplace",
          label: t("marketplace"),
          icon: ShoppingCart,
        },
        { key: "contact", href: "/contact", label: t("contact"), icon: Mail },
      ];
    }

    // Connecté : modules + accès selon rôle.
    return [
      { key: "home", href: "/espace", label: t("nav_dashboard"), icon: Home },
      {
        key: "chantier",
        href: "/gestion-chantier",
        label: t("nav_chantier"),
        icon: Briefcase,
      },
      {
        key: "devis",
        href: "/gestion-devis-facturation",
        label: t("nav_devis"),
        icon: FileText,
      },
      {
        key: "marketplace",
        href: "/gestion-marketplace",
        label: t("marketplace"),
        icon: ShoppingCart,
      },
      {
        key: "stats",
        href: "/gestion-marketplace/stats",
        label: t("nav_stats"),
        icon: BarChart3,
      },
      { key: "contact", href: "/contact", label: t("contact"), icon: Mail },
    ];
  }, [lang, t, user]);

  const navItems = useMemo(() => {
    const role = user?.role;
    const canSeeChantier = role === "admin" || role === "artisan" || role === "ouvrier";

    const filteredBase = baseNavItems.filter((item) => {
      if (item.key === "chantier") return canSeeChantier;
      return true;
    });

    const mapped = filteredBase.map((item) => {
      if (item.key !== "home") return item;
      if (!user) return item;

      const roleHref = isClientRole(user.role)
        ? "/espace/client"
        : user.role === "expert"
          ? "/espace/expert"
          : user.role === "artisan"
            ? "/espace/artisan"
            : user.role === "admin"
              ? "/espace/admin"
              : user.role === "livreur"
                ? "/espace-livreur"
                : "/espace";

      return { ...item, href: roleHref };
    });

    return mapped;
  }, [user, baseNavItems]);

  const extraClientItems: Array<{
    href: string;
    label: string;
    icon?: LucideIcon;
    title?: string;
  }> = useMemo(() => {
    if (!isClientRole(user?.role)) return [];
    return [
      {
        href: "/espace/client/suivi",
        label: t("nav_suivi_mes_projets"),
        icon: Camera,
        title: t("title_suivi_photos"),
      },
      { href: "/espace/client", label: t("mes_projets") },
      { href: "/espace/client/nouveau-projet", label: t("nav_plus_nouveau_projet") },
    ];
  }, [user?.role, lang, t]);

  const handleLogout = () => {
    clearStoredUser();
    setUser(null);
    setMobileOpen(false);
    router.push("/espace");
  };

  const profileHref = useMemo(() => {
    if (!user) return "/login";
    const r = normalizeRole(user.role);
    // Clients : page de profil/avis interne
    if (r === "client") return "/espace/profil";
    // Workers : page profil public (fiche claire, notes, travaux, avis)
    return `/profil/${encodeURIComponent(user._id)}`;
  }, [user]);

  const applyTheme = (mode: BMPThemeMode) => {
    try {
      const html = document.documentElement;
      if (mode === "dark") {
        html.classList.add("dark");
        html.classList.remove("light");
      } else {
        html.classList.add("light");
        html.classList.remove("dark");
      }
      localStorage.setItem(BMP_THEME_STORAGE_KEY, mode);
      setColorMode(mode);
    } catch {
      /* ignore */
    }
  };

  const toggleTheme = () => {
    applyTheme(colorMode === "dark" ? "light" : "dark");
  };

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === "/espace") return pathname === "/espace";
    if (href === "/espace/client") {
      return (
        pathname === "/espace/client" ||
        pathname === "/espace/client/nouveau-projet"
      );
    }
    if (href === "/espace/client/suivi") {
      return pathname.startsWith("/espace/client/suivi");
    }
    if (href === "/messages") {
      return pathname.startsWith("/messages");
    }
    if (href === "/expert/projets") {
      return pathname.startsWith("/expert/projets");
    }
    if (href === "/expert/tous-les-projets") {
      return pathname.startsWith("/expert/tous-les-projets");
    }
    if (href === "/gestion-marketplace/stats") {
      return pathname.startsWith("/gestion-marketplace/stats");
    }
    return pathname.startsWith(href);
  };

  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-2xl">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-300 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <Building2 className="w-5 h-5 text-gray-900" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-amber-600 to-amber-900 dark:from-amber-300 dark:to-white bg-clip-text text-transparent">
                BMP.tn
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl border border-border/60 bg-card/50" />
          </div>
        </div>
      </header>
    );
  }

  // ⭐ MASQUER LA NAVBAR POUR LES LIVREURS OU DANS L'ESPACE LIVREUR
  if (user?.role === "livreur" || pathname.startsWith("/espace-livreur")) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-2xl">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/espace" className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-300 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Building2 className="w-5 h-5 text-gray-900" />
            </div>
            <div className="hidden sm:block">
              <span className="text-lg font-bold bg-gradient-to-r from-amber-600 to-amber-900 dark:from-amber-300 dark:to-white bg-clip-text text-transparent">
                BMP.tn
              </span>
              <div className="text-[10px] text-amber-400/80 font-medium tracking-widest">
                {t("tagline_plateforme")}
              </div>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1 min-w-0 overflow-x-auto scrollbar-bmp">
            {navItems.map((item) => {
              const Icon = item.icon;
              // Cas spécial pour le marketplace avec badge
              if (item.key === "marketplace") {
                return (
                  <Link
                    key={item.key ?? item.href}
                    href={item.href}
                    className={`relative flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all shrink-0 whitespace-nowrap ${
                      isActive(item.href)
                        ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30"
                        : "text-muted-foreground hover:text-foreground hover:bg-amber-500/10"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                    <CartCounter />
                  </Link>
                );
              }
              // Cas normal pour les autres items
              return (
                <Link
                  key={item.key ?? item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all shrink-0 whitespace-nowrap ${
                    isActive(item.href)
                      ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-amber-500/10"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}

            {extraClientItems.length > 0 && (
              <div className="flex items-center gap-1 ml-2 pl-2 border-l border-border dark:border-white/5 shrink-0">
                {extraClientItems.map((it) => {
                  const ExtraIcon = it.icon;
                  return (
                    <Link
                      key={it.href}
                      href={it.href}
                      title={it.title}
                      className={`inline-flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap shrink-0 ${
                        isActive(it.href)
                          ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30"
                          : "text-muted-foreground/80 dark:text-gray-300/80 hover:text-amber-900 dark:text-amber-100 hover:bg-amber-500/10"
                      }`}
                    >
                      {ExtraIcon ? (
                        <ExtraIcon className="w-4 h-4 shrink-0 opacity-90" />
                      ) : null}
                      {it.label}
                    </Link>
                  );
                })}
              </div>
            )}

            {user && (
              <div className="flex items-center gap-1 ml-2 pl-2 border-l border-border dark:border-white/5 shrink-0">
                {(normalizeRole(user.role) === "expert" ||
                  user.role === "admin") && (
                  <Link
                    href="/expert/tous-les-projets"
                    className={`inline-flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap shrink-0 ${
                      isActive("/expert/tous-les-projets")
                        ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30"
                        : "text-muted-foreground/80 dark:text-gray-300/80 hover:text-amber-900 dark:text-amber-100 hover:bg-amber-500/10"
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                    {t("nav_tous_les_projets")}
                  </Link>
                )}
                {normalizeRole(user.role) === "expert" && (
                  <Link
                    href="/expert/projets"
                    className={`inline-flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap shrink-0 ${
                      isActive("/expert/projets")
                        ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30"
                        : "text-muted-foreground/80 dark:text-gray-300/80 hover:text-amber-900 dark:text-amber-100 hover:bg-amber-500/10"
                    }`}
                  >
                    <FolderKanban className="w-4 h-4" />
                    {t("nav_projets")}
                  </Link>
                )}
                {normalizeRole(user.role) === "expert" && (
                  <Link
                    href="/expert/nouveaux-projets"
                    className={`inline-flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap shrink-0 ${
                      isActive("/expert/nouveaux-projets")
                        ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30"
                        : "text-muted-foreground/80 dark:text-gray-300/80 hover:text-amber-900 dark:text-amber-100 hover:bg-amber-500/10"
                    }`}
                  >
                    <ClipboardList className="w-4 h-4" />
                    {t("nav_invitations")}
                  </Link>
                )}
                <Link
                  href="/messages"
                  className={`inline-flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap shrink-0 ${
                    isActive("/messages")
                      ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30"
                      : "text-muted-foreground/80 dark:text-gray-300/80 hover:text-amber-900 dark:text-amber-100 hover:bg-amber-500/10"
                  }`}
                >
                  <MessageCircle className="w-4 h-4" />
                  {t("nav_messages")}
                  {unreadMessages > 0 && (
                    <span className="min-w-[1.25rem] h-5 px-1.5 rounded-full bg-amber-500 text-gray-900 text-[10px] font-bold flex items-center justify-center">
                      {unreadMessages > 99 ? "99+" : unreadMessages}
                    </span>
                  )}
                </Link>
              </div>
            )}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="hidden sm:inline-flex items-center justify-center w-10 h-10 rounded-xl bg-card/50 border border-border/60 text-muted-foreground hover:text-foreground hover:border-amber-500/30 hover:bg-amber-500/10 transition-all"
              title={colorMode === "dark" ? t("theme_light_title") : t("theme_dark_title")}
              aria-label={
                colorMode === "dark" ? t("aria_theme_to_light") : t("aria_theme_to_dark")
              }
            >
              {colorMode === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            {user ? (
              <>
                <Link
                  href={profileHref}
                  className="hidden sm:flex items-center gap-3 pl-2 border-l border-border/60 group"
                  title="Voir mon profil"
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30 overflow-hidden shrink-0 group-hover:border-amber-500/45 transition-colors">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.nom}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-bold text-amber-700 dark:text-amber-300">
                        {user.nom?.charAt(0).toUpperCase() || "U"}
                      </span>
                    )}
                  </div>
                  <div className="leading-tight">
                    <p className="text-sm font-medium text-foreground group-hover:text-amber-800 dark:group-hover:text-amber-200 transition-colors">
                      {user.nom}
                    </p>
                    <p className="text-xs text-amber-400/80 capitalize">
                      {user.role}
                    </p>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card/50 border border-border/60 text-muted-foreground hover:text-foreground hover:border-amber-500/30 hover:bg-amber-500/10 transition-all"
                  title={t("deconnexion")}
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">{t("deconnexion")}</span>
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-900 font-semibold hover:shadow-lg hover:shadow-amber-500/30 transition-all"
              >
                {t("connexion")}
              </Link>
            )}

            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="lg:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-amber-500/10"
              aria-label={t("mobile_menu")}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Drawer mobile (overlay + panneau latéral) */}
      <div
        className={`lg:hidden fixed inset-0 z-50 transition ${
          mobileOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
        aria-hidden={!mobileOpen}
      >
        {/* Backdrop */}
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className={`absolute inset-0 bg-black/5 dark:bg-black/70 backdrop-blur-sm transition-opacity ${
            mobileOpen ? "opacity-100" : "opacity-0"
          }`}
          aria-label={t("aria_fermer_menu")}
        />

        {/* Panel */}
        <aside
          className={`absolute right-0 top-0 h-full w-[min(92vw,420px)] border-l border-border/60 bg-background/95 backdrop-blur-2xl shadow-2xl shadow-black/30 transition-transform duration-300 ease-out ${
            mobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between px-4 py-4 border-b border-border dark:border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-300 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Building2 className="w-4.5 h-4.5 text-gray-900" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground leading-tight">
                  BMP.tn
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {t("mobile_menu")}
                  {user ? ` · ${user.nom}` : ""}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-amber-500/10"
              aria-label={t("aria_fermer")}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="px-3 py-3 flex flex-col gap-1 overflow-y-auto h-[calc(100vh-73px)] scrollbar-bmp">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isMarketplace = item.key === "marketplace";
              const isStats = item.key === "stats";
              return (
                <Link
                  key={item.key ?? item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                    isActive(item.href)
                      ? "bg-amber-500/15 text-amber-800 dark:text-amber-200 border border-amber-500/20"
                      : "text-foreground/80 dark:text-gray-200/80 hover:bg-amber-500/10 hover:text-amber-900 dark:text-amber-100"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                  {isMarketplace && <CartCounter />}
                  {isStats && (
                    <span className="ml-2 px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[9px] font-bold">
                      {t("badge_new")}
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 ml-auto opacity-60" />
                </Link>
              );
            })}

            {extraClientItems.length > 0 && (
              <div className="mt-2 pt-2 border-t border-border dark:border-white/5">
                {extraClientItems.map((it) => {
                  const ExtraIcon = it.icon;
                  return (
                    <Link
                      key={it.href}
                      href={it.href}
                      title={it.title}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                        isActive(it.href)
                          ? "bg-amber-500/15 text-amber-800 dark:text-amber-200 border border-amber-500/20"
                          : "text-foreground/80 dark:text-gray-200/80 hover:bg-amber-500/10 hover:text-amber-900 dark:text-amber-100"
                      }`}
                    >
                      {ExtraIcon ? (
                        <ExtraIcon className="w-5 h-5 shrink-0 opacity-90" />
                      ) : null}
                      {it.label}
                      <ChevronRight className="w-4 h-4 ml-auto opacity-60" />
                    </Link>
                  );
                })}
              </div>
            )}

            {user && (
              <div className="mt-2 pt-2 border-t border-border dark:border-white/5 space-y-1">
                {(normalizeRole(user.role) === "expert" ||
                  user.role === "admin") && (
                  <Link
                    href="/expert/tous-les-projets"
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                      isActive("/expert/tous-les-projets")
                        ? "bg-amber-500/15 text-amber-800 dark:text-amber-200 border border-amber-500/20"
                        : "text-foreground/80 dark:text-gray-200/80 hover:bg-amber-500/10 hover:text-amber-900 dark:text-amber-100"
                    }`}
                  >
                    <Layers className="w-5 h-5" />
                    {t("nav_tous_les_projets")}
                    <ChevronRight className="w-4 h-4 ml-auto opacity-60" />
                  </Link>
                )}
                {normalizeRole(user.role) === "expert" && (
                  <Link
                    href="/expert/projets"
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                      isActive("/expert/projets")
                        ? "bg-amber-500/15 text-amber-800 dark:text-amber-200 border border-amber-500/20"
                        : "text-foreground/80 dark:text-gray-200/80 hover:bg-amber-500/10 hover:text-amber-900 dark:text-amber-100"
                    }`}
                  >
                    <FolderKanban className="w-5 h-5" />
                    {t("nav_projets")}
                    <ChevronRight className="w-4 h-4 ml-auto opacity-60" />
                  </Link>
                )}
                {normalizeRole(user.role) === "expert" && (
                  <Link
                    href="/expert/nouveaux-projets"
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                      isActive("/expert/nouveaux-projets")
                        ? "bg-amber-500/15 text-amber-800 dark:text-amber-200 border border-amber-500/20"
                        : "text-foreground/80 dark:text-gray-200/80 hover:bg-amber-500/10 hover:text-amber-900 dark:text-amber-100"
                    }`}
                  >
                    <ClipboardList className="w-5 h-5" />
                    {t("nav_invitations")}
                    <ChevronRight className="w-4 h-4 ml-auto opacity-60" />
                  </Link>
                )}
                <Link
                  href="/messages"
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                    isActive("/messages")
                      ? "bg-amber-500/15 text-amber-800 dark:text-amber-200 border border-amber-500/20"
                      : "text-foreground/80 dark:text-gray-200/80 hover:bg-amber-500/10 hover:text-amber-900 dark:text-amber-100"
                  }`}
                >
                  <MessageCircle className="w-5 h-5" />
                  {t("nav_messages")}
                  {unreadMessages > 0 && (
                    <span className="min-w-[1.25rem] h-6 px-2 rounded-full bg-amber-500 text-gray-900 text-[11px] font-bold flex items-center justify-center">
                      {unreadMessages > 99 ? "99+" : unreadMessages}
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 ml-auto opacity-60" />
                </Link>
              </div>
            )}

            <div className="mt-2 pt-3 border-t border-border dark:border-white/5">
              {user ? (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-foreground/80 dark:text-gray-200/80 hover:bg-amber-500/10 hover:text-amber-800 dark:text-amber-200 border border-border dark:border-white/5 bg-black/5 dark:bg-black/20"
                >
                  <LogOut className="w-5 h-5" />
                  {t("deconnexion")}
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-900 font-semibold"
                >
                  {t("connexion")}
                </Link>
              )}
            </div>
          </nav>
        </aside>
      </div>
    </header>
  );
}