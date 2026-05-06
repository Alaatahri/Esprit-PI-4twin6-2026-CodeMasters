"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getStoredUser, type BMPUser } from "@/lib/auth";
import { SuiviTimeline } from "@/components/SuiviTimeline";
import {
  Users,
  Star,
  ClipboardList,
  CheckCircle2,
  Clock,
  XCircle,
  Sparkles,
  ArrowRight,
  LayoutGrid,
  Inbox,
  Loader2,
  UserCircle,
} from "lucide-react";
import { getApiBaseUrl } from "@/lib/api-base";
import { mongoIdString, refId } from "@/lib/project-refs";
import { readJsonSafe } from "@/lib/read-json-safe";

const API_URL = getApiBaseUrl();

type ArtisanApplication = {
  _id: string;
  artisan?: {
    _id: string;
    nom: string;
    ratingMoyen?: number;
    competences?: string[];
  };
  artisanId?:
    | string
    | {
        _id?: string;
        nom?: string;
        email?: string;
        ratingMoyen?: number;
        competences?: string[];
      };
  statut: "en_attente" | "acceptee" | "refusee";
  createdAt?: string;
};

type ExpertProject = {
  _id: string;
  titre: string;
  description: string;
  budget_estime: number;
  statut: string;
  clientNom?: string;
  /** Injecté par l’API expert pour filtrer par client sans ambiguïté */
  clientKeyForExpertUi?: string;
  clientId?: string | { _id?: string; prenom?: string; nom?: string; email?: string };
  date_debut?: string;
  date_fin_prevue?: string;
  avancement_global?: number;
  requestStatus?: string;
  applications?: ArtisanApplication[];
};

type ExpertClientRow = {
  id: string;
  label: string;
  projectCount: number;
};

function clientKeyFromProject(p: ExpertProject): string {
  const fromApi = p.clientKeyForExpertUi?.trim();
  if (fromApi) return fromApi.toLowerCase();
  return mongoIdString(p.clientId).toLowerCase();
}

function clientDisplayName(p: ExpertProject): string {
  if (p.clientNom?.trim()) return p.clientNom.trim();
  const c = p.clientId;
  if (c && typeof c === "object") {
    const n = [c.prenom, c.nom].filter(Boolean).join(" ").trim();
    return n || (c.email ?? "").trim() || "Client";
  }
  return "Client";
}

/** Recrutement artisan : désactivé une fois le dossier engagé (contrat / exécution). */
function projectAllowsArtisanRecruitment(p: ExpertProject): boolean {
  if (p.statut === "Terminé") return false;
  const rs = p.requestStatus;
  if (
    rs &&
    [
      "contract_pending_signatures",
      "active",
      "completed",
      "cancelled",
      "rejected",
    ].includes(rs)
  ) {
    return false;
  }
  return true;
}

export default function ExpertSpacePage() {
  const router = useRouter();
  const [user, setUser] = useState<BMPUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<ExpertProject[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  /** Une fois qu’un premier client a été choisi automatiquement, ne pas le refaire. */
  const initialClientSelectionDoneRef = useRef(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    const stored = getStoredUser();
    setUser(stored);
    setLoadingUser(false);
  }, []);

  useEffect(() => {
    if (!user || user.role !== "expert") return;

    const fetchProjectsForExpert = async () => {
      setLoadingProjects(true);
      setError(null);
      try {
        const res = await fetch(
          `${API_URL}/projects/expert/${encodeURIComponent(user._id)}`,
          { cache: "no-store" },
        );
        if (!res.ok) {
          setError("Unable to load your projects.");
          return;
        }
        const data = (await res.json()) as ExpertProject[];
        const filtered = data
          .filter((p) =>
            ["En attente", "En cours", "Terminé", "Ouvert"].includes(p.statut),
          )
          .map((p) => ({
            ...p,
            clientNom: p.clientNom?.trim()
              ? p.clientNom
              : clientDisplayName(p),
            applications: p.applications ?? [],
          }));
        setProjects(filtered);
      } catch {
        setError("Unable to load your projects.");
      } finally {
        setLoadingProjects(false);
      }
    };

    fetchProjectsForExpert();
  }, [user]);

  const handleApplicationAction = async (
    applicationId: string,
    action: "accept" | "decline"
  ) => {
    const u = getStoredUser();
    if (!u || u.role !== "expert") {
      setActionError("Expert session required.");
      return;
    }
    setActionError(null);
    setActionLoadingId(applicationId);
    try {
      const endpoint =
        action === "accept"
          ? `${API_URL}/applications/${applicationId}/accept`
          : `${API_URL}/applications/${applicationId}/decline`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "x-user-id": u._id },
      });
      const data = await readJsonSafe<{
        message?: string | string[];
      }>(res);
      if (!res.ok) {
        const raw = data?.message;
        const msg = Array.isArray(raw)
          ? raw.join(" ")
          : typeof raw === "string"
            ? raw
            : "Unable to update the application.";
        throw new Error(msg);
      }
      setProjects((prev) =>
        prev.map((project) => ({
          ...project,
          applications: project.applications?.map((app) =>
            app._id === applicationId
              ? {
                  ...app,
                  statut: action === "accept" ? "acceptee" : "refusee",
                }
              : app
          ) ?? [],
        }))
      );
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Error while updating the application."
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const resolveArtisanForApplication = (app: ArtisanApplication) => {
    if (app.artisan) {
      return app.artisan;
    }

    const aid = app.artisanId;
    if (aid && typeof aid === "object") {
      const id =
        typeof aid._id === "string"
          ? aid._id
          : aid._id != null
            ? String(aid._id)
            : "";
      const nom = aid.nom?.trim();
      if (nom || id) {
        return {
          _id: id,
          nom: nom || "Contractor",
          ratingMoyen: aid.ratingMoyen,
          competences: aid.competences,
        };
      }
    }

    const rawArtisanId =
      typeof app.artisanId === "string"
        ? app.artisanId
        : app.artisanId &&
            typeof app.artisanId === "object" &&
            app.artisanId._id != null
          ? String(app.artisanId._id)
          : "";

    return rawArtisanId
      ? { _id: rawArtisanId, nom: "Contractor" }
      : undefined;
  };

  /** Id utilisateur artisan pour la page publique /profil/[id] */
  const artisanProfileId = (app: ArtisanApplication): string => {
    const resolved = resolveArtisanForApplication(app);
    const fromResolved =
      resolved && "_id" in resolved && typeof resolved._id === "string"
        ? resolved._id
        : "";
    const fromEmbedded =
      typeof app.artisan?._id === "string" ? app.artisan._id : "";
    return (
      String(fromResolved || fromEmbedded || "").trim() ||
      refId(app.artisanId)
    );
  };

  const expertClients = useMemo((): ExpertClientRow[] => {
    const m = new Map<string, ExpertClientRow>();
    for (const p of projects) {
      const id = clientKeyFromProject(p);
      if (!id) continue;
      const label = clientDisplayName(p);
      const prev = m.get(id);
      if (prev) prev.projectCount += 1;
      else m.set(id, { id, label, projectCount: 1 });
    }
    return Array.from(m.values()).sort((a, b) =>
      a.label.localeCompare(b.label, "fr"),
    );
  }, [projects]);

  const filteredProjects = useMemo(() => {
    if (!selectedClientId) return projects;
    return projects.filter((p) => clientKeyFromProject(p) === selectedClientId);
  }, [projects, selectedClientId]);

  /** Par défaut : premier client (sinon selectedClientId reste null → tous les projets / toutes les candidatures). */
  useLayoutEffect(() => {
    if (loadingProjects || initialClientSelectionDoneRef.current) return;
    if (expertClients.length === 0) return;
    initialClientSelectionDoneRef.current = true;
    setSelectedClientId(expertClients[0].id);
  }, [loadingProjects, expertClients]);

  useEffect(() => {
    if (!selectedClientId || loadingProjects) return;
    const valid = projects.some(
      (p) => clientKeyFromProject(p) === selectedClientId,
    );
    if (!valid && expertClients.length > 0) {
      setSelectedClientId(expertClients[0].id);
    }
  }, [projects, expertClients, selectedClientId, loadingProjects]);

  const pendingApplicationsCount = useMemo(() => {
    return filteredProjects.reduce((acc, p) => {
      const n = (p.applications ?? []).filter((a) => a.statut === "en_attente").length;
      return acc + n;
    }, 0);
  }, [filteredProjects]);

  if (!loadingUser && !user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-14 text-center space-y-6">
        <div className="mx-auto w-fit rounded-3xl border border-border/60 bg-card p-6 shadow-bmp-md dark:border-amber-500/20 dark:bg-gradient-to-br dark:from-amber-950/40 dark:to-gray-950/80 dark:shadow-2xl dark:shadow-black/50">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/15 border border-amber-500/35">
            <Users className="h-7 w-7 text-amber-700 dark:text-amber-300" />
          </div>
          <h1 className="text-2xl font-bold text-foreground dark:text-white">Expert workspace</h1>
          <p className="mt-2 text-sm text-muted-foreground dark:text-gray-400">
            Sign in to manage contractors, applications, and client projects.
          </p>
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 px-6 py-3 text-sm font-semibold text-gray-900 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition"
          >
            Go to sign in
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  if (!loadingUser && user && user.role !== "expert") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center space-y-4">
        <h1 className="text-2xl font-bold text-foreground dark:text-white">
          Experts only
        </h1>
        <p className="text-muted-foreground dark:text-gray-400 text-sm">
          You are signed in as{" "}
          <span className="font-semibold text-amber-700 dark:text-amber-300">
            {user.role}
          </span>
          . This page is for experts.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground dark:bg-gradient-to-b dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 dark:text-white">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-8 sm:py-10 space-y-8">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card shadow-bmp-md dark:border-white/10 dark:bg-gradient-to-br dark:from-amber-950/30 dark:via-gray-950/70 dark:to-gray-950 dark:shadow-none p-6 sm:p-8">
          <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-amber-500/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-sky-500/10 blur-3xl" />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-2xl bg-amber-500/15 border border-amber-500/35 flex items-center justify-center shrink-0">
                <Users className="h-6 w-6 text-amber-700 dark:text-amber-300" />
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-800/90 dark:text-amber-300/80 inline-flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5" />
                  Expert workspace
                </p>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground dark:text-white leading-tight">
                  Clients, projets & candidatures
                </h1>
                <p className="text-sm text-muted-foreground dark:text-gray-400 max-w-2xl">
                  Uniquement vos dossiers assignés : choisissez un client pour filtrer ses projets et traiter les candidatures artisans.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <Link
                href="/expert/nouveaux-projets"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-amber-500/35 bg-amber-500/10 px-4 py-2.5 text-sm font-medium text-amber-900 dark:text-amber-100 hover:bg-amber-500/20 transition"
              >
                <Inbox className="h-4 w-4 shrink-0" />
                Invitations
              </Link>
              <Link
                href="/expert/tous-les-projets"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border/60 bg-muted/40 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted/60 hover:border-brand/30 transition dark:border-white/15 dark:bg-black/30 dark:text-gray-200 dark:hover:bg-white/10"
              >
                <LayoutGrid className="h-4 w-4 shrink-0" />
                All projects
              </Link>
              <Link
                href="/expert/projets"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border/60 bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:border-brand/30 hover:bg-muted/30 transition dark:border-white/15 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10"
              >
                My projects
              </Link>
              <Link
                href="/messages"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-lg shadow-amber-500/20 hover:opacity-95 transition"
              >
                Messages
              </Link>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-800 dark:text-red-200">
            {error}
          </div>
        )}
        {actionError && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-800 dark:text-red-200">
            {actionError}
          </div>
        )}

        {/* Stats */}
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-amber-200/90 bg-amber-50 p-4 dark:border-amber-500/20 dark:bg-amber-950/20">
            <p className="text-[11px] uppercase tracking-wider text-amber-900/80 dark:text-amber-200/70 flex items-center gap-2">
              <Users className="h-3.5 w-3.5" />
              Clients (dossiers assignés)
            </p>
            <p className="mt-1 text-2xl font-bold text-foreground dark:text-white tabular-nums">
              {loadingProjects ? "…" : expertClients.length}
            </p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-bmp-sm dark:border-white/10 dark:bg-white/[0.03] dark:shadow-none">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground dark:text-gray-500 flex items-center gap-2">
              <ClipboardList className="h-3.5 w-3.5 text-brand dark:text-amber-400/80" />
              Projets affichés
            </p>
            <p className="mt-1 text-2xl font-bold text-foreground dark:text-white tabular-nums">
              {loadingProjects
                ? "…"
                : selectedClientId
                  ? filteredProjects.length
                  : projects.length}
            </p>
          </div>
          <div className="rounded-2xl border border-sky-200/90 bg-sky-50 p-4 dark:border-sky-500/20 dark:bg-sky-950/20">
            <p className="text-[11px] uppercase tracking-wider text-sky-900/80 dark:text-sky-200/70 flex items-center gap-2">
              <Clock className="h-3.5 w-3.5" />
              Pending applications
            </p>
            <p className="mt-1 text-2xl font-bold text-foreground dark:text-white tabular-nums">
              {loadingProjects ? "…" : pendingApplicationsCount}
            </p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground dark:text-gray-500 max-w-3xl">
          Les artisans postulent depuis leur espace. Pour chaque projet où vous êtes l&apos;expert référent,
          vous pouvez accepter ou refuser les candidatures ci‑dessous (contrôle côté serveur).
        </p>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        {/* Clients liés à vos projets assignés */}
        <section className="rounded-3xl border border-border/60 bg-card shadow-bmp-sm overflow-hidden flex flex-col min-h-[320px] dark:border-white/10 dark:bg-white/[0.03] dark:shadow-none">
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border/60 dark:border-white/10">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-700 dark:text-amber-300" />
              <h2 className="text-sm font-semibold text-foreground dark:text-white">
                Mes clients
              </h2>
            </div>
            {loadingProjects && (
              <Loader2 className="w-4 h-4 animate-spin text-amber-400/80" />
            )}
          </div>

          <div className="px-5 pt-4 pb-2">
            <button
              type="button"
              onClick={() => setSelectedClientId(null)}
              className={`w-full rounded-2xl border px-4 py-2.5 text-left text-xs font-medium transition ${
                selectedClientId === null
                  ? "border-amber-500/50 bg-amber-500/15 text-amber-950 dark:text-amber-100"
                  : "border-border/60 bg-muted/30 text-muted-foreground hover:border-brand/30 dark:border-white/10 dark:bg-black/20 dark:text-gray-300"
              }`}
            >
              Tous mes projets assignés
              <span className="block text-[10px] font-normal opacity-80 mt-0.5">
                {projects.length} projet{projects.length === 1 ? "" : "s"}
              </span>
            </button>
          </div>

          {loadingProjects ? (
            <div className="p-5 space-y-3 flex-1">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-24 rounded-2xl border border-border/60 bg-muted/50 animate-pulse dark:border-white/10 dark:bg-black/20"
                />
              ))}
            </div>
          ) : expertClients.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground dark:text-gray-400 flex-1">
              Aucun client pour l&apos;instant : les clients ayant au moins un projet où vous êtes assigné apparaîtront ici.
            </div>
          ) : (
            <div className="space-y-3 max-h-[420px] overflow-y-auto p-5 pt-2 pr-2 scrollbar-bmp">
              {expertClients.map((row) => (
                <button
                  key={row.id}
                  type="button"
                  onClick={() => setSelectedClientId(row.id)}
                  className={`w-full rounded-2xl border px-4 py-4 text-sm text-left space-y-1 transition dark:border-white/10 dark:bg-black/20 ${
                    selectedClientId === row.id
                      ? "border-amber-500/45 bg-amber-500/10 ring-1 ring-amber-500/25"
                      : "border-border/60 bg-muted/40 hover:border-brand/35 dark:hover:border-amber-500/25"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-foreground dark:text-white line-clamp-1">
                      {row.label}
                    </p>
                    <span className="text-[11px] tabular-nums text-muted-foreground dark:text-gray-400 shrink-0">
                      {row.projectCount} projet{row.projectCount === 1 ? "" : "s"}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground dark:text-gray-500">
                    Cliquez pour n&apos;afficher que les projets de ce client.
                  </p>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Colonne projets & candidatures */}
        <section className="rounded-3xl border border-border/60 bg-card shadow-bmp-sm overflow-hidden flex flex-col min-h-[360px] dark:border-white/10 dark:bg-white/[0.03] dark:shadow-none">
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border/60 dark:border-white/10">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-amber-700 dark:text-amber-300" />
              <h2 className="text-sm font-semibold text-foreground dark:text-white">
                Projets & candidatures
              </h2>
            </div>
            {loadingProjects && (
              <Loader2 className="w-4 h-4 animate-spin text-amber-400/80" />
            )}
          </div>

          {loadingProjects ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-32 rounded-2xl border border-border/60 bg-muted/50 animate-pulse dark:border-white/10 dark:bg-black/20"
                />
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground dark:text-gray-400">
              {projects.length === 0
                ? "Aucun projet assigné pour le moment."
                : selectedClientId
                  ? "Aucun projet pour ce client avec les filtres actuels."
                  : "Aucun projet à afficher."}
            </div>
          ) : (
            <div className="space-y-4 max-h-[560px] overflow-y-auto p-5 pr-2 scrollbar-bmp">
              {filteredProjects.map((project) => (
                <div
                  key={project._id}
                  className="rounded-2xl border border-border/60 bg-muted/40 px-4 py-4 text-sm space-y-3 hover:border-brand/30 transition dark:border-white/10 dark:bg-black/20 dark:hover:border-amber-500/20"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground dark:text-white line-clamp-1">
                        {project.titre}
                      </p>
                      <p className="text-[11px] text-muted-foreground dark:text-gray-400 line-clamp-1">
                        {project.clientNom
                          ? `Client: ${project.clientNom}`
                          : "Client project"}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-medium ${
                        project.statut === "Ouvert"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300"
                          : project.statut === "En cours"
                          ? "bg-amber-100 text-amber-900 dark:bg-amber-500/15 dark:text-amber-300"
                          : "bg-muted text-muted-foreground dark:bg-gray-500/15 dark:text-gray-300"
                      }`}
                    >
                      {project.statut}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground dark:text-gray-400 line-clamp-2">
                    {project.description}
                  </p>

                  <div className="flex flex-col sm:flex-row flex-wrap gap-2">
                    <Link
                      href={`/expert/projects/${encodeURIComponent(project._id)}?from=projets`}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500/90 to-yellow-500/80 px-3 py-2 text-xs font-semibold text-gray-950 hover:opacity-95 transition"
                    >
                      Project dossier
                    </Link>
                    <Link
                      href={`/expert/projects/${encodeURIComponent(project._id)}/photos?from=projets`}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-800 hover:bg-emerald-500/15 transition dark:text-emerald-200 dark:hover:bg-emerald-500/20"
                    >
                      Before / after gallery
                    </Link>
                    <Link
                      href={`/expert/projects/${encodeURIComponent(project._id)}/suivi-photo?from=projets`}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-800 dark:text-amber-200 hover:bg-amber-500/20 transition"
                    >
                      Site photo log
                    </Link>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground dark:text-gray-400">
                    <span>
                      Estimated budget:{" "}
                      <span className="text-foreground dark:text-gray-200">
                        {project.budget_estime.toLocaleString("fr-FR", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}{" "}
                        TND
                      </span>
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {project.date_debut
                        ? new Date(project.date_debut).toLocaleDateString()
                        : "-"}
                      {" → "}
                      {project.date_fin_prevue
                        ? new Date(
                            project.date_fin_prevue
                          ).toLocaleDateString()
                        : "-"}
                    </span>
                  </div>

                  <SuiviTimeline projectId={project._id} apiBaseUrl={API_URL} />

                  <div className="pt-2 border-t border-border/60 dark:border-white/5 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] font-semibold text-foreground dark:text-gray-200">
                        Contractor applications
                      </p>
                      <p className="text-[11px] text-muted-foreground dark:text-gray-500">
                        {(project.applications ?? []).length}{" "}
                        {(project.applications ?? []).length === 1
                          ? "application"
                          : "applications"}
                      </p>
                    </div>

                    {(project.applications ?? []).length === 0 ? (
                      <p className="text-[11px] text-muted-foreground dark:text-gray-500">
                        No contractor has applied to this project yet.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {(project.applications ?? []).map((app) => {
                          const resolvedArtisan =
                            resolveArtisanForApplication(app);
                          const artisanName =
                            resolvedArtisan?.nom || "Unknown contractor";
                          const artisanRating =
                            typeof resolvedArtisan?.ratingMoyen === "number"
                              ? resolvedArtisan.ratingMoyen
                              : typeof app.artisan?.ratingMoyen === "number"
                              ? app.artisan.ratingMoyen
                              : undefined;
                          const artisanCompetences =
                            resolvedArtisan?.competences ||
                            app.artisan?.competences ||
                            [];

                          const profileId = artisanProfileId(app);

                          return (
                            <div
                              key={app._id}
                              className="rounded-xl border border-border/60 bg-card px-3 py-3 text-[11px] space-y-2 dark:border-white/10 dark:bg-black/30"
                            >
                              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                <div className="space-y-0.5 min-w-0">
                                  <p className="font-medium text-foreground dark:text-white">
                                    {artisanName}
                                  </p>
                                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-muted-foreground dark:text-gray-400">
                                    {typeof artisanRating === "number" ? (
                                      <span className="inline-flex items-center gap-1">
                                        <Star className="w-3 h-3 text-amber-700 dark:text-amber-300 fill-amber-300" />
                                        {artisanRating.toFixed(1)}
                                      </span>
                                    ) : null}
                                    {artisanCompetences.length > 0 && (
                                      <span className="line-clamp-2">
                                        {artisanCompetences.join(", ")}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <span
                                  className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium w-fit ${
                                    app.statut === "acceptee"
                                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300"
                                      : app.statut === "refusee"
                                        ? "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300"
                                        : "bg-amber-100 text-amber-900 dark:bg-amber-500/15 dark:text-amber-300"
                                  }`}
                                >
                                  {app.statut === "en_attente"
                                    ? "Pending"
                                    : app.statut === "acceptee"
                                      ? "Accepted"
                                      : "Declined"}
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                                {profileId ? (
                                  <Link
                                    href={`/profil/${encodeURIComponent(profileId)}`}
                                    className="inline-flex items-center gap-1.5 rounded-xl border border-sky-500/35 bg-sky-500/10 px-3 py-1.5 text-[11px] font-medium text-sky-900 hover:bg-sky-500/15 transition dark:text-sky-100 dark:hover:bg-sky-500/20"
                                  >
                                    <UserCircle className="w-3.5 h-3.5" />
                                    View profile
                                  </Link>
                                ) : null}
                                {app.statut === "en_attente" &&
                                  projectAllowsArtisanRecruitment(project) && (
                                  <>
                                    <button
                                      type="button"
                                      disabled={actionLoadingId === app._id}
                                      onClick={() =>
                                        handleApplicationAction(
                                          app._id,
                                          "accept"
                                        )
                                      }
                                      className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-1.5 text-[11px] font-semibold text-gray-950 hover:opacity-95 disabled:opacity-60"
                                    >
                                      {actionLoadingId === app._id ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                      ) : (
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                      )}
                                      Accept contractor
                                    </button>
                                    <button
                                      type="button"
                                      disabled={actionLoadingId === app._id}
                                      onClick={() =>
                                        handleApplicationAction(
                                          app._id,
                                          "decline"
                                        )
                                      }
                                      className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-[11px] font-medium text-red-800 hover:bg-red-500/15 disabled:opacity-60 dark:text-red-200 dark:hover:bg-red-500/20"
                                    >
                                      <XCircle className="w-3.5 h-3.5" />
                                      Decline
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
        </div>
      </div>
    </div>
  );
}

