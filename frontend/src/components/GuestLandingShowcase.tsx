"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Star,
  MapPin,
  Clock,
  Quote,
  Award,
  ShieldCheck,
  Sparkles,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SafeImageFill } from "@/components/SafeImageFill";
import {
  fetchPublicWorkers,
  fetchShowcaseProjects,
  profileImageUrl,
  workerDisplayName,
  showcaseCoverImage,
  FALLBACK_SHOWCASE_IMAGE,
  avatarUrlForWorker,
  filterWorkingImageUrls,
  type PublicWorker,
  type ShowcaseProjectApi,
} from "@/lib/public-workers";

function Stars({ value }: { value: number }) {
  const v = Math.min(5, Math.max(0, Math.round(value)));
  return (
    <div className="flex items-center gap-0.5" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={
            i < v
              ? "w-3.5 h-3.5 text-amber-400 fill-amber-400"
              : "w-3.5 h-3.5 text-muted-foreground/35"
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

/** Nombre d’éléments visibles avant « Voir tout » */
const PREVIEW_COUNT = 6;

function showcasePhotoCount(p: ShowcaseProjectApi): number {
  const av = filterWorkingImageUrls(p.photosAvant?.filter(Boolean));
  const ap = filterWorkingImageUrls(p.photosApres?.filter(Boolean));
  return av.length + ap.length;
}

/** Intervalle de rafraîchissement automatique (ms) */
const AUTO_REFRESH_MS = 45_000;

export function GuestLandingShowcase() {
  const [workers, setWorkers] = useState<PublicWorker[]>([]);
  const [projects, setProjects] = useState<ShowcaseProjectApi[]>([]);
  const [dataState, setDataState] = useState<"loading" | "error" | "ready">(
    "loading",
  );
  const [retryCount, setRetryCount] = useState(0);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [showAllArtisans, setShowAllArtisans] = useState(false);
  const [showAllExperts, setShowAllExperts] = useState(false);

  const loadData = useCallback(async () => {
    setDataState("loading");
    setErrorDetail(null);
    try {
      const [w, p] = await Promise.all([
        fetchPublicWorkers(),
        fetchShowcaseProjects(),
      ]);
      setWorkers(Array.isArray(w) ? w : []);
      setProjects(Array.isArray(p) ? p : []);
      setDataState("ready");
    } catch (e) {
      setDataState("error");
      setErrorDetail(
        e instanceof Error ? e.message : "Erreur de chargement",
      );
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [retryCount, loadData]);

  /** Rafraîchissement automatique en arrière-plan (sans indicateur visuel) */
  useEffect(() => {
    if (dataState !== "ready") return;
    const id = window.setInterval(async () => {
      try {
        const [w, p] = await Promise.all([
          fetchPublicWorkers(),
          fetchShowcaseProjects(),
        ]);
        setWorkers(Array.isArray(w) ? w : []);
        setProjects(Array.isArray(p) ? p : []);
      } catch {
        /* conserve les données affichées */
      }
    }, AUTO_REFRESH_MS);
    return () => window.clearInterval(id);
  }, [dataState]);

  const artisansAll = useMemo(
    () => workers.filter((u) => u.role === "artisan"),
    [workers],
  );
  const expertsAll = useMemo(
    () => workers.filter((u) => u.role === "expert"),
    [workers],
  );

  const projectsVisible = showAllProjects
    ? projects
    : projects.slice(0, PREVIEW_COUNT);
  const artisansVisible = showAllArtisans
    ? artisansAll
    : artisansAll.slice(0, PREVIEW_COUNT);
  const expertsVisible = showAllExperts
    ? expertsAll
    : expertsAll.slice(0, PREVIEW_COUNT);

  if (dataState === "loading") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
        <Loader2 className="h-10 w-10 animate-spin text-amber-400/80" />
        <p className="text-sm">Chargement des profils et projets…</p>
      </div>
    );
  }

  if (dataState === "error") {
    return (
      <div className="mx-auto max-w-lg space-y-4 rounded-2xl border border-brand/35 bg-brand/10 px-6 py-10 text-center">
        <p className="font-medium text-foreground dark:text-amber-100">
          Impossible de joindre l&apos;API BMP.tn
        </p>
        {errorDetail && (
          <p className="break-words rounded-lg bg-muted p-3 text-left font-mono text-xs leading-relaxed text-body-secondary">
            {errorDetail}
          </p>
        )}
        <p className="text-sm leading-relaxed text-muted-foreground">
          1) Terminal 1 — backend :{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-brand dark:text-amber-200/90">
            cd backend
          </code>{" "}
          puis{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-brand dark:text-amber-200/90">
            npm run start:dev
          </code>
          <br />
          2) MongoDB doit tourner (variable{" "}
          <code className="rounded bg-muted px-1 font-mono">MONGODB_URI</code> dans{" "}
          <code className="rounded bg-muted px-1 font-mono">backend/.env</code> si
          besoin).
          <br />
          3) Si le backend est sur une autre adresse, créez{" "}
          <code className="rounded bg-muted px-1 font-mono">
            frontend/.env.local
          </code>{" "}
          avec :{" "}
          <code className="mt-2 block break-all rounded bg-muted px-2 py-1.5 text-left font-mono text-brand dark:text-amber-200/90">
            BACKEND_ORIGIN=http://localhost:3001
          </code>
        </p>
        <button
          type="button"
          onClick={() => setRetryCount((n) => n + 1)}
          className="inline-flex items-center justify-center rounded-xl bmp-btn-primary px-6 py-2.5 text-sm font-semibold text-gray-900"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-16 sm:space-y-20 lg:space-y-28 w-full min-w-0">
      {/* Réalisations (projets terminés réels) */}
      <section className="space-y-6 sm:space-y-8 min-w-0">
        <div className="text-center max-w-2xl mx-auto space-y-2 sm:space-y-3 px-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400/90">
            Réalisations
          </p>
          <h2 className="text-xl font-bold leading-tight text-foreground sm:text-2xl md:text-3xl">
            Projets terminés sur BMP.tn
          </h2>
          <p className="text-sm text-muted-foreground">
            Extraits de la base — avis clients lorsqu&apos;ils sont renseignés.
          </p>
        </div>

        {projects.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">
            Aucun projet terminé à afficher pour le moment.
          </p>
        ) : (
          <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
            {projectsVisible.map((p, i) => (
              <motion.article
                key={String(p._id)}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                className="group overflow-hidden rounded-2xl border border-border bg-card shadow-bmp-sm backdrop-blur-sm transition-colors hover:border-brand/35 hover:shadow-bmp-md"
              >
                <Link
                  href={`/realisations/${p._id}`}
                  className="block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                <div className="relative aspect-[16/11] overflow-hidden">
                  <SafeImageFill
                    src={showcaseCoverImage(p, i)}
                    fallbackSrc={FALLBACK_SHOWCASE_IMAGE}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/55 via-transparent to-transparent dark:from-background/80" />
                  <span className="absolute left-3 top-3 inline-flex items-center rounded-full border border-border bg-background/90 px-2.5 py-0.5 text-[10px] font-medium text-brand backdrop-blur-md dark:border-white/15 dark:bg-foreground/55 dark:text-amber-200">
                    {p.statut || "Terminé"}
                  </span>
                  {showcasePhotoCount(p) > 0 && (
                    <span className="absolute bottom-3 right-3 inline-flex items-center rounded-full border border-border bg-background/90 px-2.5 py-1 text-[10px] font-medium text-foreground backdrop-blur-md dark:border-white/15 dark:bg-foreground/55 dark:text-white/95">
                      {showcasePhotoCount(p)} photos · avant / après
                    </span>
                  )}
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
                      {p.titre}
                    </h3>
                    {typeof p.clientRating === "number" && (
                      <Stars value={p.clientRating} />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {p.description || "—"}
                  </p>
                  {p.clientComment && (
                    <p className="line-clamp-3 border-t border-border pt-2 text-[11px] italic text-body-secondary">
                      &ldquo;{p.clientComment}&rdquo;
                    </p>
                  )}
                  <div className="flex items-center justify-between border-t border-border pt-1 text-[10px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {p.updatedAt
                        ? new Date(p.updatedAt).toLocaleDateString("fr-FR")
                        : "—"}
                    </span>
                    <span className="text-emerald-400/80">
                      {p.avancement_global ?? 100}% terminé
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-300/90 font-medium pt-1">
                    Voir les photos avant / après →
                  </p>
                </div>
                </Link>
              </motion.article>
            ))}
          </div>
          {projects.length > PREVIEW_COUNT && (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={() => setShowAllProjects((v) => !v)}
                className="inline-flex min-h-[44px] w-full max-w-md items-center justify-center gap-2 rounded-2xl border border-brand/40 bg-brand/10 px-6 py-2.5 text-sm font-medium text-brand transition hover:bg-brand/18 dark:text-amber-100 dark:hover:bg-amber-500/20 sm:w-auto"
              >
                {showAllProjects ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Afficher moins
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    Voir tout les projets ({projects.length - PREVIEW_COUNT}{" "}
                    de plus)
                  </>
                )}
              </button>
            </div>
          )}
          </>
        )}
      </section>

      {/* Artisans */}
      <section className="relative min-w-0 overflow-hidden rounded-2xl border border-border bg-muted/70 shadow-bmp-sm dark:border-amber-500/25 dark:bg-gradient-to-br dark:from-amber-950/40 dark:via-gray-950/80 dark:to-gray-950 sm:rounded-3xl">
        <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 -translate-y-1/2 translate-x-1/2 rounded-full bg-brand/10 blur-3xl dark:bg-amber-500/10" />
        <div className="relative px-4 py-8 sm:px-8 sm:py-12 lg:px-12 space-y-6 sm:space-y-8">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400/90 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              Artisans
            </p>
            <h2 className="text-xl font-bold leading-tight text-foreground sm:text-2xl md:text-3xl">
              Équipes sur la plateforme
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl">
              Profils réels — cliquez pour voir l&apos;historique et les avis
              liés aux projets.
            </p>
          </div>

          {artisansAll.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun artisan inscrit pour le moment.</p>
          ) : (
            <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {artisansVisible.map((a, i) => {
                const href = `/profil/${a._id}`;
                const zones = (a.zones_travail || [])
                  .map(zoneLabel)
                  .filter(Boolean)
                  .slice(0, 2)
                  .join(" · ");
                const r =
                  typeof a.rating === "number" && a.rating > 0
                    ? a.rating
                    : null;
                return (
                  <motion.div
                    key={a._id}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <Link
                      href={href}
                      className="flex h-full flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-bmp-xs transition hover:border-brand/35 hover:shadow-bmp-sm dark:border-white/10 dark:bg-muted dark:bg-black/30 dark:hover:bg-muted dark:bg-black/40"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bmp-media-frame ring-2 ring-brand/25">
                          <SafeImageFill
                            src={profileImageUrl(a)}
                            fallbackSrc={avatarUrlForWorker(a)}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {workerDisplayName(a)}
                          </p>
                          <p className="truncate text-[11px] text-brand dark:text-amber-200/80">
                            {a.specialite || "Artisan"}
                          </p>
                          {a.bio && (
                            <p className="text-[10px] text-muted-foreground line-clamp-2 mt-1 leading-snug">
                              {a.bio}
                            </p>
                          )}
                          {zones && (
                            <p className="text-[10px] text-muted-foreground flex items-center gap-1 truncate">
                              <MapPin className="w-3 h-3 shrink-0" />
                              {zones}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        {r != null ? (
                          <Stars value={Math.round(r)} />
                        ) : (
                          <span className="text-muted-foreground">Note —</span>
                        )}
                        <span className="text-amber-400/90 text-[10px] font-medium">
                          Voir le profil →
                        </span>
                      </div>
                      <span className="inline-flex w-fit items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-300 border border-amber-500/25">
                        <Award className="w-3 h-3" />
                        Membre vérifié
                      </span>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
            {artisansAll.length > PREVIEW_COUNT && (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => setShowAllArtisans((v) => !v)}
                  className="inline-flex min-h-[44px] w-full max-w-md items-center justify-center gap-2 rounded-2xl border border-border bg-muted px-6 py-2.5 text-sm font-medium text-brand transition hover:bg-accent dark:border-amber-500/40 dark:bg-muted dark:bg-black/20 dark:text-amber-200 dark:hover:bg-muted dark:bg-black/35 sm:w-auto"
                >
                  {showAllArtisans ? (
                    <>
                      <ChevronUp className="h-4 w-4" />
                      Afficher moins
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" />
                      Voir tous les artisans (
                      {artisansAll.length - PREVIEW_COUNT} de plus)
                    </>
                  )}
                </button>
              </div>
            )}
            </>
          )}
        </div>
      </section>

      {/* Experts */}
      <section className="space-y-6 sm:space-y-8 min-w-0 px-0">
        <div className="text-center max-w-2xl mx-auto space-y-2 sm:space-y-3 px-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-400/90 flex items-center justify-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            Experts
          </p>
          <h2 className="text-xl font-bold leading-tight text-foreground sm:text-2xl md:text-3xl">
            Experts inscrits
          </h2>
          <p className="text-sm text-muted-foreground">
            Compétences et notes issues du profil — détail des projets sur la
            fiche.
          </p>
        </div>

        {expertsAll.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">
            Aucun expert inscrit pour le moment.
          </p>
        ) : (
          <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {expertsVisible.map((ex, i) => {
              const href = `/profil/${ex._id}`;
              const comps = (ex.competences || []).slice(0, 5);
              const r =
                typeof ex.rating === "number" && ex.rating > 0
                  ? ex.rating
                  : null;
              return (
                <motion.div
                  key={ex._id}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Link
                    href={href}
                    className="flex h-full flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-bmp-sm transition hover:border-sky-500/40 hover:shadow-bmp-md sm:gap-6 sm:p-6 dark:border-sky-500/20 dark:bg-gradient-to-b dark:from-sky-950/30 dark:to-white/[0.03]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative h-[4.5rem] w-[4.5rem] rounded-2xl overflow-hidden ring-2 ring-sky-500/30 shrink-0">
                        <SafeImageFill
                          src={profileImageUrl(ex)}
                          fallbackSrc={avatarUrlForWorker(ex)}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="72px"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground">
                          {workerDisplayName(ex)}
                        </p>
                        <p className="text-xs text-sky-300/90">
                          Expert BMP.tn
                        </p>
                        {ex.bio && (
                          <p className="text-[10px] text-muted-foreground line-clamp-2 mt-1 leading-snug">
                            {ex.bio}
                          </p>
                        )}
                        <div className="mt-1">
                          {r != null ? (
                            <Stars value={Math.round(r)} />
                          ) : (
                            <span className="text-[11px] text-muted-foreground">
                              Note —
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <ul className="flex flex-wrap gap-1.5 min-h-[2rem]">
                      {comps.map((c) => (
                        <li
                          key={c}
                          className="rounded-md border border-border bg-muted px-2 py-0.5 text-[10px] text-body-secondary dark:border-white/10 dark:bg-white/5"
                        >
                          {c}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-auto flex items-start gap-2 border-t border-border pt-2 text-xs text-sky-700 dark:text-sky-300/90">
                      <Quote className="w-4 h-4 text-sky-500/50 shrink-0" />
                      Cliquez pour l&apos;historique des dossiers et les avis
                      projet.
                    </p>
                  </Link>
                </motion.div>
              );
            })}
          </div>
          {expertsAll.length > PREVIEW_COUNT && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setShowAllExperts((v) => !v)}
                className="inline-flex min-h-[44px] w-full max-w-md items-center justify-center gap-2 rounded-2xl border border-sky-500/35 bg-sky-500/10 px-6 py-2.5 text-sm font-medium text-sky-800 transition hover:bg-sky-500/18 dark:bg-sky-950/30 dark:text-sky-200 dark:hover:bg-sky-950/50 sm:w-auto"
              >
                {showAllExperts ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Afficher moins
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    Voir tous les experts ({expertsAll.length - PREVIEW_COUNT}{" "}
                    de plus)
                  </>
                )}
              </button>
            </div>
          )}
          </>
        )}

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 pt-2 sm:pt-4 max-w-lg mx-auto sm:max-w-none">
          <Link
            href="/inscription"
            className="inline-flex min-h-[44px] items-center justify-center rounded-2xl bmp-btn-primary font-semibold px-8 py-3 text-sm transition-shadow w-full sm:w-auto"
          >
            Créer un compte
          </Link>
          <Link
            href="/login"
            className="inline-flex min-h-[44px] w-full items-center justify-center rounded-2xl border border-border bg-muted px-8 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent sm:w-auto dark:border-white/20 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          >
            J&apos;ai déjà un compte
          </Link>
        </div>
      </section>
    </div>
  );
}
