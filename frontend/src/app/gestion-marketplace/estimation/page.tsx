'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  ArrowLeft, Wand2, Upload, Image as ImageIcon, 
  Home, Ruler, Hammer, PaintBucket, Zap,
  ShoppingCart, Package, Truck, TrendingUp,
  Camera, X, Loader2, CheckCircle
} from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';
import { marketplaceAPI } from '@/lib/marketplace-api';

type ModeType = 'besoin' | 'image';

export default function EstimationPage() {
  const [mode, setMode] = useState<ModeType>('besoin');
  const [description, setDescription] = useState('');
  const [surface, setSurface] = useState<number>(100);
  const [typeProjet, setTypeProjet] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addItem } = useCartStore();

  const typesProjet = [
    { value: 'construction', label: 'Construction neuve', icon: Home },
    { value: 'renovation', label: 'Rénovation', icon: Hammer },
    { value: 'terrassement', label: 'Terrassement', icon: Ruler },
    { value: 'finition', label: 'Finition', icon: PaintBucket },
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyse = async () => {
    setLoading(true);
    try {
      let data;
      if (mode === 'besoin') {
        data = await fetch('/api/marketplace/estimation/analyser-besoin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            description,
            surface,
            type_projet: typeProjet || undefined
          })
        }).then(res => res.json());
      } else {
        if (!image) return;
        data = await fetch('/api/marketplace/estimation/analyser-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image })
        }).then(res => res.json());
      }
      setResult(data);
      setSelectedProducts(new Set(data.produits_recommandes?.map((p: any) => p.produitId) || []));
    } catch (error) {
      console.error('Erreur analyse:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: any) => {
    addItem({
      productId: product.produitId || `temp_${Date.now()}`,
      nom: product.nom,
      prix: product.prix_unitaire,
      quantite: product.quantite,
      stock: 999,
    });
  };

  const addAllToCart = () => {
    result?.produits_recommandes?.forEach((product: any) => {
      addToCart(product);
    });
    alert('Tous les produits ont été ajoutés au panier !');
  };

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
              <Wand2 className="w-6 h-6 text-gray-900" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Estimation intelligente</h1>
              <p className="text-gray-500">Décrivez votre projet ou uploader une photo pour une estimation automatique</p>
            </div>
          </div>
        </div>

        {/* Mode selector */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setMode('besoin')}
            className={`flex-1 py-4 rounded-xl border transition-all ${
              mode === 'besoin'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-900 border-amber-500'
                : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Hammer className="w-5 h-5" />
              Décrire mon besoin
            </div>
          </button>
          <button
            onClick={() => setMode('image')}
            className={`flex-1 py-4 rounded-xl border transition-all ${
              mode === 'image'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-900 border-amber-500'
                : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Camera className="w-5 h-5" />
              Uploader une photo
            </div>
          </button>
        </div>

        {/* Formulaire */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-8">
          {mode === 'besoin' ? (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Décrivez votre projet
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Je souhaite construire un mur de 10m², refaire la chape du salon de 25m², et peindre 3 chambres..."
                  className="w-full rounded-xl bg-gray-900/80 border border-white/10 px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-500/50"
                  rows={4}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Surface approximative (m²)
                  </label>
                  <input
                    type="number"
                    value={surface}
                    onChange={(e) => setSurface(Number(e.target.value))}
                    className="w-full rounded-xl bg-gray-900/80 border border-white/10 px-4 py-3 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Type de projet
                  </label>
                  <select
                    value={typeProjet}
                    onChange={(e) => setTypeProjet(e.target.value)}
                    className="w-full rounded-xl bg-gray-900/80 border border-white/10 px-4 py-3 text-white"
                  >
                    <option value="">Non spécifié</option>
                    {typesProjet.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/20 rounded-xl p-8 cursor-pointer hover:border-amber-500/50 transition-all"
              >
                {image ? (
                  <div className="relative">
                    <img src={image} alt="Upload" className="max-h-64 mx-auto rounded-lg" />
                    <button
                      onClick={(e) => { e.stopPropagation(); setImage(null); setImageFile(null); }}
                      className="absolute top-2 right-2 p-1 rounded-full bg-red-500 text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-12 h-12 mx-auto text-gray-500 mb-3" />
                    <p className="text-gray-400">Cliquez ou glissez une photo de votre chantier</p>
                    <p className="text-xs text-gray-500 mt-2">JPG, PNG jusqu'à 5MB</p>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          )}

          <button
            onClick={handleAnalyse}
            disabled={loading || (mode === 'besoin' && !description) || (mode === 'image' && !image)}
            className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-900 font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyse en cours...
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5" />
                Analyser mon projet
              </>
            )}
          </button>
        </div>

        {/* Résultats */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Résumé */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-xl font-bold text-white mb-4">📊 Résultat de l'estimation</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <p className="text-sm text-gray-400">Budget estimé</p>
                  <p className="text-2xl font-bold text-emerald-400">{result.estimation?.prix_total?.toFixed(2) || 0} TND</p>
                </div>
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
                  <p className="text-sm text-gray-400">Main d'œuvre estimée</p>
                  <p className="text-2xl font-bold text-blue-400">{result.estimation?.main_oeuvre?.toFixed(2) || 0} TND</p>
                </div>
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                  <p className="text-sm text-gray-400">Frais de livraison</p>
                  <p className="text-2xl font-bold text-amber-400">{result.estimation?.frais_livraison?.toFixed(2) || 50} TND</p>
                </div>
              </div>
              {result.surface_estimee && (
                <p className="text-sm text-gray-500 mt-4">📐 Surface estimée: {result.surface_estimee} m²</p>
              )}
            </div>

            {/* Produits recommandés */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">🛒 Produits recommandés</h2>
                <button
                  onClick={addAllToCart}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-900 font-semibold text-sm flex items-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Tout ajouter
                </button>
              </div>
              <div className="space-y-3">
                {result.produits_recommandes?.map((product: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex-1">
                      <p className="font-medium text-white">{product.nom}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                        <span>📦 Quantité: {Math.ceil(product.quantite)}</span>
                        <span>💰 {product.prix_unitaire} TND/unité</span>
                        {product.confiance && (
                          <span className="text-emerald-400">✓ Confiance: {(product.confiance * 100).toFixed(0)}%</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right mr-4">
                      <p className="text-lg font-bold text-amber-400">{product.prix_total?.toFixed(2) || (product.quantite * product.prix_unitaire).toFixed(2)} TND</p>
                    </div>
                    <button
                      onClick={() => addToCart(product)}
                      className="p-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-900"
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Link
                href="/gestion-marketplace/panier"
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-900 font-semibold text-center"
              >
                Voir mon panier
              </Link>
              <button
                onClick={() => {
                  setResult(null);
                  setDescription('');
                  setImage(null);
                }}
                className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white"
              >
                Nouvelle estimation
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}