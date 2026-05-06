'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  ArrowLeft, ShoppingCart, Truck, MapPin, Clock, 
  Package, CheckCircle, AlertCircle,
  Weight, Ruler, Map
} from 'lucide-react';
import { marketplaceAPI, Product } from '@/lib/marketplace-api';
import { useCartStore } from '@/lib/cart-store';
import ProductViewer3D from '@/components/ProductViewer3D';
import { SafeImg } from '@/components/SafeImg';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [showMap, setShowMap] = useState(false);
  
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    loadProduct();
  }, [params.id]);

  const loadProduct = async () => {
    try {
      const data = await marketplaceAPI.getProduct(params.id as string);
      setProduct(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    const emplacement = (product as any).emplacement || {
      ville: "Tunis",
      adresse: "Entrepôt BMP.tn, Tunis",
      lat: 36.8065,
      lng: 10.1815
    };
    
    addItem({
      productId: product._id,
      nom: product.nom,
      prix: product.prix,
      quantite: quantity,
      image_url: product.image_url,
      stock: product.stock,
      poids_kg: (product as any).poids_kg || 1000,
      emplacement: emplacement,
    });
    
    router.push('/gestion-marketplace/panier');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-amber-500/50 border-t-amber-400 animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground dark:text-white">Produit non trouvé</h1>
          <Link href="/gestion-marketplace" className="mt-4 inline-block text-amber-400">
            Retour au catalogue
          </Link>
        </div>
      </div>
    );
  }

  const emplacement = (product as any).emplacement || {
    ville: "Tunis",
    adresse: "Entrepôt BMP.tn, Tunis",
    lat: 36.8065,
    lng: 10.1815
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <div className="container mx-auto px-4 py-8">
        <Link href="/gestion-marketplace" className="inline-flex items-center gap-2 text-muted-foreground dark:text-gray-400 hover:text-amber-400 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Retour au catalogue
        </Link>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Section Visuelle (3D ou Image) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-3xl overflow-hidden border border-border dark:border-white/10 bg-black/5 dark:bg-white/5 relative group"
          >
            {product.model3d_url ? (
              <ProductViewer3D 
                modelUrl={product.model3d_url} 
                fallbackImageUrl={product.image_url}
                altText={product.nom}
              />
            ) : product.image_url ? (
              <SafeImg
                src={product.image_url}
                fallbackSrc="https://picsum.photos/seed/bmp-fallback-produit/1400/1000"
                alt={product.nom}
                className="w-full aspect-[4/3] object-cover rounded-2xl hover:scale-105 transition-transform duration-700 ease-out"
              />
            ) : (
              <div className="aspect-square flex items-center justify-center bg-gradient-to-br from-amber-500/20 to-yellow-500/20">
                <Package className="w-32 h-32 text-amber-400/40" />
              </div>
            )}
            
            {product.model3d_url && (
              <div className="absolute top-6 right-6 z-10">
                <span className="bg-amber-500 text-gray-900 text-[10px] font-bold px-2 py-1 rounded-full animate-bounce">
                  VUE 3D INTERACTIVE
                </span>
              </div>
            )}
          </motion.div>

          {/* Informations produit */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-medium">
                  {product.categorie}
                </span>
                {product.stock > 0 ? (
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    En stock ({product.stock})
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-medium">
                    Rupture
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold text-foreground dark:text-white mb-4">{product.nom}</h1>
              <p className="text-muted-foreground dark:text-gray-400 leading-relaxed">{product.description}</p>
            </div>

            {/* Localisation du produit */}
            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30">
              <div className="flex items-center gap-3 mb-3">
                <MapPin className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-sm font-medium text-foreground dark:text-white">Emplacement du produit</p>
                  <p className="text-xs text-blue-300">{emplacement.adresse}</p>
                  <p className="text-xs text-muted-foreground dark:text-gray-400">{emplacement.ville}</p>
                </div>
              </div>
              <button
                onClick={() => setShowMap(!showMap)}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-blue-500/20 text-blue-300 text-sm font-medium hover:bg-blue-500/30 transition-colors"
              >
                <Map className="w-4 h-4" />
                {showMap ? "Cacher la carte" : "Voir sur la carte"}
              </button>
            </div>

            {/* Carte de localisation du produit */}
            {showMap && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="rounded-2xl overflow-hidden border border-blue-500/30"
              >
                <div className="h-64 bg-gray-800/50 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-transparent" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                    <MapPin className="w-12 h-12 text-blue-400 mx-auto" />
                    <p className="text-sm text-foreground dark:text-white mt-2">{emplacement.ville}</p>
                    <p className="text-xs text-muted-foreground dark:text-gray-400">{emplacement.adresse}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Caractéristiques techniques */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-border dark:border-white/10">
              <div className="flex items-center gap-3">
                <Weight className="w-5 h-5 text-amber-400" />
                <div>
                  <p className="text-xs text-foreground dark:text-gray-500">Poids unitaire</p>
                  <p className="text-sm font-medium text-foreground dark:text-white">{(product as any).poids_kg || 1000} kg</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Ruler className="w-5 h-5 text-amber-400" />
                <div>
                  <p className="text-xs text-foreground dark:text-gray-500">Dimensions</p>
                  <p className="text-sm font-medium text-foreground dark:text-white">{(product as any).dimensions || "120x80x100 cm"}</p>
                </div>
              </div>
            </div>

            {/* Prix et quantité */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20">
              <div>
                <p className="text-sm text-muted-foreground dark:text-gray-400">Prix unitaire</p>
                <p className="text-3xl font-bold text-amber-400">{product.prix.toFixed(2)} TND</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/10 text-foreground dark:text-white hover:bg-black/5 dark:bg-white/20"
                >
                  -
                </button>
                <span className="text-xl font-semibold text-foreground dark:text-white w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/10 text-foreground dark:text-white hover:bg-black/5 dark:bg-white/20"
                >
                  +
                </button>
              </div>
            </div>

            {/* Note livraison */}
            <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20">
              <div className="flex items-center gap-2 text-amber-400 mb-2">
                <Truck className="w-4 h-4" />
                <span className="text-sm font-medium">Informations livraison</span>
              </div>
              <p className="text-xs text-muted-foreground dark:text-gray-400">
                Ce produit est situé à <span className="text-amber-400">{emplacement.ville}</span>. 
                Après ajout au panier, vous pourrez choisir votre adresse de livraison 
                et sélectionner le livreur le plus adapté.
              </p>
            </div>

            {/* Total et ajout au panier */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-900 font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-amber-500/30 transition-all disabled:opacity-50"
            >
              <ShoppingCart className="w-5 h-5" />
              Ajouter au panier ({product.prix * quantity} TND)
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}