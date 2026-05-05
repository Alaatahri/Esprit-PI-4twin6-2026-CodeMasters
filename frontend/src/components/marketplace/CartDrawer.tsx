'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';
import { useState, useEffect } from 'react';
import { SafeImg } from '@/components/SafeImg';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, getTotal, getItemCount } = useCartStore();
  const [isMounted, setIsMounted] = useState(false);
  const [itemCount, setItemCount] = useState(0);
  const [total, setTotal] = useState(0);

  // ⭐ Éviter l'hydratation mismatch : attendre le montage côté client
  useEffect(() => {
    setIsMounted(true);
    setItemCount(getItemCount());
    setTotal(getTotal());
  }, [items, getItemCount, getTotal]);

  // Mettre à jour quand le panier change
  useEffect(() => {
    if (isMounted) {
      setItemCount(getItemCount());
      setTotal(getTotal());
    }
  }, [items, getItemCount, getTotal, isMounted]);

  // Version serveur (sans les valeurs du localStorage)
  if (!isMounted) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 bg-black/5 dark:bg-black/60 backdrop-blur-sm z-50" />
            <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-gray-950 border-l border-border dark:border-white/10 z-50 flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-border dark:border-white/10">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-5 h-5 text-amber-400" />
                  <h2 className="text-lg font-semibold text-foreground dark:text-white">Mon panier (0 article)</h2>
                </div>
                <button onClick={onClose} className="p-2 rounded-lg hover:bg-black/5 dark:bg-white/10">
                  <X className="w-5 h-5 text-muted-foreground dark:text-gray-400" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <div className="text-center py-12">
                  <ShoppingBag className="w-12 h-12 mx-auto text-gray-600 mb-3" />
                  <p className="text-foreground dark:text-gray-500">Chargement...</p>
                </div>
              </div>
            </div>
          </>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/5 dark:bg-black/60 backdrop-blur-sm z-50"
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-gray-950 border-l border-border dark:border-white/10 z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border dark:border-white/10">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-semibold text-foreground dark:text-white">
                  Mon panier ({itemCount} article{itemCount !== 1 ? 's' : ''})
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-black/5 dark:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground dark:text-gray-400" />
              </button>
            </div>
            
            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="w-12 h-12 mx-auto text-gray-600 mb-3" />
                  <p className="text-foreground dark:text-gray-500">Votre panier est vide</p>
                  <Link
                    href="/gestion-marketplace"
                    onClick={onClose}
                    className="inline-block mt-4 text-amber-400 hover:text-amber-700 dark:text-amber-300 text-sm transition-colors"
                  >
                    Découvrir les produits
                  </Link>
                </div>
              ) : (
                items.map((item) => (
                  <motion.div
                    key={item.productId}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    className="flex gap-3 p-3 rounded-xl bg-black/5 dark:bg-white/5"
                  >
                    <div className="w-16 h-16 rounded-lg bg-gray-800/50 flex items-center justify-center overflow-hidden">
                      {item.image_url ? (
                        <SafeImg
                          src={item.image_url}
                          fallbackSrc="https://picsum.photos/seed/bmp-fallback-cart/256/256"
                          alt={item.nom}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ShoppingBag className="w-6 h-6 text-gray-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground dark:text-white text-sm line-clamp-1">
                        {item.nom}
                      </h4>
                      <p className="text-amber-400 text-sm font-bold">
                        {item.prix.toFixed(2)} TND
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantite - 1)}
                          className="w-7 h-7 rounded-lg bg-black/5 dark:bg-white/10 text-foreground dark:text-white hover:bg-black/5 dark:bg-white/20 transition-colors flex items-center justify-center"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm text-foreground dark:text-white w-8 text-center">
                          {item.quantite}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantite + 1)}
                          className="w-7 h-7 rounded-lg bg-black/5 dark:bg-white/10 text-foreground dark:text-white hover:bg-black/5 dark:bg-white/20 transition-colors flex items-center justify-center"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="ml-auto text-red-400 hover:text-red-300 transition-colors"
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
                ))
              )}
            </div>
            
            {/* Footer */}
            {items.length > 0 && (
              <div className="p-4 border-t border-border dark:border-white/10">
                <div className="flex justify-between mb-4">
                  <span className="text-muted-foreground dark:text-gray-400">Total</span>
                  <span className="text-xl font-bold text-amber-400">
                    {total.toFixed(2)} TND
                  </span>
                </div>
                <Link
                  href="/gestion-marketplace/panier"
                  onClick={onClose}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-900 font-semibold text-center block transition-all hover:shadow-lg hover:shadow-amber-500/30"
                >
                  Valider le panier
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}