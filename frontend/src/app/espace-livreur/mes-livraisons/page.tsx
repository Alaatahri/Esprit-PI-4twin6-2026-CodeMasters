'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Truck, MapPin, Clock, CheckCircle2, 
  ChevronRight, Search, Filter, Package,
  TrendingUp, Calendar, AlertCircle
} from 'lucide-react';
import { marketplaceAPI } from '@/lib/marketplace-api';
import { getStoredUser } from '@/lib/auth';

export default function MyDeliveriesPage() {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadMyDeliveries();
  }, []);

  const loadMyDeliveries = async () => {
    try {
      const user = getStoredUser();
      if (!user) return;
      
      const v = await marketplaceAPI.getDriverVehicle(user._id);
      if (v) {
        const d = await marketplaceAPI.getDriverDeliveries(v._id);
        setDeliveries(d);
      }
    } catch (error) {
      console.error('Erreur chargement livraisons:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'Livrée': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'En livraison': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'En préparation': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      default: return 'text-gray-400 bg-white/5 border-white/10';
    }
  };

  const filteredDeliveries = deliveries.filter(d => {
    if (filter === 'all') return true;
    if (filter === 'active') return d.statut !== 'Livrée';
    if (filter === 'completed') return d.statut === 'Livrée';
    return true;
  });

  return (
    <div className="p-6 space-y-8 pb-20">
      {/* Header section with glassmorphism */}
      <div className="relative p-8 rounded-[2.5rem] bg-white/5 border border-white/10 overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Truck className="w-32 h-32 rotate-12" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-white flex items-center gap-3">
              <Truck className="w-10 h-10 text-amber-500" />
              Mes Livraisons
            </h1>
            <p className="text-gray-400 mt-2 max-w-md">
              Gérez vos courses en cours et consultez l'historique complet de vos livraisons terminées.
            </p>
          </div>
          
          <div className="flex p-1.5 bg-gray-950/50 rounded-2xl border border-white/5 self-start">
            <button 
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filter === 'all' ? 'bg-amber-500 text-gray-900 shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
              Toutes
            </button>
            <button 
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filter === 'active' ? 'bg-amber-500 text-gray-900 shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
              En cours
            </button>
            <button 
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filter === 'completed' ? 'bg-amber-500 text-gray-900 shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
              Terminées
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 rounded-3xl bg-white/5 border border-white/10 animate-pulse" />
          ))}
        </div>
      ) : filteredDeliveries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-dashed border-white/10">
            <Package className="w-10 h-10 text-gray-600" />
          </div>
          <h3 className="text-xl font-bold text-white">Aucune livraison trouvée</h3>
          <p className="text-gray-500 mt-2">Vous n'avez pas encore de livraisons correspondant à ce filtre.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredDeliveries.map((delivery) => (
              <motion.div
                key={delivery._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="p-6 rounded-[2rem] bg-white/5 border border-white/10 hover:border-amber-500/30 transition-all group cursor-pointer relative overflow-hidden"
              >
                {/* Status Badge */}
                <div className={`absolute top-6 right-6 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(delivery.statut)}`}>
                  {delivery.statut}
                </div>

                <div className="space-y-6">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Package className="w-6 h-6 text-amber-500" />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors truncate">
                      #{delivery.commandeId.slice(-6).toUpperCase()}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      {new Date(delivery.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                      <p className="text-xs text-gray-400 line-clamp-2">{delivery.adresse_livraison}</p>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm font-black text-white">{delivery.cout_livraison || delivery.prix_livraison || 45} TND</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-500 group-hover:translate-x-1 transition-transform">
                      Détails
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
