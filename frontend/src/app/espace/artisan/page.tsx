"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStoredUser, type BMPUser } from "@/lib/auth";
import { SuiviTimeline } from "@/components/SuiviTimeline";
import {
  ClipboardList,
  Briefcase,
  Clock,
  CheckCircle2,
  PlusCircle,
  MessageCircle,
  Camera,
  Sparkles,
  Loader2,
  BadgeCheck,
  ArrowRight,
  Hammer,
  LayoutDashboard,
} from "lucide-react";
import Link from "next/link";
import { getApiBaseUrl } from "@/lib/api-base";
import { refId } from "@/lib/project-refs";
import { readJsonSafe } from "@/lib/read-json-safe";

const API_URL = getApiBaseUrl();

function extractApiError(parsed: unknown, fallback: string): string {
  if (parsed && typeof parsed === "object") {
    const r = parsed as Record<string, unknown>;
    const m = r.message;
    if (typeof m === "string") return m;
    if (Array.isArray(m) && typeof m[0] === "string") return m[0];
    const e = r.error;
    if (typeof e === "string") return e;
  }
  return fallback;
}

type OpenProject = {
  _id: string;
  titre: string;
  description: string;
  budget_estime: number;
  date_debut?: string;
  date_fin_prevue?: string;
  clientNom?: string;
  statut: string;
};

type ArtisanApplication = {
  _id: string;
  projet: {
    _id: string;
    titre: string;
  };
  statut: "en_attente" | "acceptee" | "refusee";
};

type MemberProject = {
  _id: string;
  titre: string;
  description: string;
  budget_estime: number;
  avancement_global?: number;
  clientNom?: string;
  statut: string;
  clientId?: unknown;
  expertId?: unknown;
};

export default function ArtisanSpacePage() {
  const router = useRouter();
  const [user, setUser] = useState<BMPUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [openProjects, setOpenProjects] = useState<OpenProject[]>([]);
  const [loadingOpenProjects, setLoadingOpenProjects] = useState(false);

  const [applications, setApplications] = useState<ArtisanApplication[]>([]);
  const [loadingApplications, setLoadingApplications] = useState(false);

  const [memberProjects, setMemberProjects] = useState<MemberProject[]>([]);
  const [loadingMemberProjects, setLoadingMemberProjects] = useState(false);

  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadErrors, setLoadErrors] = useState<{
    open?: string;
    applications?: string;
    members?: string;
  }>({});

  useEffect(() => {
    const stored = getStoredUser();
    setUser(stored);
    setLoadingUser(false);
  }, []);

  useEffect(() => {
    if (!user || user.role !== "artisan") return;

    const artisanHeaders = {
      "x-user-id": user._id,
    };

    const fetchOpenProjects = async () => {
      setLoadingOpenProjects(true);
      setLoadErrors((e) => ({ ...e, open: undefined }));
      try {
        const res = await fetch(`${API_URL}/projects`);
        const parsed = await readJsonSafe<unknown>(res);
        if (!res.ok) {
          setLoadErrors((e) => ({
            ...e,
            open: extractApiError(
              parsed,
              `Impossible de charger les projets (${res.status}).`
            ),
          }));
          setOpenProjects([]);
          return;
        }
        const data = Array.isArray(parsed) ? parsed : [];
        const filtered = data.filter(
          (p: OpenProject) => p.statut === "En attente"
        );
        setOpenProjects(filtered as OpenProject[]);
      } catch (err) {
        setLoadErrors((e) => ({
          ...e,
          open:
            err instanceof Error
              ? err.message
              : "Erreur réseau lors du chargement des projets.",
        }));
        setOpenProjects([]);
      } finally {
        setLoadingOpenProjects(false);
      }
    };

    const fetchApplications = async () => {
      setLoadingApplications(true);
      setLoadErrors((e) => ({ ...e, applications: undefined }));
      try {
        const res = await fetch(
          `${API_URL}/applications/me?artisanId=${encodeURIComponent(user._id)}`,
          { headers: artisanHeaders }
        );
        const parsed = await readJsonSafe<unknown>(res);
        if (!res.ok) {
          setLoadErrors((e) => ({
            ...e,
            applications: extractApiError(
              parsed,
              `Candidatures (${res.status}).`
            ),
          }));
          setApplications([]);
          return;
        }
        const data = Array.isArray(parsed) ? parsed : [];
        setApplications(data as ArtisanApplication[]);
      } catch (err) {
        setLoadErrors((e) => ({
          ...e,
          applications:
            err instanceof Error
              ? err.message
              : "Erreur réseau (candidatures).",
        }));
        setApplications([]);
      } finally {
        setLoadingApplications(false);
      }
    };

    const fetchMemberProjects = async () => {
      setLoadingMemberProjects(true);
      setLoadErrors((e) => ({ ...e, members: undefined }));
      try {
        const res = await fetch(
          `${API_URL}/projects/mine-as-artisan?artisanId=${encodeURIComponent(
            user._id
          )}`,
          { headers: artisanHeaders }
        );
        const parsed = await readJsonSafe<unknown>(res);
        if (!res.ok) {
          setLoadErrors((e) => ({
            ...e,
            members: extractApiError(
              parsed,
              `Projets membres (${res.status}).`
            ),
          }));
          setMemberProjects([]);
          return;
        }
        const data = Array.isArray(parsed) ? parsed : [];
        setMemberProjects(data as MemberProject[]);
      } catch (err) {
        setLoadErrors((e) => ({
          ...e,
          members:
            err instanceof Error
              ? err.message
              : "Erreur réseau (projets membres).",
        }));
        setMemberProjects([]);
      } finally {
        setLoadingMemberProjects(false);
      }
    };

    fetchOpenProjects();
    fetchApplications();
    fetchMemberProjects();
  }, [user]);

  const handleApply = async (projectId: string) => {
    if (!user) return;
    setError(null);
    setActionLoadingId(projectId);
    try {
      const res = await fetch(`${API_URL}/projects/${projectId}/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user._id,
        },
        body: JSON.stringify({ artisanId: user._id }),
      });
      const body = await readJsonSafe<Record<string, unknown>>(res);
      if (!res.ok) {
        throw new Error(
          extractApiError(body, "Impossible de postuler à ce projet.")
        );
      }
      const created = body as unknown as ArtisanApplication;
      if (created?.projet?.titre || created?._id) {
        setApplications((prev) => [created, ...prev]);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors de la candidature au projet."
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const isBusy =
    loadingUser || loadingOpenProjects || loadingApplications || loadingMemberProjects;

  if (!loadingUser && !user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-14 text-center space-y-6">
        <div className="mx-auto w-fit rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-950/40 to-gray-950/80 p-5 shadow-2xl shadow-black/50">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/15 border border-amber-500/35">
            <Briefcase className="h-7 w-7 text-amber-700 dark:text-amber-300" />
          </div>
          <h1 className="text-2xl font-bold text-foreground dark:text-white">Espace artisan</h1>
          <p className="mt-2 text-sm text-muted-foreground dark:text-gray-400">
            Connectez-vous pour voir les projets ouverts, postuler et suivre vos
            missions.
          </p>
          <button
            onClick={() => router.push("/login")}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 px-6 py-3 text-sm font-semibold text-gray-900 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition"
          >
            Aller à la connexion
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  if (!loadingUser && user && user.role !== "artisan") {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-4">
        <h1 className="text-2xl font-bold text-foreground dark:text-white">
          Espace réservé aux artisans
        </h1>
        <p className="text-muted-foreground dark:text-gray-400 text-sm">
          Vous êtes connecté en tant que{" "}
          <span className="font-semibold text-amber-700 dark:text-amber-300">{user.role}</span>.
          Cet écran est dédié aux artisans.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground dark:bg-gradient-to-b dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 dark:text-white">
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-8 sm:py-10 space-y-8">
      {/* Header / hero */}
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card shadow-bmp-md dark:border-white/10 dark:bg-gradient-to-br dark:from-amber-950/30 dark:via-gray-950/70 dark:to-gray-950 dark:shadow-none p-6 sm:p-8">
        <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-2xl bg-amber-500/15 border border-amber-500/35 flex items-center justify-center shrink-0">
              <Briefcase className="h-6 w-6 text-amber-700 dark:text-amber-300" />
            </div>
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-800/90 dark:text-amber-300/80 inline-flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5" />
                Espace artisan
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground dark:text-white leading-tight">
                Vos missions, candidatures et suivi chantier
              </h1>
              <p className="text-sm text-muted-foreground dark:text-gray-400 max-w-2xl">
                Postulez aux projets disponibles, suivez vos projets assignés et
                échangez avec le client / l’expert.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 sm:items-center">
            <Link
              href="/gestion-chantier"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-3 text-sm font-medium text-emerald-900 hover:bg-emerald-500/15 transition dark:text-emerald-100 dark:hover:bg-emerald-500/20"
            >
              <LayoutDashboard className="h-4 w-4 shrink-0" />
              Gestion chantier
            </Link>
            <Link
              href="/messages"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border/60 bg-muted/40 px-5 py-3 text-sm font-medium text-foreground hover:bg-muted/60 hover:border-brand/30 transition dark:border-white/10 dark:bg-black/30 dark:text-gray-200 dark:hover:bg-amber-500/10 dark:hover:text-amber-100 dark:hover:border-amber-500/30"
            >
              <MessageCircle className="h-4 w-4 shrink-0" />
              Messages
            </Link>
            <Link
              href="/espace/artisan/profil"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 px-5 py-3 text-sm font-semibold text-gray-900 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition"
            >
              <BadgeCheck className="h-4 w-4 shrink-0" />
              Mon profil
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-800 dark:text-red-200">
          {error}
        </div>
      )}

      {(loadErrors.open ||
        loadErrors.applications ||
        loadErrors.members) && (
        <div className="rounded-2xl border border-amber-500/35 bg-amber-50 px-5 py-4 text-sm text-amber-950 space-y-1 dark:border-amber-500/25 dark:bg-amber-950/25 dark:text-amber-100/95">
          <p className="font-medium text-amber-900 dark:text-amber-200">
            Problème de chargement (vérifiez que le backend tourne sur le port
            attendu par le proxy Next).
          </p>
          {loadErrors.open && (
            <p className="text-xs text-amber-900/90 dark:text-amber-100/80">
              <span className="text-amber-950 dark:text-amber-300/90">Open projects:</span>{" "}
              {loadErrors.open}
            </p>
          )}
          {loadErrors.applications && (
            <p className="text-xs text-amber-900/90 dark:text-amber-100/80">
              <span className="text-amber-950 dark:text-amber-300/90">Applications:</span>{" "}
              {loadErrors.applications}
            </p>
          )}
          {loadErrors.members && (
            <p className="text-xs text-amber-900/90 dark:text-amber-100/80">
              <span className="text-amber-950 dark:text-amber-300/90">Member projects:</span>{" "}
              {loadErrors.members}
            </p>
          )}
        </div>
      )}

      {/* Quick stats */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-sky-200/90 bg-sky-50 p-4 dark:border-sky-500/20 dark:bg-sky-950/20">
          <p className="text-[11px] uppercase tracking-wider text-sky-900/80 dark:text-sky-200/80 flex items-center gap-2">
            <Briefcase className="h-3.5 w-3.5" />
            Projets disponibles
          </p>
          <p className="mt-1 text-2xl font-bold text-foreground dark:text-white tabular-nums">
            {loadingOpenProjects ? "…" : openProjects.length}
          </p>
        </div>
        <div className="rounded-2xl border border-amber-200/90 bg-amber-50 p-4 dark:border-amber-500/20 dark:bg-amber-950/20">
          <p className="text-[11px] uppercase tracking-wider text-amber-900/80 dark:text-amber-200/80 flex items-center gap-2">
            <ClipboardList className="h-3.5 w-3.5" />
            Candidatures
          </p>
          <p className="mt-1 text-2xl font-bold text-foreground dark:text-white tabular-nums">
            {loadingApplications ? "…" : applications.length}
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-200/90 bg-emerald-50 p-4 dark:border-emerald-500/20 dark:bg-emerald-950/20">
          <p className="text-[11px] uppercase tracking-wider text-emerald-900/80 dark:text-emerald-200/80 flex items-center gap-2">
            <Hammer className="h-3.5 w-3.5" />
            Projets actifs
          </p>
          <p className="mt-1 text-2xl font-bold text-foreground dark:text-white tabular-nums">
            {loadingMemberProjects ? "…" : memberProjects.length}
          </p>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        {/* Projets disponibles */}
        <section className="rounded-3xl border border-border/60 bg-card shadow-bmp-sm overflow-hidden dark:border-white/10 dark:bg-white/[0.03] dark:shadow-none">
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border/60 dark:border-white/10">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-amber-700 dark:text-amber-300" />
              <h2 className="text-sm font-semibold text-foreground dark:text-white">
                Projets disponibles
              </h2>
            </div>
            {loadingOpenProjects && (
              <span className="text-[11px] text-foreground dark:text-gray-500 inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Chargement
              </span>
            )}
          </div>

          {loadingOpenProjects ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-24 rounded-2xl border border-border/60 bg-muted/50 animate-pulse dark:border-white/10 dark:bg-black/20"
                />
              ))}
            </div>
          ) : openProjects.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground dark:text-gray-400">
              Aucun projet ouvert pour le moment. Revenez plus tard pour voir
              les nouvelles opportunités.
            </div>
          ) : (
            <div className="p-5 space-y-4 max-h-[540px] overflow-y-auto pr-2 scrollbar-bmp">
              {openProjects.map((project) => (
                <article
                  key={project._id}
                  className="rounded-2xl border border-border/60 bg-muted/40 p-4 hover:border-brand/35 transition dark:border-white/10 dark:bg-black/20 dark:hover:border-amber-500/25"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground dark:text-white line-clamp-1">
                        {project.titre}
                      </p>
                      <p className="text-[11px] text-foreground dark:text-gray-500 mt-0.5 line-clamp-1">
                        {project.clientNom
                          ? `Client : ${project.clientNom}`
                          : "Projet client BMP.tn"}
                      </p>
                    </div>
                    <span className="shrink-0 inline-flex items-center rounded-full bg-blue-100 text-blue-800 border border-blue-200 px-2.5 py-1 text-[11px] font-medium dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/20">
                      {project.statut}
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-muted-foreground dark:text-gray-400 line-clamp-2">
                    {project.description}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-foreground dark:text-gray-500">
                    <span>
                      Budget estimé :{" "}
                      <span className="text-foreground dark:text-gray-200">
                        {Number(project.budget_estime ?? 0).toLocaleString(
                          "fr-FR"
                        )}{" "}
                        TND
                      </span>
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {project.date_debut
                        ? new Date(project.date_debut).toLocaleDateString(
                            "fr-FR",
                          )
                        : "-"}{" "}
                      →{" "}
                      {project.date_fin_prevue
                        ? new Date(project.date_fin_prevue).toLocaleDateString(
                            "fr-FR",
                          )
                        : "-"}
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={actionLoadingId === project._id}
                    onClick={() => handleApply(project._id)}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 px-4 py-2.5 text-xs font-semibold text-gray-900 shadow-md shadow-amber-500/25 hover:shadow-amber-500/40 transition disabled:opacity-60"
                  >
                    {actionLoadingId === project._id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <PlusCircle className="h-4 w-4" />
                    )}
                    Postuler à ce projet
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Candidatures + projets membres */}
        <section className="space-y-6">
          {/* Candidatures */}
          <div className="rounded-3xl border border-border/60 bg-card shadow-bmp-sm overflow-hidden dark:border-white/10 dark:bg-white/[0.03] dark:shadow-none">
            <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border/60 dark:border-white/10">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-amber-700 dark:text-amber-300" />
                <h2 className="text-sm font-semibold text-foreground dark:text-white">
                  Mes candidatures
                </h2>
              </div>
              {loadingApplications && (
                <Loader2 className="h-4 w-4 animate-spin text-amber-400/80" />
              )}
            </div>

            {loadingApplications ? (
              <div className="p-5 space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-12 rounded-2xl border border-border/60 bg-muted/50 animate-pulse dark:border-white/10 dark:bg-black/20"
                  />
                ))}
              </div>
            ) : applications.length === 0 ? (
              <div className="p-6 text-sm text-muted-foreground dark:text-gray-400">
                Aucune candidature pour le moment. Postulez à un projet à gauche
                pour démarrer.
              </div>
            ) : (
              <div className="p-5 space-y-2 max-h-56 overflow-y-auto pr-2 scrollbar-bmp">
                {applications.map((app) => (
                  <div
                    key={app._id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-muted/40 px-4 py-3 text-sm dark:border-white/10 dark:bg-black/20"
                  >
                    <p className="font-medium text-foreground dark:text-white line-clamp-1">
                      {app.projet?.titre ?? "Projet"}
                    </p>
                    <span
                      className={`shrink-0 inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium ${
                        app.statut === "acceptee"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/20"
                          : app.statut === "refusee"
                            ? "bg-red-100 text-red-800 border border-red-200 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/20"
                            : "bg-amber-100 text-amber-900 border border-amber-200 dark:bg-amber-500/15 dark:text-amber-200 dark:border-amber-500/20"
                      }`}
                    >
                      {app.statut === "en_attente"
                        ? "En attente"
                        : app.statut === "acceptee"
                          ? "Acceptée"
                          : "Refusée"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Projets membres */}
          <div className="rounded-3xl border border-border/60 bg-card shadow-bmp-sm overflow-hidden dark:border-white/10 dark:bg-white/[0.03] dark:shadow-none">
            <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border/60 dark:border-white/10">
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-emerald-700 dark:text-emerald-300" />
                <h2 className="text-sm font-semibold text-foreground dark:text-white">
                  Projets dont je suis membre
                </h2>
              </div>
              {loadingMemberProjects && (
                <Loader2 className="h-4 w-4 animate-spin text-emerald-600 dark:text-emerald-300/80" />
              )}
            </div>

            {loadingMemberProjects ? (
              <div className="p-5 space-y-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-28 rounded-2xl border border-border/60 bg-muted/50 animate-pulse dark:border-white/10 dark:bg-black/20"
                  />
                ))}
              </div>
            ) : memberProjects.length === 0 ? (
              <div className="p-6 text-sm text-muted-foreground dark:text-gray-400">
                Dès qu&apos;un expert vous affecte à un projet, il apparaîtra ici
                avec son avancement et le suivi photo.
              </div>
            ) : (
              <div className="p-5 space-y-4 max-h-[680px] overflow-y-auto pr-2 scrollbar-bmp">
                {memberProjects.map((project) => {
                  const clientOid = refId(project.clientId);
                  const expertOid = refId(project.expertId);
                  return (
                    <article
                      key={project._id}
                      className="rounded-2xl border border-emerald-200/90 bg-emerald-50/80 p-4 dark:border-emerald-500/20 dark:bg-emerald-950/15"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground dark:text-white line-clamp-1">
                            {project.titre}
                          </p>
                          <p className="text-[11px] text-muted-foreground dark:text-gray-400 mt-0.5 line-clamp-1">
                            {project.clientNom
                              ? `Client : ${project.clientNom}`
                              : "Client BMP.tn"}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium ${
                            project.statut === "En cours"
                              ? "bg-amber-100 text-amber-900 border border-amber-200 dark:bg-amber-500/15 dark:text-amber-200 dark:border-amber-500/20"
                              : project.statut === "Terminé"
                                ? "bg-emerald-100 text-emerald-900 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-200 dark:border-emerald-500/20"
                                : "bg-muted text-muted-foreground border border-border dark:bg-gray-500/15 dark:text-gray-300 dark:border-gray-500/20"
                          }`}
                        >
                          {project.statut}
                        </span>
                      </div>

                      <p className="mt-2 text-xs text-muted-foreground dark:text-gray-300 line-clamp-2">
                        {project.description}
                      </p>

                      {(clientOid || expertOid) && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {clientOid && (
                            <Link
                              href={`/messages/${clientOid}`}
                              className="inline-flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] font-medium text-amber-900 dark:text-amber-100 hover:bg-amber-500/20"
                            >
                              <MessageCircle className="h-4 w-4" />
                              Contacter le client
                            </Link>
                          )}
                          {expertOid && (
                            <Link
                              href={`/messages/${expertOid}`}
                              className="inline-flex items-center gap-2 rounded-xl border border-sky-500/30 bg-sky-500/10 px-3 py-2 text-[11px] font-medium text-sky-900 hover:bg-sky-500/15 dark:text-sky-100 dark:hover:bg-sky-500/20"
                            >
                              <MessageCircle className="h-4 w-4" />
                              Contacter l&apos;expert
                            </Link>
                          )}
                          <Link
                            href={`/gestion-chantier/${encodeURIComponent(project._id)}`}
                            className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-[11px] font-medium text-emerald-900 hover:bg-emerald-500/15 dark:text-emerald-100 dark:hover:bg-emerald-500/20"
                          >
                            <Camera className="h-4 w-4" />
                            Upload photos chantier
                          </Link>
                        </div>
                      )}

                      <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground dark:text-gray-300">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {project.avancement_global ?? 0}% avancement
                        </span>
                        <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300">
                          <CheckCircle2 className="h-3 w-3" />
                          Actif
                        </span>
                      </div>

                      <div className="mt-3">
                        <SuiviTimeline projectId={project._id} apiBaseUrl={API_URL} />
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>

      {isBusy && (
        <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-500/80" />
          Chargement des données…
        </p>
      )}
    </div>
    </div>
  );
}

