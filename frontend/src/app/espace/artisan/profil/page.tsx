"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getStoredUser, type BMPUser } from "@/lib/auth";
import {
  Star,
  MapPin,
  Briefcase,
  CheckCircle2,
  MessageCircle,
  ArrowLeft,
  Phone,
  Mail,
} from "lucide-react";
import { getApiBaseUrl } from "@/lib/api-base";

const API_URL = getApiBaseUrl();

type WorkZoneScope = "tn_all" | "tn_city" | "country" | "world";
type WorkZone = { scope: WorkZoneScope; value?: string };

type ArtisanDetails = BMPUser & {
  specialite?: string;
  experience_annees?: number;
  zones_travail?: WorkZone[];
};

type CompletedProject = {
  _id: string;
  titre: string;
  description: string;
  statut: string;
  budget_estime?: number;
  artisanRating?: number;
  clientComment?: string;
  updatedAt?: string;
};

function Stars({ value }: { value: number }) {
  const rounded = Math.round(value * 2) / 2;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => {
        const idx = i + 1;
        const filled = idx <= rounded;
        return (
          <Star
            key={idx}
            className={
              filled
                ? "w-4 h-4 text-amber-400 fill-amber-400 drop-shadow"
                : "w-4 h-4 text-gray-700 fill-gray-800"
            }
          />
        );
      })}
    </div>
  );
}

function formatZone(z: WorkZone): string {
  if (z.scope === "tn_all") return "Toute la Tunisie";
  if (z.scope === "world") return "Partout dans le monde";
  if (z.scope === "tn_city") return z.value ? `Tunisie: ${z.value}` : "Ville (Tunisie)";
  if (z.scope === "country") return z.value ? `Pays: ${z.value}` : "Pays";
  return "Zone";
}

export default function ArtisanProfilPage() {
  const router = useRouter();
  const [user, setUser] = useState<BMPUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [details, setDetails] = useState<ArtisanDetails | null>(null);
  const [completed, setCompleted] = useState<CompletedProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = getStoredUser();
    setUser(stored);
    setLoadingUser(false);
  }, []);

  useEffect(() => {
    if (!user || user.role !== "artisan") return;

    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const [resUser, resCompleted] = await Promise.all([
          fetch(`${API_URL}/users/${user._id}`),
          fetch(`${API_URL}/projects/artisan/${user._id}/completed`),
        ]);

        if (resUser.ok) {
          const u = (await resUser.json()) as ArtisanDetails;
          setDetails(u);
        } else {
          setDetails(user as ArtisanDetails);
        }

        if (resCompleted.ok) {
          const data = (await resCompleted.json()) as CompletedProject[];
          setCompleted(data);
        } else {
          setCompleted([]);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Erreur lors du chargement du profil artisan."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [user]);

  const zones = useMemo(() => {
    const z = (details?.zones_travail || []) as WorkZone[];
    return z.map(formatZone);
  }, [details]);

  const rated = useMemo(() => {
    return completed.filter((p) => typeof p.artisanRating === "number");
  }, [completed]);

  const avgRating = useMemo(() => {
    if (rated.length === 0) return null;
    const sum = rated.reduce((acc, p) => acc + (p.artisanRating || 0), 0);
    return sum / rated.length;
  }, [rated]);

  const feedbacks = useMemo(() => {
    return completed
      .filter((p) => (p.clientComment || "").trim().length > 0)
      .map((p) => ({
        projectId: p._id,
        titre: p.titre,
        artisanRating: p.artisanRating,
        clientComment: p.clientComment || "",
        updatedAt: p.updatedAt,
      }));
  }, [completed]);

  if (!loadingUser && !user) {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Profil artisan</h1>
        <p className="text-muted-foreground text-sm">
          Connectez-vous en tant qu&apos;artisan pour accéder à votre profil,
          vos notes et votre historique.
        </p>
        <button
          onClick={() => router.push("/login")}
          className="px-6 py-3 rounded-xl bmp-btn-primary font-semibold"
        >
          Aller à la connexion
        </button>
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
        </p>
      </div>
    );
  }

  const d = (details || user) as ArtisanDetails | null;

  if (!d) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-10 h-10 rounded-xl border-2 border-amber-500/50 border-t-amber-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/espace/artisan"
            className="inline-flex items-center gap-2 rounded-xl bg-muted border border-border px-4 py-2 text-sm text-body-secondary hover:text-foreground hover:border-amber-500/30 hover:bg-amber-500/10 transition-all"
            title="Retour"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Mon profil artisan</h1>
            <p className="text-xs text-muted-foreground">
              Détails, notes et feedbacks des clients.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/15 px-4 py-3 text-sm text-red-800 dark:text-red-200">
          {error}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        {/* Profil */}
        <section className="space-y-6">
          <div className="rounded-3xl border border-border bg-muted backdrop-blur-xl p-6 sm:p-7">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 flex items-center justify-center border border-amber-500/40">
                <span className="text-xl font-bold text-brand dark:text-amber-300">
                  {d.nom?.charAt(0).toUpperCase() || "A"}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">{d.nom}</h2>
                <p className="text-xs uppercase tracking-[0.2em] text-brand dark:text-amber-300/80">
                  artisan
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-body-secondary">
                <Mail className="h-4 w-4 text-brand dark:text-amber-300" />
                <span className="text-muted-foreground">Email:</span>
                <span className="text-body-secondary">{d.email}</span>
              </div>
              {d.telephone && (
                <div className="flex items-center gap-2 text-body-secondary">
                  <Phone className="h-4 w-4 text-brand dark:text-amber-300" />
                  <span className="text-muted-foreground">Téléphone:</span>
                  <span className="text-body-secondary">{d.telephone}</span>
                </div>
              )}
              {d.specialite && (
                <div className="flex items-center gap-2 text-body-secondary">
                  <Briefcase className="h-4 w-4 text-emerald-800 dark:text-emerald-300" />
                  <span className="text-muted-foreground">Spécialité:</span>
                  <span className="text-body-secondary">{d.specialite}</span>
                </div>
              )}
              {typeof d.experience_annees === "number" && (
                <div className="flex items-center gap-2 text-body-secondary">
                  <CheckCircle2 className="h-4 w-4 text-emerald-800 dark:text-emerald-300" />
                  <span className="text-muted-foreground">Expérience:</span>
                  <span className="text-body-secondary">
                    {d.experience_annees} an{d.experience_annees > 1 ? "s" : ""}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-6 rounded-2xl bg-muted dark:bg-black/30 border border-border p-4 space-y-2">
              <div className="flex items-center gap-2 text-brand dark:text-amber-300">
                <MapPin className="w-4 h-4" />
                <p className="font-medium text-sm">Zones de travail</p>
              </div>
              {zones.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Aucune zone renseignée.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {zones.map((label, idx) => (
                    <span
                      key={`${label}-${idx}`}
                      className="inline-flex items-center rounded-full bg-muted border border-border px-3 py-1 text-[11px] text-body-secondary"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-2xl bg-muted dark:bg-black/30 border border-border p-4 space-y-1">
              <p className="text-xs text-muted-foreground">Projets terminés</p>
              <p className="text-2xl font-semibold text-foreground">{completed.length}</p>
            </div>
            <div className="rounded-2xl bg-muted dark:bg-black/30 border border-border p-4 space-y-1">
              <p className="text-xs text-muted-foreground">Note moyenne</p>
              {avgRating === null ? (
                <p className="text-sm text-muted-foreground">—</p>
              ) : (
                <div className="space-y-1">
                  <p className="text-2xl font-semibold text-foreground">
                    {avgRating.toFixed(1)}
                  </p>
                  <Stars value={avgRating} />
                </div>
              )}
            </div>
            <div className="rounded-2xl bg-muted dark:bg-black/30 border border-border p-4 space-y-1">
              <p className="text-xs text-muted-foreground">Feedbacks</p>
              <p className="text-2xl font-semibold text-foreground">{feedbacks.length}</p>
            </div>
          </div>
        </section>

        {/* Historique + feedbacks */}
        <section className="space-y-6">
          <div className="rounded-3xl border border-border bg-muted backdrop-blur-xl p-6 sm:p-7">
            <div className="mb-4 flex items-center gap-2 text-brand dark:text-amber-300">
              <MessageCircle className="w-5 h-5" />
              <h2 className="text-lg font-semibold text-foreground">
                Avis & feedbacks des clients
              </h2>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-8 h-8 rounded-full border-2 border-amber-500/40 border-t-amber-400 animate-spin" />
              </div>
            ) : feedbacks.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucun feedback pour le moment. Quand un client note un projet
                terminé, il apparaîtra ici.
              </p>
            ) : (
              <div className="space-y-3 max-h-[420px] overflow-auto pr-1">
                {feedbacks.map((f) => (
                  <div
                    key={f.projectId}
                    className="rounded-2xl border border-border bg-muted dark:bg-black/30 px-4 py-4 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-foreground line-clamp-1">
                        {f.titre}
                      </p>
                      {typeof f.artisanRating === "number" ? (
                        <div className="flex items-center gap-2">
                          <Stars value={f.artisanRating} />
                          <span className="text-[11px] text-muted-foreground">
                            {f.artisanRating}/5
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">
                          Pas de note
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-body-secondary whitespace-pre-line">
                      {f.clientComment}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {f.updatedAt
                        ? `Mis à jour: ${new Date(f.updatedAt).toLocaleDateString()}`
                        : ""}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-border bg-muted backdrop-blur-xl p-6 sm:p-7">
            <div className="mb-4 flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="w-5 h-5" />
              <h2 className="text-lg font-semibold text-foreground">
                Projets terminés (historique)
              </h2>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-8 h-8 rounded-full border-2 border-emerald-500/40 border-t-emerald-300 animate-spin" />
              </div>
            ) : completed.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucun projet terminé associé à votre compte pour l’instant.
              </p>
            ) : (
              <div className="space-y-3 max-h-[360px] overflow-auto pr-1">
                {completed.map((p) => (
                  <div
                    key={p._id}
                    className="rounded-2xl border border-emerald-500/25 bg-emerald-500/5 px-4 py-4 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-foreground line-clamp-1">
                        {p.titre}
                      </p>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-medium text-emerald-800 dark:text-emerald-300">
                        Terminé
                      </span>
                    </div>
                    <p className="text-xs text-body-secondary line-clamp-2">
                      {p.description}
                    </p>
                    {typeof p.budget_estime === "number" && (
                      <p className="text-[11px] text-muted-foreground">
                        Budget:{" "}
                        <span className="text-body-secondary">
                          {p.budget_estime.toLocaleString("fr-FR")} TND
                        </span>
                      </p>
                    )}
                    {typeof p.artisanRating === "number" && (
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <Stars value={p.artisanRating} />
                        <span>Note artisan</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

