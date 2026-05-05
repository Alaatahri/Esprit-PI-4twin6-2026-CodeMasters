'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Star, User, Calendar, MessageSquare, Briefcase,
  Truck, Package, ThumbsUp, ArrowLeft,
  Award, AlertCircle
} from 'lucide-react';
import { marketplaceAPI } from '@/lib/marketplace-api';
import { getStoredUser } from '@/lib/auth';
import { getApiBaseUrl } from '@/lib/api-base';

const USERS_API = getApiBaseUrl();

type ReviewTab = 'service' | 'produit' | 'livreur' | 'worker';

interface Review {
  _id: string;
  clientId: string;
  vehicleId?: string;
  produitId?: string;
  workerId?: string;
  note: number;
  commentaire: string;
  date_avis: string;
  type: 'produit' | 'livreur' | 'service' | 'worker';
  reponse?: string;
}

type PublicWorkerRow = { _id: string; nom?: string; role?: string };

/** Rafraîchissement liste avis (évite spinner à chaque poll) */
const AVIS_POLL_MS = 18_000;

export default function AvisPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ReviewTab>('service');
  const [user, setUser] = useState<any>(null);
  const [newReview, setNewReview] = useState({
    type: 'service' as ReviewTab,
    note: 5,
    commentaire: '',
    produitId: '',
    vehicleId: '',
    workerId: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [workers, setWorkers] = useState<PublicWorkerRow[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const storedUser = getStoredUser();
    setUser(storedUser);
  }, []);

  const loadReviews = useCallback(async (opts?: { silent?: boolean }) => {
    const silent = opts?.silent === true;
    if (!silent) setLoading(true);
    try {
      const data = (await marketplaceAPI.getAvisService()) as Review[];
      setReviews(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erreur chargement avis:', error);
      if (!silent) setReviews([]);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadReviews();
    void loadProducts();
    void loadVehicles();
    void loadWorkers();
  }, [loadReviews]);

  useEffect(() => {
    const runSilent = () => {
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;
      void loadReviews({ silent: true });
    };
    const intervalId = window.setInterval(runSilent, AVIS_POLL_MS);
    const onVis = () => {
      if (document.visibilityState === 'visible') runSilent();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [loadReviews]);

  const loadProducts = async () => {
    try {
      const data = await marketplaceAPI.getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Erreur chargement produits:', error);
    }
  };

  const loadVehicles = async () => {
    try {
      const data = await marketplaceAPI.getVehicles();
      setVehicles(data);
    } catch (error) {
      console.error('Erreur chargement véhicules:', error);
    }
  };

  const loadWorkers = async () => {
    try {
      const res = await fetch(`${USERS_API}/users/public/workers`, {
        cache: 'no-store',
      });
      if (!res.ok) return;
      const data = (await res.json()) as unknown;
      setWorkers(Array.isArray(data) ? (data as PublicWorkerRow[]) : []);
    } catch (error) {
      console.error('Erreur chargement professionnels:', error);
    }
  };

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => r.type === activeTab);
  }, [reviews, activeTab]);

  const averageRating = useMemo(() => {
    if (filteredReviews.length === 0) return 0;
    const sum = filteredReviews.reduce((acc, r) => acc + r.note, 0);
    return parseFloat((sum / filteredReviews.length).toFixed(1));
  }, [filteredReviews]);

  const distribution = useMemo(() => {
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    filteredReviews.forEach((r) => {
      const k = r.note as keyof typeof dist;
      if (k >= 1 && k <= 5) dist[k]++;
    });
    return dist;
  }, [filteredReviews]);

  const totalReviews = filteredReviews.length;

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (!user) {
      setErrorMsg('Veuillez vous connecter pour laisser un avis');
      return;
    }

    setSubmitting(true);
    try {
      const avisData: Record<string, unknown> = {
        clientId: user._id,
        note: newReview.note,
        commentaire: newReview.commentaire,
        type: newReview.type,
      };

      if (newReview.type === 'produit' && newReview.produitId) {
        avisData.produitId = newReview.produitId;
      }

      if (newReview.type === 'livreur' && newReview.vehicleId) {
        avisData.vehicleId = newReview.vehicleId;
      }

      if (newReview.type === 'worker' && newReview.workerId) {
        avisData.workerId = newReview.workerId;
      }
      
      console.log('Envoi avis (sans commandeId):', avisData);
      await marketplaceAPI.createAvis(avisData);
      
      setNewReview({
        type: 'service',
        note: 5,
        commentaire: '',
        produitId: '',
        vehicleId: '',
        workerId: '',
      });
      await loadReviews({ silent: true });
      alert('Merci pour votre avis !');
    } catch (error) {
      console.error('Erreur création avis:', error);
      setErrorMsg(
        error instanceof Error
          ? error.message
          : 'Une erreur est survenue. Veuillez réessayer.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number, size: number = 16, interactive: boolean = false, onStarClick?: (star: number) => void) => {
    const stars = [];
    let starSizeClass = 'w-4 h-4';
    if (size === 24) starSizeClass = 'w-6 h-6';
    else if (size === 20) starSizeClass = 'w-5 h-5';
    else if (size === 14) starSizeClass = 'w-3.5 h-3.5';
    else if (size === 12) starSizeClass = 'w-3 h-3';
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => interactive && onStarClick && onStarClick(i)}
          className={interactive ? 'cursor-pointer' : 'cursor-default'}
          disabled={!interactive}
        >
          <Star
            className={`${starSizeClass} ${
              i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'
            } ${interactive ? 'hover:text-yellow-300 transition-colors' : ''}`}
          />
        </button>
      );
    }
    return stars;
  };

  return (
    <div className="min-h-screen bg-background text-foreground dark:bg-gradient-to-b dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 dark:text-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/gestion-marketplace"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-brand mb-4 transition-colors dark:text-gray-400 dark:hover:text-amber-400"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au marketplace
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-400 flex items-center justify-center">
              <Star className="w-6 h-6 text-gray-900" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground dark:text-white">Avis & notations</h1>
              <p className="text-muted-foreground dark:text-gray-500">
                Partagez votre expérience et consultez les avis des autres clients
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-border/60 pb-4 dark:border-white/10">
          {[
            { id: 'service' as const, label: 'Service client', icon: Award },
            { id: 'produit' as const, label: 'Produits', icon: Package },
            { id: 'livreur' as const, label: 'Livreurs', icon: Truck },
            { id: 'worker' as const, label: 'Professionnel', icon: Briefcase },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-900 font-semibold'
                    : 'bg-card/60 border border-border text-muted-foreground hover:text-foreground dark:bg-white/5 dark:border-white/10 dark:text-gray-400 dark:hover:text-foreground dark:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left column - Stats */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card/60 p-6 text-center dark:border-white/10 dark:bg-white/5">
              <div className="text-6xl font-bold text-amber-400 mb-2">{averageRating}</div>
              <div className="flex justify-center gap-1 mb-2">{renderStars(averageRating, 24)}</div>
              <p className="text-sm text-muted-foreground dark:text-gray-500">Basé sur {totalReviews} avis</p>
            </div>

            <div className="rounded-2xl border border-border bg-card/60 p-6 dark:border-white/10 dark:bg-white/5">
              <h3 className="font-semibold text-foreground dark:text-white mb-4">Distribution des notes</h3>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = distribution[star as keyof typeof distribution];
                  const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-3">
                      <div className="flex items-center gap-1 w-12">
                        <span className="text-sm text-muted-foreground dark:text-gray-400">{star}</span>
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      </div>
                      <div className="flex-1 h-2 bg-muted/40 dark:bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full" style={{ width: `${percentage}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground dark:text-gray-500 w-10">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Formulaire d'avis */}
            {user && (
              <div className="rounded-2xl border border-border bg-card/60 p-6 dark:border-white/10 dark:bg-white/5">
                <h3 className="font-semibold text-foreground dark:text-white mb-4">Donnez votre avis</h3>
                {errorMsg && (
                  <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {errorMsg}
                  </div>
                )}
                <form noValidate onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                    <label className="block text-sm text-muted-foreground dark:text-gray-400 mb-2">Type d'avis</label>
                    <select
                      value={newReview.type}
                      onChange={(e) =>
                        setNewReview({
                          ...newReview,
                          type: e.target.value as ReviewTab,
                          produitId: '',
                          vehicleId: '',
                          workerId: '',
                        })
                      }
                      className="w-full rounded-xl bg-background border border-border px-4 py-2.5 text-foreground dark:bg-gray-900/80 dark:border-white/10 dark:text-white"
                    >
                      <option value="service">Service client BMP.tn</option>
                      <option value="produit">Un produit spécifique</option>
                      <option value="livreur">Un livreur</option>
                      <option value="worker">Un artisan / expert</option>
                    </select>
                  </div>

                  {newReview.type === 'produit' && (
                    <div>
                      <label className="block text-sm text-muted-foreground dark:text-gray-400 mb-2">Produit</label>
                      <select
                        value={newReview.produitId}
                        onChange={(e) => setNewReview({ ...newReview, produitId: e.target.value })}
                        className="w-full rounded-xl bg-background border border-border px-4 py-2.5 text-foreground dark:bg-gray-900/80 dark:border-white/10 dark:text-white"
                      >
                        <option value="">Sélectionnez un produit</option>
                        {products.map(p => (
                          <option key={p._id} value={p._id}>{p.nom}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {newReview.type === 'livreur' && (
                    <div>
                      <label className="block text-sm text-muted-foreground dark:text-gray-400 mb-2">Livreur</label>
                      <select
                        value={newReview.vehicleId}
                        onChange={(e) => setNewReview({ ...newReview, vehicleId: e.target.value })}
                        className="w-full rounded-xl bg-background border border-border px-4 py-2.5 text-foreground dark:bg-gray-900/80 dark:border-white/10 dark:text-white"
                      >
                        <option value="">Sélectionnez un livreur</option>
                        {vehicles.map(v => (
                          <option key={v._id} value={v._id}>{v.nom} - {v.type}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {newReview.type === 'worker' && (
                    <div>
                      <label className="block text-sm text-muted-foreground dark:text-gray-400 mb-2">Professionnel</label>
                      <select
                        value={newReview.workerId}
                        onChange={(e) => setNewReview({ ...newReview, workerId: e.target.value })}
                        className="w-full rounded-xl bg-background border border-border px-4 py-2.5 text-foreground dark:bg-gray-900/80 dark:border-white/10 dark:text-white"
                      >
                        <option value="">Sélectionnez un profil</option>
                        {workers.map((w) => (
                          <option key={w._id} value={w._id}>
                            {w.nom || w._id} {w.role ? `(${w.role})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm text-muted-foreground dark:text-gray-400 mb-2">Note</label>
                    <div className="flex items-center gap-1">
                      {renderStars(newReview.note, 28, true, (note) => setNewReview({ ...newReview, note }))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-muted-foreground dark:text-gray-400 mb-2">Votre commentaire</label>
                    <textarea
                      value={newReview.commentaire}
                      onChange={(e) => setNewReview({ ...newReview, commentaire: e.target.value })}
                      placeholder="Partagez votre expérience..."
                      className="w-full rounded-xl bg-background border border-border px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-500/50 dark:bg-gray-900/80 dark:border-white/10 dark:text-white dark:placeholder:text-foreground dark:text-gray-500"
                      rows={4}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-900 font-semibold disabled:opacity-50 hover:shadow-lg transition-all"
                  >
                    {submitting ? 'Envoi...' : 'Publier mon avis'}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Right column - Reviews list */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-border bg-card/60 p-6 dark:border-white/10 dark:bg-white/5">
              <h3 className="font-semibold text-foreground dark:text-white mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-amber-400" />
                Derniers avis
              </h3>

              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 rounded-full border-2 border-amber-500/50 border-t-amber-400 animate-spin" />
                </div>
              ) : filteredReviews.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-muted-foreground dark:text-gray-500">Aucun avis dans cet onglet</p>
                  <p className="text-muted-foreground/80 dark:text-gray-600 text-sm mt-1">
                    Changez d&apos;onglet ou publiez le premier avis de cette catégorie.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {filteredReviews.map((review, idx) => (
                    <motion.div
                      key={review._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-4 rounded-xl bg-muted/30 border border-border dark:bg-white/5 dark:border-white/10"
                    >
                      <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                            <User className="w-5 h-5 text-amber-400" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground dark:text-white">Client</p>
                            <span className="text-[10px] uppercase tracking-wide text-muted-foreground dark:text-gray-500">
                              {review.type === 'service'
                                ? 'Plateforme'
                                : review.type === 'produit'
                                  ? 'Produit'
                                  : review.type === 'livreur'
                                    ? 'Livraison'
                                    : 'Professionnel'}
                            </span>
                            <div className="flex items-center gap-1">{renderStars(review.note, 14)}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground dark:text-gray-500">
                          <Calendar className="w-3 h-3" />
                          {new Date(review.date_avis).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                      <p className="text-muted-foreground dark:text-gray-300 text-sm mt-2">{review.commentaire}</p>
                      <div className="mt-3 flex items-center gap-2">
                        <ThumbsUp className="w-3 h-3 text-muted-foreground dark:text-gray-500" />
                        <span className="text-xs text-muted-foreground dark:text-gray-500">Utile</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}