'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, Plus, Minus, ArrowLeft, CreditCard, MapPin, Clock, ShoppingCart, Package, Truck } from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';
import { getStoredUser } from '@/lib/auth';
import { SafeImg } from '@/components/SafeImg';

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, clearCart, getTotal } = useCartStore();
  const [loading, setLoading] = useState(false);

  const total = getTotal();

  const handleGoToDelivery = () => {
    const user = getStoredUser();
    if (!user) {
      router.push('/login?returnUrl=/gestion-marketplace/panier');
      return;
    }
    
    if (items.length === 0) {
      alert('Votre panier est vide');
      return;
    }
    
    // Rediriger vers la page de sélection des livreurs
    router.push('/gestion-marketplace/livraison');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="w-12 h-12 text-gray-600" />
          </div>
          <h2 className="text-xl font-semibold text-foreground dark:text-white mb-2">Votre panier est vide</h2>
          <p className="text-foreground dark:text-gray-500 mb-6">Découvrez nos produits et ajoutez-les à votre panier</p>
          <Link
            href="/gestion-marketplace"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-900 font-semibold"
          >
            Découvrir les produits
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/gestion-marketplace"
          className="inline-flex items-center gap-2 text-muted-foreground dark:text-gray-400 hover:text-amber-400 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Continuer mes achats
        </Link>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            <h1 className="text-2xl font-bold text-foreground dark:text-white mb-6">Mon panier ({items.length} article{items.length > 1 ? 's' : ''})</h1>
            
            {items.map((item) => (
              <motion.div
                key={item.productId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="flex gap-4 p-4 rounded-2xl border border-border dark:border-white/10 bg-black/5 dark:bg-white/5"
              >
                <div className="w-24 h-24 rounded-xl bg-gray-800/50 flex items-center justify-center overflow-hidden">
                  {item.image_url ? (
                    <SafeImg
                      src={item.image_url}
                      fallbackSrc="https://picsum.photos/seed/bmp-fallback-panier/256/256"
                      alt={item.nom}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-8 h-8 text-gray-600" />
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground dark:text-white mb-1">{item.nom}</h3>
                  <p className="text-amber-400 font-bold">{item.prix.toFixed(2)} TND</p>
                  
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantite - 1)}
                        className="w-8 h-8 rounded-lg bg-black/5 dark:bg-white/10 text-foreground dark:text-white hover:bg-black/5 dark:bg-white/20 transition-colors flex items-center justify-center"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center text-foreground dark:text-white">{item.quantite}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantite + 1)}
                        className="w-8 h-8 rounded-lg bg-black/5 dark:bg-white/10 text-foreground dark:text-white hover:bg-black/5 dark:bg-white/20 transition-colors flex items-center justify-center"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-bold text-foreground dark:text-white">
                    {(item.prix * item.quantite).toFixed(2)} TND
                  </p>
                </div>
              </motion.div>
            ))}
            
            <button
              onClick={clearCart}
              className="text-red-400 hover:text-red-300 text-sm transition-colors"
            >
              Vider le panier
            </button>
          </div>
          
          {/* Order summary */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl border border-border dark:border-white/10 bg-black/5 dark:bg-white/5">
              <h2 className="text-lg font-semibold text-foreground dark:text-white mb-4">Récapitulatif</h2>
              
              <div className="space-y-3 pb-4 border-b border-border dark:border-white/10">
                <div className="flex justify-between text-muted-foreground dark:text-gray-400">
                  <span>Sous-total</span>
                  <span>{total.toFixed(2)} TND</span>
                </div>
                <div className="flex justify-between text-muted-foreground dark:text-gray-400">
                  <span>Livraison</span>
                  <span>À définir</span>
                </div>
              </div>
              
              <div className="flex justify-between pt-4 mb-6">
                <span className="font-semibold text-foreground dark:text-white">Total</span>
                <span className="text-2xl font-bold text-amber-400">{total.toFixed(2)} TND</span>
              </div>
              
              <button
                onClick={handleGoToDelivery}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-900 font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-amber-500/30 transition-all"
              >
                <Truck className="w-4 h-4" />
                Choisir un livreur
              </button>

              {/* Lien vers Mes commandes */}
              <div className="mt-4 text-center">
                <Link
                  href="/espace/mes-commandes"
                  className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-700 dark:text-amber-300 text-sm transition-colors"
                >
                  Voir toutes mes commandes →
                </Link>
              </div>
            </div>
            
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-400">Livraison express</p>
                  <p className="text-xs text-muted-foreground dark:text-gray-400">Comparez les prix et choisissez le livreur qui vous convient</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}