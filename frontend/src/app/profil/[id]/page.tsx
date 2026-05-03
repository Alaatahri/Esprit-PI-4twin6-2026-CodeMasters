"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Star,
  Briefcase,
  CheckCircle2,
  Clock,
  MessageSquare,
  Loader2,
  Shield,
  Hammer,
  MapPin,
  Phone,
  UserCircle,
} from "lucide-react";
import {
  profileImageUrl,
  workerDisplayName,
  type PublicWorker,
} from "@/lib/public-workers";
import { getApiBaseUrl } from "@/lib/api-base";

const API_URL = getApiBaseUrl();

type ProfilePayload = {
  user: PublicWorker & { _id: string };
  stats: { projectCount: number; completedCount: number };
  projects: Array<{
    _id: string;
    titre: string;
    description?: string;
    statut: string;
    avancement_global?: number;
    date_debut?: string;
    date_fin_prevue?: string;
    clientRating?: number;
    clientComment?: string;
    expertRating?: number;
    artisanRating?: number;
  }>;
  reviews: Array<{
    projetId: string;
    projetTitre: string;
    note?: number;
    commentaire?: string;
    kind: "client" | "artisan" | "expert";
  }>;
};

function Stars({ value }: { value: number }) {
  const v = Math.min(5, Math.max(0, Math.round(value)));
  return (
    <div className="flex items-center gap-0.5" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={
            i < v
              ? "w-4 h-4 text-amber-400 fill-amber-400"
              : "w-4 h-4 text-foreground/15"
          }
        />
      ))}
    </div>
  );
}

function zoneLabel(z: { scope: string; value?: string }): string {
  if (z.scope === "tn_all") return "Toute la Tunisie";
  if (z.scope === "tn_city" && z.value) return z.value;
  if (z.scope === "country" && z.value) return z.value;
  if (z.scope === "world") return "International";
  return z.value || "";
}

export default function ProfilPublicPage() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";
  const [data, setData] = useState<ProfilePayload | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await fetch(`${API_URL}/users/public/${id}/profile`, {
          cache: "no-store",
        });
        if (!res.ok) {
          setErr("Profil introuvable.");
          setData(null);
          return;
        }
        const json = (await res.json()) as ProfilePayload;
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) setErr("Impossible de charger le profil.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const reviewsByProject = useMemo(() => {
    if (!data?.reviews?.length) return new Map<string, ProfilePayload["reviews"]>();
    const m = new Map<string, ProfilePayload["reviews"]>();
    for (const r of data.reviews) {
      const list = m.get(r.projetId) ?? [];
      list.push(r);
      m.set(r.projetId, list);
    }
    return m;
  }, [data?.reviews]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="h-10 w-10 animate-spin text-amber-400/80" />
        <p className="text-sm">Chargement du profil…</p>
      </div>
    );
  }

  if (err || !data?.user) {
    return (
      <div className="max-w-lg mx-auto text-center space-y-4 py-16">
        <p className="text-foreground font-medium">{err || "Profil introuvable."}</p>
        <Link
          href="/espace"
          className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à l&apos;accueil
        </Link>
      </div>
    );
  }

  const u = data.user;
  const name = workerDisplayName(u);
  const roleLabel = u.role === "expert" ? "Expert technique" : "Artisan";
  const rating =
    typeof u.rating === "number" && u.rating > 0 ? u.rating : null;
  const years = u.experienceYears ?? u.experience_annees ?? null;
  const photo = profileImageUrl(u);
  const zones = (u.zones_travail || []).map(zoneLabel).filter(Boolean);

  return (
    <div className="mx-auto max-w-3xl space-y-12 pb-20">
      <Link
        href="/espace"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-amber-300"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à l&apos;accueil BMP.tn
      </Link>

      {/* En-tête profil */}
      <header className="overflow-hidden rounded-3xl border border-border bg-gradient-to-b from-white/[0.07] to-transparent">
        <div className="flex flex-col gap-8 p-6 sm:flex-row sm:items-start sm:gap-10 sm:p-10">
          <div className="relative mx-auto h-44 w-44 shrink-0 overflow-hidden rounded-2xl border border-border bg-gray-900 shadow-xl sm:mx-0 sm:h-52 sm:w-52">
            <Image
              src={photo}
              alt={name}
              fill
              unoptimized
              className="object-cover"
              sizes="208px"
              priority
            />
          </div>
          <div className="min-w-0 flex-1 space-y-4 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                  u.role === "expert"
                    ? "bg-sky-500/20 text-sky-200"
                    : "bg-amber-500/20 text-amber-200"
                }`}
              >
                {u.role === "expert" ? (
                  <Shield className="h-3.5 w-3.5" />
                ) : (
                  <Hammer className="h-3.5 w-3.5" />
                )}
                {roleLabel}
              </span>
              {u.isAvailable === false && (
                <span className="text-xs text-muted-foreground">
                  Indisponible pour de nouveaux dossiers
                </span>
              )}
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {name}
            </h1>
            {u.role === "artisan" && u.specialite && (
              <p className="text-lg text-amber-200/95">{u.specialite}</p>
            )}
            {u.role === "expert" &&
              Array.isArray(u.competences) &&
              u.competences.length > 0 && (
                <ul className="flex flex-wrap justify-center gap-2 sm:justify-start">
                  {u.competences.map((c) => (
                    <li
                      key={c}
                      className="rounded-lg border border-border bg-muted px-2.5 py-1 text-xs text-body-secondary"
                    >
                      {c}
                    </li>
                  ))}
                </ul>
              )}
            {u.bio && (
              <div className="rounded-2xl border border-border bg-muted dark:bg-black/25 p-4 text-left">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Présentation
                </p>
                <p className="mt-2 text-sm leading-relaxed text-body-secondary">
                  {u.bio}
                </p>
              </div>
            )}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground sm:justify-start">
              {rating != null && (
                <span className="inline-flex items-center gap-2">
                  <Stars value={rating} />
                  <span className="tabular-nums font-medium text-foreground">
                    {rating.toFixed(1)} / 5
                  </span>
                  <span className="text-gray-600">(profil)</span>
                </span>
              )}
              {years != null && (
                <span className="inline-flex items-center gap-1.5">
                  <UserCircle className="h-4 w-4 text-muted-foreground" />
                  {years} ans d&apos;expérience
                </span>
              )}
              {u.telephone && (
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  {u.telephone}
                </span>
              )}
            </div>
            {zones.length > 0 && u.role === "artisan" && (
              <p className="flex flex-wrap items-center justify-center gap-1.5 text-xs text-muted-foreground sm:justify-start">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-amber-500/70" />
                {zones.join(" · ")}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-px border-t border-border bg-muted">
          <div className="bg-background/80 px-3 py-4 text-center sm:px-4">
            <Briefcase className="mx-auto mb-1 h-4 w-4 text-amber-400/90" />
            <p className="text-2xl font-bold tabular-nums text-foreground">
              {data.stats.projectCount}
            </p>
            <p className="text-[11px] text-muted-foreground">Projets liés</p>
          </div>
          <div className="bg-background/80 px-3 py-4 text-center sm:px-4">
            <CheckCircle2 className="mx-auto mb-1 h-4 w-4 text-emerald-400/90" />
            <p className="text-2xl font-bold tabular-nums text-emerald-300">
              {data.stats.completedCount}
            </p>
            <p className="text-[11px] text-muted-foreground">Terminés</p>
          </div>
          <div className="bg-background/80 px-3 py-4 text-center sm:px-4">
            <MessageSquare className="mx-auto mb-1 h-4 w-4 text-sky-400/90" />
            <p className="text-2xl font-bold tabular-nums text-foreground">
              {data.reviews.length}
            </p>
            <p className="text-[11px] text-muted-foreground">Retours & notes</p>
          </div>
        </div>
      </header>

      {/* Projets */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Chantiers & dossiers
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Historique des projets auxquels ce membre est associé sur BMP.tn.
          </p>
        </div>
        {data.projects.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border bg-muted/60 px-4 py-8 text-center text-sm text-muted-foreground">
            Aucun projet enregistré pour l&apos;instant.
          </p>
        ) : (
          <ul className="space-y-3">
            {data.projects.map((p) => (
              <li
                key={String(p._id)}
                className="rounded-2xl border border-border bg-card p-5 transition hover:border-border"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <p className="font-semibold text-foreground">{p.titre}</p>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                      p.statut === "Terminé"
                        ? "bg-emerald-500/15 text-emerald-300"
                        : p.statut === "En cours"
                          ? "bg-sky-500/15 text-sky-300"
                          : "bg-gray-600/30 text-body-secondary"
                    }`}
                  >
                    {p.statut}
                  </span>
                </div>
                {p.description && (
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {p.description}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {p.date_debut
                      ? new Date(p.date_debut).toLocaleDateString("fr-FR")
                      : "—"}{" "}
                    →{" "}
                    {p.date_fin_prevue
                      ? new Date(p.date_fin_prevue).toLocaleDateString("fr-FR")
                      : "—"}
                  </span>
                  <span className="text-amber-400/90">
                    Avancement {p.avancement_global ?? 0}%
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Avis regroupés par projet */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Avis clients & notes projet
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Commentaires et notes enregistrés sur les projets (selon le rôle :
            avis global, note expert ou note artisan).
          </p>
        </div>
        {data.reviews.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border bg-muted/60 px-4 py-8 text-center text-sm text-muted-foreground">
            Pas encore d&apos;avis publié sur ces projets.
          </p>
        ) : (
          <div className="space-y-6">
            {data.projects.map((p) => {
              const pid = String(p._id);
              const revs = reviewsByProject.get(pid);
              if (!revs?.length) return null;
              return (
                <div
                  key={pid}
                  className="rounded-2xl border border-border bg-muted dark:bg-black/30 p-5"
                >
                  <p className="text-sm font-semibold text-amber-200/95">
                    {p.titre}
                  </p>
                  <ul className="mt-4 space-y-4">
                    {revs.map((r, idx) => (
                      <li
                        key={`${r.kind}-${idx}`}
                        className="border-t border-border pt-4 first:border-t-0 first:pt-0"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                            {r.kind === "client"
                              ? "Avis client"
                              : r.kind === "expert"
                                ? "Note sur l’expert (projet)"
                                : "Note sur l’artisan (projet)"}
                          </span>
                          {typeof r.note === "number" && (
                            <Stars value={r.note} />
                          )}
                        </div>
                        {r.commentaire && (
                          <p className="mt-2 text-sm italic leading-relaxed text-body-secondary">
                            &ldquo;{r.commentaire}&rdquo;
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
