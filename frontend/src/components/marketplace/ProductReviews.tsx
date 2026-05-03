'use client';

import { useState, useEffect } from 'react';
import { Star, User, Calendar, MessageSquare } from 'lucide-react';
import { marketplaceAPI } from '@/lib/marketplace-api';

interface Review {
  _id: string;
  clientId: string;
  note: number;
  commentaire: string;
  date_avis: string;
}

interface ProductReviewsProps {
  productId: string;
}

// Génère un ID MongoDB valide (24 caractères hexadécimaux)
function generateMongoId(): string {
  const timestamp = Math.floor(Date.now() / 1000).toString(16);
  const random = Math.random().toString(16).substring(2, 18);
  return (timestamp + random).substring(0, 24);
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [newReview, setNewReview] = useState({ note: 5, commentaire: '' });
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Récupérer l'utilisateur connecté
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Erreur parsing user:', e);
      }
    }
    loadReviews();
  }, [productId]);

  const loadReviews = async () => {
    try {
      const data = await marketplaceAPI.getAvisByProduit(productId);
      setReviews(data);
      if (data.length > 0) {
        const avg = data.reduce((sum, r) => sum + r.note, 0) / data.length;
        setAverageRating(avg);
      }
    } catch (error) {
      console.error('Erreur chargement avis:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Veuillez vous connecter pour laisser un avis');
      return;
    }
    
    if (!newReview.commentaire.trim()) {
      alert('Veuillez écrire un commentaire');
      return;
    }

    setSubmitting(true);
    try {
      // Générer un ID MongoDB valide pour la commande temporaire
      const tempCommandeId = generateMongoId();
      
      await marketplaceAPI.createAvis({
        commandeId: tempCommandeId,
        clientId: user._id || user.id,
        produitId: productId,
        note: newReview.note,
        commentaire: newReview.commentaire,
      });
      setNewReview({ note: 5, commentaire: '' });
      await loadReviews();
      alert('Merci pour votre avis !');
    } catch (error) {
      console.error('Erreur création avis:', error);
      alert('Une erreur est survenue');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number, size: number = 16, interactive: boolean = false, onStarClick?: (star: number) => void) => {
    const stars = [];
    let starSizeClass = 'w-4 h-4';
    if (size === 24) starSizeClass = 'w-6 h-6';
    else if (size === 20) starSizeClass = 'w-5 h-5';
    else if (size === 16) starSizeClass = 'w-4 h-4';
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

  if (loading) {
    return <div className="text-center py-8 text-gray-400">Chargement des avis...</div>;
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Avis clients</h3>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-1">{renderStars(Math.round(averageRating), 20)}</div>
            <span className="text-white font-bold">{averageRating.toFixed(1)}</span>
            <span className="text-gray-500">({reviews.length} avis)</span>
          </div>
        </div>
      </div>

      {/* Formulaire d'avis */}
      {user && (
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <h4 className="font-medium text-white mb-3">Donnez votre avis</h4>
          <form onSubmit={handleSubmitReview} className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Note :</span>
              <div className="flex items-center gap-1">
                {renderStars(newReview.note, 24, true, (note) => setNewReview({ ...newReview, note }))}
              </div>
            </div>
            <textarea
              value={newReview.commentaire}
              onChange={(e) => setNewReview({ ...newReview, commentaire: e.target.value })}
              placeholder="Partagez votre expérience avec ce produit..."
              className="w-full p-3 rounded-xl bg-gray-900/50 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-500/50"
              rows={3}
            />
            <button
              type="submit"
              disabled={submitting || !newReview.commentaire.trim()}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-900 font-semibold disabled:opacity-50 hover:shadow-lg transition-all"
            >
              {submitting ? 'Envoi...' : 'Publier mon avis'}
            </button>
          </form>
        </div>
      )}

      {/* Liste des avis */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Soyez le premier à donner votre avis !</div>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className="p-4 rounded-xl bg-white/5">
              <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <User className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Client</p>
                    <div className="flex items-center gap-1">{renderStars(review.note, 12)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Calendar className="w-3 h-3" />
                  {new Date(review.date_avis).toLocaleDateString('fr-FR')}
                </div>
              </div>
              <p className="text-sm text-gray-300 mt-2">{review.commentaire}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}