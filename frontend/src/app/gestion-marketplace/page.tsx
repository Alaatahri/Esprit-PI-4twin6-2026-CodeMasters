'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ShoppingBag, X, SlidersHorizontal, ShoppingCart, Plus, Minus, Trash2, ClipboardList, Search, Star, Wand2 } from 'lucide-react';
import { ProductCard } from '@/components/marketplace/ProductCard';
import { marketplaceAPI, Product } from '@/lib/marketplace-api';
import { useCartStore } from '@/lib/cart-store';
import { CartCounter } from '@/components/CartCounter';

export default function MarketplacePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [isMounted, setIsMounted] = useState(false);
  
  const cartItemCount = useCartStore((state) => state.getItemCount);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchQuery, selectedCategory, priceRange]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await marketplaceAPI.getProducts();
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      console.error('Erreur chargement produits:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];
    
    if (searchQuery) {
      filtered = filtered.filter((p: Product) =>
        p.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (selectedCategory) {
      filtered = filtered.filter((p: Product) => p.categorie === selectedCategory);
    }
    
    filtered = filtered.filter((p: Product) =>
      p.prix >= priceRange[0] && p.prix <= priceRange[1]
    );
    
    setFilteredProducts(filtered);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setPriceRange([0, 1000]);
  };

  const categories: string[] = [...new Set(products.map((p: Product) => p.categorie))];

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-background text-foreground dark:bg-gradient-to-b dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 dark:text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="flex items-center justify-center">
            <div className="w-12 h-12 rounded-full border-2 border-amber-500/50 border-t-amber-400 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground dark:bg-gradient-to-b dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 dark:text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/60 dark:bg-gray-950/90 dark:border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <Link 
                href="/" 
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card/60 border border-border/60 text-muted-foreground hover:text-brand hover:border-brand/35 transition-all duration-300 dark:bg-white/5 dark:border-white/10 dark:text-gray-400 dark:hover:text-amber-400 dark:hover:border-amber-500/30"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="hidden sm:inline">Retour</span>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-400 flex items-center justify-center shadow-lg shadow-amber-500/30">
                  <ShoppingBag className="w-5 h-5 text-gray-900" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground dark:text-white">Marketplace BMP.tn</h1>
                  <p className="text-xs text-muted-foreground dark:text-gray-500">Matériaux de construction professionnels</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Lien vers Mes commandes */}
              <Link
                href="/espace/mes-commandes"
                className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card/60 border border-border/60 text-muted-foreground hover:text-brand hover:border-brand/35 transition-all duration-300 text-sm font-medium dark:bg-white/5 dark:border-white/10 dark:text-gray-400 dark:hover:text-amber-400 dark:hover:border-amber-500/30"
              >
                <ClipboardList className="w-4 h-4" />
                Mes commandes
              </Link>

              {/* Lien vers Avis & notes */}
              <Link
                href="/gestion-marketplace/avis"
                className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card/60 border border-border/60 text-muted-foreground hover:text-brand hover:border-brand/35 transition-all duration-300 text-sm font-medium dark:bg-white/5 dark:border-white/10 dark:text-gray-400 dark:hover:text-amber-400 dark:hover:border-amber-500/30"
              >
                <Star className="w-4 h-4" />
                Avis & notes
              </Link>

              {/* Lien vers Estimation IA */}
              <Link
                href="/gestion-marketplace/estimation"
                className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-foreground dark:text-white hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 text-sm font-medium"
              >
                <Wand2 className="w-4 h-4" />
                Estimation IA
              </Link>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2.5 rounded-xl transition-all duration-300 ${
                  showFilters 
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                    : 'bg-card/60 border border-border/60 text-muted-foreground hover:text-brand hover:border-brand/35 dark:bg-white/5 dark:border-white/10 dark:text-gray-400 dark:hover:text-amber-400 dark:hover:border-amber-500/30'
                }`}
              >
                <SlidersHorizontal className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => setShowCart(true)}
                className="relative p-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-900 hover:shadow-lg hover:shadow-amber-500/30 transition-all duration-300"
              >
                <ShoppingCart className="w-5 h-5" />
                <CartCounter />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Search bar */}
      <div className="container mx-auto px-4 py-8">
        <div className="relative max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground dark:text-gray-500" />
            <input
              type="text"
              placeholder="Rechercher un produit (ciment, briques, peinture...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-5 py-4 pl-12 rounded-2xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300 dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder-gray-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-300 dark:text-gray-500 dark:hover:text-foreground dark:text-white dark:hover:bg-black/5 dark:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 pb-16">
        {/* Filters panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0, y: -20 }}
              animate={{ height: 'auto', opacity: 1, y: 0 }}
              exit={{ height: 0, opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden mb-8"
            >
              <ProductFilters
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                priceRange={priceRange}
                onPriceRangeChange={setPriceRange}
              />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Results count and reset */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <p className="text-sm text-muted-foreground dark:text-gray-400">
            {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''} trouvé{filteredProducts.length > 1 ? 's' : ''}
          </p>
          {(searchQuery || selectedCategory || priceRange[0] > 0 || priceRange[1] < 1000) && (
            <button
              onClick={resetFilters}
              className="text-xs px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-all duration-300"
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>
        
        {/* Products grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-16 h-16 rounded-full border-3 border-amber-500/30 border-t-amber-400 animate-spin" />
            <p className="mt-4 text-foreground dark:text-gray-500">Chargement des produits...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-32"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center">
              <ShoppingBag className="w-12 h-12 text-gray-600" />
            </div>
            <p className="text-foreground dark:text-gray-500 text-lg">Aucun produit trouvé</p>
            <p className="text-gray-600 text-sm mt-2">Essayez de modifier vos critères de recherche</p>
            <button
              onClick={resetFilters}
              className="mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-900 font-semibold hover:shadow-lg hover:shadow-amber-500/30 transition-all duration-300"
            >
              Voir tous les produits
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredProducts.map((product: Product, index: number) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
      
      {/* Cart drawer */}
      <CartDrawerComponent isOpen={showCart} onClose={() => setShowCart(false)} />
    </div>
  );
}

// ProductFilters Component
function ProductFilters({
  categories,
  selectedCategory,
  onCategoryChange,
  priceRange,
  onPriceRangeChange,
}: {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
}) {
  const [minPrice, maxPrice] = priceRange;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-2xl border border-border dark:border-white/10 bg-black/5 dark:bg-white/5 p-6 backdrop-blur-sm"
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-muted-foreground dark:text-gray-300 mb-2">
            Catégorie
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full rounded-xl bg-gray-900/80 border border-border dark:border-white/10 px-4 py-3 text-foreground dark:text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all duration-300 cursor-pointer"
          >
            <option value="">Toutes les catégories</option>
            {categories.map((category: string) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground dark:text-gray-300 mb-2">
            Fourchette de prix (TND)
          </label>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground dark:text-gray-500">Min</span>
              <input
                type="number"
                value={minPrice}
                min={0}
                onChange={(e) => onPriceRangeChange([Number(e.target.value), maxPrice])}
                className="w-full rounded-xl bg-gray-900/80 border border-border dark:border-white/10 px-4 py-3 pl-12 text-foreground dark:text-white focus:outline-none focus:border-amber-500/50 transition-all duration-300"
              />
            </div>
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground dark:text-gray-500">Max</span>
              <input
                type="number"
                value={maxPrice}
                min={0}
                onChange={(e) => onPriceRangeChange([minPrice, Number(e.target.value)])}
                className="w-full rounded-xl bg-gray-900/80 border border-border dark:border-white/10 px-4 py-3 pl-12 text-foreground dark:text-white focus:outline-none focus:border-amber-500/50 transition-all duration-300"
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// CartDrawer Component
function CartDrawerComponent({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { items, removeItem, updateQuantity, getTotal, getItemCount } = useCartStore();
  const [isMounted, setIsMounted] = useState(false);
  const [itemCount, setItemCount] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      setItemCount(getItemCount());
      setTotal(getTotal());
    }
  }, [items, getItemCount, getTotal, isMounted]);

  if (!isMounted) {
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/5 dark:bg-black/80 backdrop-blur-md z-50"
          />
          
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-gray-950/98 backdrop-blur-xl border-l border-border dark:border-white/10 z-50 flex flex-col shadow-2xl shadow-black/50"
          >
            <div className="flex items-center justify-between p-5 border-b border-border dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-400 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-gray-900" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground dark:text-white">Mon panier</h2>
                  <p className="text-xs text-foreground dark:text-gray-500">{itemCount} article{itemCount !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-black/5 dark:bg-white/10 transition-all duration-300">
                <X className="w-5 h-5 text-muted-foreground dark:text-gray-400" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {items.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center">
                    <ShoppingBag className="w-10 h-10 text-gray-600" />
                  </div>
                  <p className="text-foreground dark:text-gray-500">Votre panier est vide</p>
                  <Link href="/gestion-marketplace" onClick={onClose} className="inline-block mt-4 px-4 py-2 rounded-xl text-amber-400 hover:bg-amber-500/10 transition-all duration-300 text-sm">
                    Découvrir les produits →
                  </Link>
                </div>
              ) : (
                items.map((item) => (
                  <motion.div
                    key={item.productId}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    className="flex gap-3 p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-border dark:border-white/5 hover:border-amber-500/30 transition-all duration-300"
                  >
                    <div className="w-16 h-16 rounded-xl bg-gray-800/50 flex items-center justify-center overflow-hidden">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.nom} className="w-full h-full object-cover" />
                      ) : (
                        <ShoppingBag className="w-6 h-6 text-gray-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground dark:text-white text-sm line-clamp-1">{item.nom}</h4>
                      <p className="text-amber-400 text-sm font-bold">{item.prix.toFixed(2)} TND</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button onClick={() => updateQuantity(item.productId, item.quantite - 1)} className="w-7 h-7 rounded-lg bg-black/5 dark:bg-white/10 text-foreground dark:text-white hover:bg-black/5 dark:bg-white/20 transition-all duration-300 flex items-center justify-center">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm text-foreground dark:text-white w-8 text-center font-medium">{item.quantite}</span>
                        <button onClick={() => updateQuantity(item.productId, item.quantite + 1)} className="w-7 h-7 rounded-lg bg-black/5 dark:bg-white/10 text-foreground dark:text-white hover:bg-black/5 dark:bg-white/20 transition-all duration-300 flex items-center justify-center">
                          <Plus className="w-3 h-3" />
                        </button>
                        <button onClick={() => removeItem(item.productId)} className="ml-auto p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-300">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground dark:text-white">{(item.prix * item.quantite).toFixed(2)} TND</p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
            
            {items.length > 0 && (
              <div className="p-5 border-t border-border dark:border-white/10 bg-gradient-to-t from-gray-950/50 to-transparent">
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-border dark:border-white/10">
                  <span className="text-muted-foreground dark:text-gray-400">Sous-total</span>
                  <span className="text-xl font-bold text-amber-400">{total.toFixed(2)} TND</span>
                </div>
                <Link href="/gestion-marketplace/panier" onClick={onClose} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-900 font-semibold text-center block transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/30 transform hover:scale-[1.02]">
                  Procéder au paiement
                </Link>
                <button onClick={onClose} className="w-full mt-3 py-2.5 rounded-xl text-muted-foreground dark:text-gray-400 hover:text-foreground dark:text-white transition-all duration-300 text-sm">
                  Continuer mes achats
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}