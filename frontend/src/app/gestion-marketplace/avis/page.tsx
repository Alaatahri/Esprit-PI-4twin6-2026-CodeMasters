'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Star, User, Calendar, MessageSquare, 
  Truck, Package, ThumbsUp, ArrowLeft,
  Award, AlertCircle
} from 'lucide-react';
import { marketplaceAPI } from '@/lib/marketplace-api';
import { getStoredUser } from '@/lib/auth';

interface Review {
  _id: string;
  clientId: string;
  vehicleId?: string;
  produitId?: string;
  note: number;
  commentaire: string;
  date_avis: string;
  type: 'produit' | 'livreur' | 'service';
  reponse?: string;
}

export default function AvisPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'service' | 'produit' | 'livreur'>('service');
  const [user, setUser] = useState<any>(null);
  const [newReview, setNewReview] = useState({
    type: 'service' as 'service' | 'produit' | 'livreur',
    note: 5,
    commentaire: '',
    produitId: '',
    vehicleId: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const storedUser = getStoredUser();
    setUser(storedUser);
  }, []);

  useEffect(() => {
    loadReviews();
    loadProducts();
    loadVehicles();
  }, [activeTab]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      let data: Review[] = [];
      data = await marketplaceAPI.getAvisService();
      setReviews(data);
    } catch (error) {
      console.error('Erreur chargement avis:', error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

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

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (!user) {
      setErrorMsg('Veuillez vous connecter pour laisser un avis');
      return;
    }

    if (!newReview.commentaire.trim()) {
      setErrorMsg('Veuillez écrire un commentaire');
      return;
    }

    setSubmitting(true);
    try {
      // ⚠️ Envoyer uniquement les champs requis, PAS de commandeId
      const avisData: any = {
        clientId: user._id,
        note: newReview.note,
        commentaire: newReview.commentaire,
      };
      
      if (newReview.type === 'produit' && newReview.produitId) {
        avisData.produitId = newReview.produitId;
      }
      
      if (newReview.type === 'livreur' && newReview.vehicleId) {
        avisData.vehicleId = newReview.vehicleId;
      }
      
      console.log('Envoi avis (sans commandeId):', avisData);
      await marketplaceAPI.createAvis(avisData);
      
      setNewReview({ 
        type: 'service', 
        note: 5, 
        commentaire: '', 
        produitId: '', 
        vehicleId: '',
      });
      await loadReviews();
      alert('Merci pour votre avis !');
    } catch (error) {
      console.error('Erreur création avis:', error);
      setErrorMsg('Une erreur est survenue. Veuillez réessayer.');
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

  const getAverageRating = (): number => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.note, 0);
    return parseFloat((sum / reviews.length).toFixed(1));
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => {
      distribution[r.note as keyof typeof distribution]++;
    });
    return distribution;
  };

  const averageRating = getAverageRating();
  const distribution = getRatingDistribution();
  const totalReviews = reviews.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/gestion-marketplace" className="inline-flex items-center gap-2 text-gray-400 hover:text-amber-400 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Retour au marketplace
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-400 flex items-center justify-center">
              <Star className="w-6 h-6 text-gray-900" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Avis & notations</h1>
              <p className="text-gray-500">Partagez votre expérience et consultez les avis des autres clients</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-white/10 pb-4">
          {[
            { id: 'service', label: 'Service client', icon: Award },
            { id: 'produit', label: 'Produits', icon: Package },
            { id: 'livreur', label: 'Livreurs', icon: Truck },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-900 font-semibold'
                    : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'
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
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
              <div className="text-6xl font-bold text-amber-400 mb-2">{averageRating}</div>
              <div className="flex justify-center gap-1 mb-2">{renderStars(averageRating, 24)}</div>
              <p className="text-sm text-gray-500">Basé sur {totalReviews} avis</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="font-semibold text-white mb-4">Distribution des notes</h3>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = distribution[star as keyof typeof distribution];
                  const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-3">
                      <div className="flex items-center gap-1 w-12">
                        <span className="text-sm text-gray-400">{star}</span>
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      </div>
                      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full" style={{ width: `${percentage}%` }} />
                      </div>
                      <span className="text-xs text-gray-500 w-10">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Formulaire d'avis */}
            {user && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h3 className="font-semibold text-white mb-4">Donnez votre avis</h3>
                {errorMsg && (
                  <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {errorMsg}
                  </div>
                )}
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Type d'avis</label>
                    <select
                      value={newReview.type}
                      onChange={(e) => setNewReview({ ...newReview, type: e.target.value as any })}
                      className="w-full rounded-xl bg-gray-900/80 border border-white/10 px-4 py-2.5 text-white"
                    >
                      <option value="service">Service client BMP.tn</option>
                      <option value="produit">Un produit spécifique</option>
                      <option value="livreur">Un livreur</option>
                    </select>
                  </div>

                  {newReview.type === 'produit' && (
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Produit</label>
                      <select
                        value={newReview.produitId}
                        onChange={(e) => setNewReview({ ...newReview, produitId: e.target.value })}
                        className="w-full rounded-xl bg-gray-900/80 border border-white/10 px-4 py-2.5 text-white"
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
                      <label className="block text-sm text-gray-400 mb-2">Livreur</label>
                      <select
                        value={newReview.vehicleId}
                        onChange={(e) => setNewReview({ ...newReview, vehicleId: e.target.value })}
                        className="w-full rounded-xl bg-gray-900/80 border border-white/10 px-4 py-2.5 text-white"
                      >
                        <option value="">Sélectionnez un livreur</option>
                        {vehicles.map(v => (
                          <option key={v._id} value={v._id}>{v.nom} - {v.type}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Note</label>
                    <div className="flex items-center gap-1">
                      {renderStars(newReview.note, 28, true, (note) => setNewReview({ ...newReview, note }))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Votre commentaire</label>
                    <textarea
                      value={newReview.commentaire}
                      onChange={(e) => setNewReview({ ...newReview, commentaire: e.target.value })}
                      placeholder="Partagez votre expérience..."
                      className="w-full rounded-xl bg-gray-900/80 border border-white/10 px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-500/50"
                      rows={4}
                      required
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
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-amber-400" />
                Derniers avis
              </h3>

              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 rounded-full border-2 border-amber-500/50 border-t-amber-400 animate-spin" />
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500">Aucun avis pour le moment</p>
                  <p className="text-gray-600 text-sm mt-1">Soyez le premier à donner votre avis !</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {reviews.map((review, idx) => (
                    <motion.div
                      key={review._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-4 rounded-xl bg-white/5 border border-white/10"
                    >
                      <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                            <User className="w-5 h-5 text-amber-400" />
                          </div>
                          <div>
                            <p className="font-medium text-white">Client</p>
                            <div className="flex items-center gap-1">{renderStars(review.note, 14)}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          {new Date(review.date_avis).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm mt-2">{review.commentaire}</p>
                      <div className="mt-3 flex items-center gap-2">
                        <ThumbsUp className="w-3 h-3 text-gray-500" />
                        <span className="text-xs text-gray-500">Utile</span>
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