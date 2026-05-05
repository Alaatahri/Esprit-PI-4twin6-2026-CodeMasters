'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ShoppingCart, Package, Truck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCartStore } from '@/lib/cart-store';
import { Product } from '@/lib/marketplace-api';
import { SafeImg } from '@/components/SafeImg';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const getItemCount = useCartStore((state) => state.getItemCount);
  const [showNotification, setShowNotification] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  // ⭐ Éviter l'hydratation mismatch
  useEffect(() => {
    setIsMounted(true);
    setCartCount(getItemCount());
  }, [getItemCount]);

  useEffect(() => {
    if (isMounted) {
      setCartCount(getItemCount());
    }
  }, [getItemCount, isMounted]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addItem({
      productId: product._id,
      nom: product.nom,
      prix: product.prix,
      quantite: 1,
      image_url: product.image_url,
      stock: product.stock,
    });
    
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      className="group relative rounded-2xl border border-border dark:border-white/10 bg-black/5 dark:bg-white/5 backdrop-blur-xl overflow-hidden hover:border-amber-500/30 transition-all duration-300"
    >
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <div className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-400 border border-emerald-500/30 backdrop-blur-md">
          <Package className="w-3 h-3" />
          {product.stock > 0 ? `En stock (${product.stock})` : 'Rupture'}
        </div>
        {product.model3d_url && (
          <div className="flex items-center gap-1 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-medium text-amber-400 border border-amber-500/30 backdrop-blur-md animate-pulse">
            <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
            Vue 3D disponible
          </div>
        )}
      </div>

      {/* Image */}
      <Link href={`/gestion-marketplace/produit/${product._id}`}>
        <div className="aspect-[4/3] relative overflow-hidden bg-gray-800/50">
          {product.image_url ? (
            <SafeImg
              src={product.image_url}
              fallbackSrc={`https://picsum.photos/seed/${encodeURIComponent(
                product._id || product.nom || "bmp-fallback-product",
              )}/1200/900`}
              alt={product.nom}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-500/20 to-yellow-500/20">
              <Package className="w-16 h-16 text-amber-400/40" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </Link>

      {/* Contenu */}
      <div className="p-5">
        <Link href={`/gestion-marketplace/produit/${product._id}`}>
          <h3 className="font-semibold text-foreground dark:text-white mb-2 line-clamp-2 group-hover:text-amber-700 dark:text-amber-300 transition-colors">
            {product.nom}
          </h3>
        </Link>
        
        <p className="text-foreground dark:text-gray-500 text-sm mb-4 line-clamp-2">{product.description}</p>
        
        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="text-2xl font-bold text-amber-400">
              {product.prix.toFixed(2)} <span className="text-sm font-normal text-foreground dark:text-gray-500">TND</span>
            </span>
            {product.stock > 0 && (
              <div className="flex items-center gap-1 mt-1 text-[11px] text-foreground dark:text-gray-500">
                <Truck className="w-3 h-3" />
                Livraison sous 2-3 jours
              </div>
            )}
          </div>
          
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {/* ⭐ Le badge n'est PAS ici - il n'y a pas de compteur sur le bouton d'ajout */}
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:inline">Ajouter</span>
          </button>
        </div>
      </div>

      {/* Notification toast */}
      {showNotification && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute bottom-20 left-4 right-4 bg-emerald-500 text-foreground dark:text-white text-sm font-medium py-2 px-3 rounded-lg text-center z-20"
        >
          Ajouté au panier !
        </motion.div>
      )}
    </motion.div>
  );
}