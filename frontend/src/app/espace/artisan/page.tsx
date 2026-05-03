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
        <div className="mx-auto w-fit rounded-3xl border border-border bg-gradient-to-br from-amber-500/12 to-muted p-5 shadow-bmp-md dark:border-amber-500/20 dark:from-amber-950/40 dark:to-gray-950/80 dark:shadow-2xl dark:shadow-black/50">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-500/35 bg-amber-500/15">
            <Briefcase className="h-7 w-7 text-brand dark:text-amber-300" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Espace artisan</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Connectez-vous pour voir les projets ouverts, postuler et suivre vos
            missions.
          </p>
          <button
            onClick={() => router.push("/login")}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bmp-btn-primary px-6 py-3 text-sm font-semibold text-gray-900 transition"
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
        <h1 className="text-2xl font-bold text-foreground">
          Espace réservé aux artisans
        </h1>
        <p className="text-muted-foreground text-sm">
          Vous êtes connecté en tant que{" "}
          <span className="font-semibold text-brand dark:text-amber-300">{user.role}</span>.
          Cet écran est dédié aux artisans.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-8 sm:py-10 space-y-8">
      {/* Header / hero */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-amber-500/[0.08] via-muted to-background p-6 sm:p-8 dark:from-amber-950/30 dark:via-gray-950/70 dark:to-gray-950">
        <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-2xl bg-amber-500/15 border border-amber-500/35 flex items-center justify-center shrink-0">
              <Briefcase className="h-6 w-6 text-brand dark:text-amber-300" />
            </div>
            <div className="space-y-1">
              <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand dark:text-amber-300/80">
                <Sparkles className="h-3.5 w-3.5" />
                Espace artisan
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
                Vos missions, candidatures et suivi chantier
              </h1>
              <p className="text-sm text-muted-foreground max-w-2xl">
                Postulez aux projets disponibles, suivez vos projets assignés et
                échangez avec le client / l’expert.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 sm:items-center">
            <Link
              href="/gestion-chantier"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-3 text-sm font-medium text-emerald-950 hover:bg-emerald-500/20 dark:text-emerald-100"
            >
              <LayoutDashboard className="h-4 w-4 shrink-0" />
              Gestion chantier
            </Link>
            <Link
              href="/messages"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-muted px-5 py-3 text-sm font-medium text-body-secondary transition hover:border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-950 dark:bg-black/30 dark:hover:text-amber-100"
            >
              <MessageCircle className="h-4 w-4 shrink-0" />
              Messages
            </Link>
            <Link
              href="/espace/artisan/profil"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bmp-btn-primary px-5 py-3 text-sm font-semibold text-gray-900 transition"
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
        <div className="space-y-1 rounded-2xl border border-amber-500/25 bg-amber-500/10 px-5 py-4 text-sm text-amber-950 dark:bg-amber-950/25 dark:text-amber-100/95">
          <p className="font-medium text-amber-900 dark:text-amber-200">
            Problème de chargement (vérifiez que le backend tourne sur le port
            attendu par le proxy Next).
          </p>
          {loadErrors.open && (
            <p className="text-xs text-amber-900/85 dark:text-amber-100/80">
              <span className="text-brand dark:text-amber-300/90">Projets ouverts :</span>{" "}
              {loadErrors.open}
            </p>
          )}
          {loadErrors.applications && (
            <p className="text-xs text-amber-900/85 dark:text-amber-100/80">
              <span className="text-brand dark:text-amber-300/90">Candidatures :</span>{" "}
              {loadErrors.applications}
            </p>
          )}
          {loadErrors.members && (
            <p className="text-xs text-amber-900/85 dark:text-amber-100/80">
              <span className="text-brand dark:text-amber-300/90">Projets membres :</span>{" "}
              {loadErrors.members}
            </p>
          )}
        </div>
      )}

      {/* Quick stats */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-sky-500/25 bg-sky-500/10 p-4 dark:border-sky-500/20 dark:bg-sky-950/20">
          <p className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-sky-900 dark:text-sky-200/80">
            <Briefcase className="h-3.5 w-3.5" />
            Projets disponibles
          </p>
          <p className="mt-1 text-2xl font-bold text-foreground tabular-nums">
            {loadingOpenProjects ? "…" : openProjects.length}
          </p>
        </div>
        <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4 dark:border-amber-500/20 dark:bg-amber-950/20">
          <p className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-amber-900 dark:text-amber-200/80">
            <ClipboardList className="h-3.5 w-3.5" />
            Candidatures
          </p>
          <p className="mt-1 text-2xl font-bold text-foreground tabular-nums">
            {loadingApplications ? "…" : applications.length}
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-4 dark:border-emerald-500/20 dark:bg-emerald-950/20">
          <p className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-emerald-900 dark:text-emerald-200/80">
            <Hammer className="h-3.5 w-3.5" />
            Projets actifs
          </p>
          <p className="mt-1 text-2xl font-bold text-foreground tabular-nums">
            {loadingMemberProjects ? "…" : memberProjects.length}
          </p>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        {/* Projets disponibles */}
        <section className="rounded-3xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-brand dark:text-amber-300" />
              <h2 className="text-sm font-semibold text-foreground">
                Projets disponibles
              </h2>
            </div>
            {loadingOpenProjects && (
              <span className="text-[11px] text-muted-foreground inline-flex items-center gap-2">
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
                  className="h-24 rounded-2xl border border-border bg-muted dark:bg-black/20 animate-pulse"
                />
              ))}
            </div>
          ) : openProjects.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">
              Aucun projet ouvert pour le moment. Revenez plus tard pour voir
              les nouvelles opportunités.
            </div>
          ) : (
            <div className="p-5 space-y-4 max-h-[540px] overflow-y-auto pr-2 scrollbar-bmp">
              {openProjects.map((project) => (
                <article
                  key={project._id}
                  className="rounded-2xl border border-border bg-muted dark:bg-black/20 p-4 hover:border-amber-500/25 transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground line-clamp-1">
                        {project.titre}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                        {project.clientNom
                          ? `Client : ${project.clientNom}`
                          : "Projet client BMP.tn"}
                      </p>
                    </div>
                    <span className="inline-flex shrink-0 items-center rounded-full border border-blue-500/20 bg-blue-500/15 px-2.5 py-1 text-[11px] font-medium text-blue-800 dark:text-blue-300">
                      {project.statut}
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                    {project.description}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
                    <span>
                      Budget estimé :{" "}
                      <span className="text-body-secondary">
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
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bmp-btn-primary px-4 py-2.5 text-xs font-semibold text-gray-900 transition disabled:opacity-60"
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
          <div className="rounded-3xl border border-border bg-card overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-brand dark:text-amber-300" />
                <h2 className="text-sm font-semibold text-foreground">
                  Mes candidatures
                </h2>
              </div>
              {loadingApplications && (
                <Loader2 className="h-4 w-4 animate-spin text-brand dark:text-amber-400/80" />
              )}
            </div>

            {loadingApplications ? (
              <div className="p-5 space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-12 rounded-2xl border border-border bg-muted dark:bg-black/20 animate-pulse"
                  />
                ))}
              </div>
            ) : applications.length === 0 ? (
              <div className="p-6 text-sm text-muted-foreground">
                Aucune candidature pour le moment. Postulez à un projet à gauche
                pour démarrer.
              </div>
            ) : (
              <div className="p-5 space-y-2 max-h-56 overflow-y-auto pr-2 scrollbar-bmp">
                {applications.map((app) => (
                  <div
                    key={app._id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-muted dark:bg-black/20 px-4 py-3 text-sm"
                  >
                    <p className="font-medium text-foreground line-clamp-1">
                      {app.projet?.titre ?? "Projet"}
                    </p>
                    <span
                      className={`shrink-0 inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium ${
                        app.statut === "acceptee"
                          ? "border border-emerald-500/20 bg-emerald-500/15 text-emerald-800 dark:text-emerald-300"
                          : app.statut === "refusee"
                            ? "border border-red-500/20 bg-red-500/15 text-red-800 dark:text-red-300"
                            : "border border-amber-500/20 bg-amber-500/15 text-amber-900 dark:text-amber-200"
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
          <div className="rounded-3xl border border-border bg-card overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-emerald-800 dark:text-emerald-300" />
                <h2 className="text-sm font-semibold text-foreground">
                  Projets dont je suis membre
                </h2>
              </div>
              {loadingMemberProjects && (
                <Loader2 className="h-4 w-4 animate-spin text-emerald-800 dark:text-emerald-300/80" />
              )}
            </div>

            {loadingMemberProjects ? (
              <div className="p-5 space-y-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-28 rounded-2xl border border-border bg-muted dark:bg-black/20 animate-pulse"
                  />
                ))}
              </div>
            ) : memberProjects.length === 0 ? (
              <div className="p-6 text-sm text-muted-foreground">
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
                      className="rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.06] p-4 dark:border-emerald-500/20 dark:bg-emerald-950/15"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground line-clamp-1">
                            {project.titre}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                            {project.clientNom
                              ? `Client : ${project.clientNom}`
                              : "Client BMP.tn"}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium ${
                            project.statut === "En cours"
                              ? "border border-amber-500/20 bg-amber-500/15 text-amber-900 dark:text-amber-200"
                              : project.statut === "Terminé"
                                ? "border border-emerald-500/20 bg-emerald-500/15 text-emerald-900 dark:text-emerald-200"
                                : "border border-gray-500/20 bg-gray-500/15 text-body-secondary"
                          }`}
                        >
                          {project.statut}
                        </span>
                      </div>

                      <p className="mt-2 text-xs text-body-secondary line-clamp-2">
                        {project.description}
                      </p>

                      {(clientOid || expertOid) && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {clientOid && (
                            <Link
                              href={`/messages/${clientOid}`}
                              className="inline-flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] font-medium text-amber-950 hover:bg-amber-500/20 dark:text-amber-100"
                            >
                              <MessageCircle className="h-4 w-4" />
                              Contacter le client
                            </Link>
                          )}
                          {expertOid && (
                            <Link
                              href={`/messages/${expertOid}`}
                              className="inline-flex items-center gap-2 rounded-xl border border-sky-500/30 bg-sky-500/10 px-3 py-2 text-[11px] font-medium text-sky-900 hover:bg-sky-500/20 dark:text-sky-100"
                            >
                              <MessageCircle className="h-4 w-4" />
                              Contacter l&apos;expert
                            </Link>
                          )}
                          <Link
                            href={`/gestion-chantier/${encodeURIComponent(project._id)}`}
                            className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-[11px] font-medium text-emerald-950 hover:bg-emerald-500/20 dark:text-emerald-100"
                          >
                            <Camera className="h-4 w-4" />
                            Upload photos chantier
                          </Link>
                        </div>
                      )}

                      <div className="mt-3 flex items-center justify-between text-[11px] text-body-secondary">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {project.avancement_global ?? 0}% avancement
                        </span>
                        <span className="inline-flex items-center gap-1 text-emerald-800 dark:text-emerald-300">
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
        <p className="flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-500/80" />
          Chargement des données…
        </p>
      )}
    </div>
    </div>
  );
}

