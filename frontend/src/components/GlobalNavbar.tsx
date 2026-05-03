"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
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
import { cn } from "@/lib/utils";

function navLinkDesktop(active: boolean) {
  return cn(
    "flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all shrink-0 whitespace-nowrap border border-transparent",
    active
      ? "bg-brand/15 text-brand border-brand/35 shadow-bmp-xs dark:bg-brand/20 dark:border-brand/45"
      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
  );
}

function navLinkMobile(active: boolean) {
  return cn(
    "flex items-center gap-3 px-4 py-3 rounded-xl transition border border-transparent",
    active
      ? "bg-brand/15 text-brand border-brand/35 dark:bg-brand/22 dark:border-brand/45"
      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
  );
}

const baseNavItems = [
  { key: "home", href: "/espace", label: "Mon espace", icon: Home },
  { key: "chantier", href: "/gestion-chantier", label: "Chantier", icon: Briefcase },
  { key: "devis", href: "/gestion-devis-facturation", label: "Devis", icon: FileText },
  { key: "marketplace", href: "/gestion-marketplace", label: "Marketplace", icon: ShoppingCart },
  { key: "contact", href: "/contact", label: "Contact", icon: Mail },
];

export default function GlobalNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<BMPUser | null>(null);
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    setMounted(true);
    setUser(getStoredUser());
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
              : "/espace";

      return { ...item, href: roleHref };
    });

    return mapped;
  }, [user]);

  const extraClientItems: Array<{
    href: string;
    label: string;
    icon?: LucideIcon;
    title?: string;
  }> = isClientRole(user?.role)
    ? [
        {
          href: "/espace/client/suivi",
          label: "Suivi de mes projets",
          icon: Camera,
          title: "Voir le taux d'avancement et les photos de chantier",
        },
        { href: "/espace/client", label: "Mes projets" },
        { href: "/espace/client/nouveau-projet", label: "+ Nouveau projet" },
      ]
    : [];

  const handleLogout = () => {
    clearStoredUser();
    setUser(null);
    setMobileOpen(false);
    router.push("/espace");
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
    return pathname.startsWith(href);
  };

  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-xl shadow-bmp-xs supports-[backdrop-filter]:bg-background/75">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bmp-icon-gradient">
                <Building2 className="h-5 w-5 text-gray-900" />
              </div>
              <span className="bg-gradient-to-r from-brand to-brand-muted bg-clip-text text-lg font-bold text-transparent">
                BMP.tn
              </span>
            </div>
            <div className="h-10 w-10 rounded-xl border border-border bg-muted" />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-xl shadow-bmp-xs supports-[backdrop-filter]:bg-background/75">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/espace" className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bmp-icon-gradient flex items-center justify-center">
              <Building2 className="w-5 h-5 text-gray-900" />
            </div>
            <div className="hidden sm:block">
              <span className="bg-gradient-to-r from-brand via-brand-muted to-foreground bg-clip-text text-lg font-bold text-transparent">
                BMP.tn
              </span>
              <div className="text-[10px] font-medium tracking-widest text-muted-foreground">
                PLATEFORME
              </div>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1 min-w-0 overflow-x-auto scrollbar-bmp">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.key ?? item.href}
                  href={item.href}
                  className={navLinkDesktop(isActive(item.href))}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}

            {extraClientItems.length > 0 && (
              <div className="ml-2 flex shrink-0 items-center gap-1 border-l border-border pl-2">
                {extraClientItems.map((it) => {
                  const ExtraIcon = it.icon;
                  return (
                    <Link
                      key={it.href}
                      href={it.href}
                      title={it.title}
                      className={cn(
                        navLinkDesktop(isActive(it.href)),
                        "inline-flex px-3 sm:px-4",
                      )}
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
              <div className="ml-2 flex shrink-0 items-center gap-1 border-l border-border pl-2">
                {(normalizeRole(user.role) === "expert" ||
                  user.role === "admin") && (
                  <Link
                    href="/expert/tous-les-projets"
                    className={cn(
                      navLinkDesktop(isActive("/expert/tous-les-projets")),
                      "inline-flex",
                    )}
                  >
                    <Layers className="w-4 h-4" />
                    Tous les projets
                  </Link>
                )}
                {normalizeRole(user.role) === "expert" && (
                  <Link
                    href="/expert/projets"
                    className={cn(
                      navLinkDesktop(isActive("/expert/projets")),
                      "inline-flex",
                    )}
                  >
                    <FolderKanban className="w-4 h-4" />
                    Projets
                  </Link>
                )}
                {normalizeRole(user.role) === "expert" && (
                  <Link
                    href="/expert/nouveaux-projets"
                    className={cn(
                      navLinkDesktop(isActive("/expert/nouveaux-projets")),
                      "inline-flex",
                    )}
                  >
                    <ClipboardList className="w-4 h-4" />
                    Invitations
                  </Link>
                )}
                <Link
                  href="/messages"
                  className={cn(
                    navLinkDesktop(isActive("/messages")),
                    "inline-flex",
                  )}
                >
                  <MessageCircle className="w-4 h-4" />
                  Messages
                  {unreadMessages > 0 && (
                    <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-brand-muted px-1.5 text-[10px] font-bold text-brand-foreground">
                      {unreadMessages > 99 ? "99+" : unreadMessages}
                    </span>
                  )}
                </Link>
              </div>
            )}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <>
                <div className="hidden items-center gap-3 border-l border-border pl-2 sm:flex">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-brand/35 bg-brand/15">
                    <span className="text-sm font-bold text-brand">
                      {user.nom?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                  <div className="leading-tight">
                    <p className="text-sm font-medium text-foreground">{user.nom}</p>
                    <p className="text-xs capitalize text-muted-foreground">{user.role}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="hidden items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-muted-foreground transition-all hover:border-brand/35 hover:bg-accent hover:text-accent-foreground sm:flex"
                  title="Déconnexion"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Déconnexion</span>
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bmp-btn-primary font-semibold hover:shadow-lg transition-all"
              >
                Connexion
              </Link>
            )}

            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="rounded-xl p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground lg:hidden"
              aria-label="Menu"
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
          className={cn(
            "absolute inset-0 bg-foreground/45 backdrop-blur-sm transition-opacity dark:bg-black/65",
            mobileOpen ? "opacity-100" : "opacity-0",
          )}
          aria-label="Fermer le menu"
        />

        {/* Panel */}
        <aside
          className={cn(
            "absolute right-0 top-0 h-full w-[min(92vw,420px)] border-l border-border bg-card/98 shadow-bmp-lg backdrop-blur-xl transition-transform duration-300 ease-out dark:shadow-black/50",
            mobileOpen ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bmp-icon-gradient flex items-center justify-center">
                <Building2 className="h-[18px] w-[18px] text-gray-900" />
              </div>
              <div>
                <p className="text-sm font-semibold leading-tight text-foreground">
                  BMP.tn
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Menu
                  {user ? ` · ${user.nom}` : ""}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="rounded-xl p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              aria-label="Fermer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex h-[calc(100vh-73px)] flex-col gap-1 overflow-y-auto px-3 py-3 scrollbar-bmp">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.key ?? item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={navLinkMobile(isActive(item.href))}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                  <ChevronRight className="w-4 h-4 ml-auto opacity-60" />
                </Link>
              );
            })}

            {extraClientItems.length > 0 && (
              <div className="mt-2 border-t border-border pt-2">
                {extraClientItems.map((it) => {
                  const ExtraIcon = it.icon;
                  return (
                    <Link
                      key={it.href}
                      href={it.href}
                      title={it.title}
                      onClick={() => setMobileOpen(false)}
                      className={navLinkMobile(isActive(it.href))}
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
              <div className="mt-2 space-y-1 border-t border-border pt-2">
                {(normalizeRole(user.role) === "expert" ||
                  user.role === "admin") && (
                  <Link
                    href="/expert/tous-les-projets"
                    onClick={() => setMobileOpen(false)}
                    className={navLinkMobile(isActive("/expert/tous-les-projets"))}
                  >
                    <Layers className="w-5 h-5" />
                    Tous les projets
                    <ChevronRight className="w-4 h-4 ml-auto opacity-60" />
                  </Link>
                )}
                {normalizeRole(user.role) === "expert" && (
                  <Link
                    href="/expert/projets"
                    onClick={() => setMobileOpen(false)}
                    className={navLinkMobile(isActive("/expert/projets"))}
                  >
                    <FolderKanban className="w-5 h-5" />
                    Mes projets
                    <ChevronRight className="w-4 h-4 ml-auto opacity-60" />
                  </Link>
                )}
                {normalizeRole(user.role) === "expert" && (
                  <Link
                    href="/expert/nouveaux-projets"
                    onClick={() => setMobileOpen(false)}
                    className={navLinkMobile(isActive("/expert/nouveaux-projets"))}
                  >
                    <ClipboardList className="w-5 h-5" />
                    Invitations
                    <ChevronRight className="w-4 h-4 ml-auto opacity-60" />
                  </Link>
                )}
                <Link
                  href="/messages"
                  onClick={() => setMobileOpen(false)}
                  className={navLinkMobile(isActive("/messages"))}
                >
                  <MessageCircle className="w-5 h-5" />
                  Messages
                  {unreadMessages > 0 && (
                    <span className="flex h-6 min-w-[1.25rem] items-center justify-center rounded-full bg-brand-muted px-2 text-[11px] font-bold text-brand-foreground">
                      {unreadMessages > 99 ? "99+" : unreadMessages}
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 ml-auto opacity-60" />
                </Link>
              </div>
            )}

            <div className="mt-2 border-t border-border pt-3">
              {user ? (
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-xl border border-border bg-muted/50 px-4 py-3 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  <LogOut className="w-5 h-5" />
                  Déconnexion
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bmp-btn-primary font-semibold"
                >
                  Connexion
                </Link>
              )}
            </div>
          </nav>
        </aside>
      </div>
    </header>
  );
}

