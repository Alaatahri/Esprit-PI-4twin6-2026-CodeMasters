'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, MapPin, Truck, AlertCircle, 
  Check, X, Navigation, Info, ArrowRight,
  Filter, Search, Clock, TrendingUp,
  LocateFixed, ShieldAlert, CheckCircle2
} from 'lucide-react';
import { marketplaceAPI } from '@/lib/marketplace-api';
import { getStoredUser } from '@/lib/auth';

export default function MissionsPage() {
  const [missions, setMissions] = useState<any[]>([]);
  const [vehicle, setVehicle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadMissions();
  }, []);

  const loadMissions = async () => {
    try {
      const u = getStoredUser();
      if (u) {
        try {
          const v = await marketplaceAPI.getDriverVehicle(u._id);
          setVehicle(v);
        } catch (vError) {
          console.warn('Véhicule non trouvé:', vError);
        }
      }
      const available = await marketplaceAPI.getAvailableDeliveries();
      setMissions(available);
    } catch (error) {
      console.error('Erreur chargement missions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (missionId: string) => {
    console.log('Tentative d\'acceptation mission:', missionId);
    if (!vehicle) {
      alert("Attention: Vous devez avoir un véhicule certifié pour accepter des missions.");
      return;
    }
    try {
      await marketplaceAPI.acceptDeliveryTask(missionId, vehicle._id);
      console.log('Mission acceptée avec succès');
      // On retire la mission de la liste locale
      setMissions(prev => prev.filter(m => m._id !== missionId));
      alert("Mission acceptée ! Retrouvez-la dans l'onglet 'Mes livraisons'.");
    } catch (error: any) {
      console.error('Erreur acceptation mission:', error);
      alert(`Erreur lors de l'acceptation de la mission: ${error.message || 'Problème serveur'}`);
    }
  };

  const handleRefuse = (missionId: string) => {
    console.log('Refus mission locale:', missionId);
    // On retire simplement de l'affichage local
    setMissions(prev => prev.filter(m => m._id !== missionId));
  };

  const filteredMissions = missions.filter(m => 
    m.adresse_livraison?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 md:p-10 space-y-10 pb-32 max-w-[1400px] mx-auto">
      {/* Search and Filters Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center">
              <Package className="w-7 h-7 text-gray-950" />
            </div>
            Flux de Missions
          </h1>
          <p className="text-gray-500 mt-2 font-medium">Découvrez les opportunités de livraison en temps réel dans votre zone.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative group w-full sm:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-amber-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Filtrer par zone ou adresse..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/5 transition-all"
            />
          </div>
          <button className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2">
            <Filter className="w-5 h-5" />
            <span className="text-sm font-bold">Filtres</span>
          </button>
        </div>
      </div>

      {!vehicle && !loading && (
        <div className="p-6 rounded-[2rem] bg-red-500/10 border border-red-500/20 flex items-center gap-4 text-red-400">
          <ShieldAlert className="w-8 h-8 shrink-0" />
          <div>
            <p className="font-black uppercase text-[10px] tracking-widest mb-1">Attention</p>
            <p className="text-sm font-bold">Votre compte n'a pas de véhicule actif. Vous ne pourrez pas accepter de missions tant qu'un véhicule ne vous est pas assigné.</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-80 rounded-[2.5rem] bg-white/5 border border-white/10 animate-pulse" />
          ))}
        </div>
      ) : filteredMissions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-8 border border-dashed border-white/10">
            <Package className="w-12 h-12 text-gray-700" />
          </div>
          <h3 className="text-2xl font-black text-white">Aucune mission trouvée</h3>
          <p className="text-gray-500 max-w-sm mt-2 font-medium">Revenez un peu plus tard ou élargissez votre périmètre de recherche.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredMissions.map((mission) => (
              <motion.div
                key={mission._id}
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden group hover:border-amber-500/40 transition-all shadow-2xl hover:shadow-amber-500/5 flex flex-col"
              >
                <div className="p-8 space-y-8 flex-1">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                        <Truck className="w-8 h-8" />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Type de mission</p>
                        <p className="text-lg font-bold text-white">Transport Standard</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-black text-emerald-400 tracking-tighter">{mission.cout_livraison || 45}.00 TND</p>
                      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Paiement Garanti</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="mt-1 flex flex-col items-center gap-1 shrink-0">
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                        <div className="w-0.5 h-10 bg-gradient-to-b from-amber-500 to-transparent"></div>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-600 font-black uppercase mb-1">Détails de l'itinéraire</p>
                        <p className="text-sm text-gray-300 font-bold leading-snug line-clamp-2">
                          <span className="text-amber-500">Destination :</span> {mission.adresse_livraison}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-6 p-6 rounded-3xl bg-white/5 border border-white/5">
                    <div className="text-center">
                      <p className="text-[10px] text-gray-500 uppercase font-black mb-2 tracking-widest">Distance</p>
                      <div className="flex items-center justify-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                        <p className="text-sm font-black text-white">{mission.distance_km || 12.4} km</p>
                      </div>
                    </div>
                    <div className="text-center border-x border-white/5">
                      <p className="text-[10px] text-gray-500 uppercase font-black mb-2 tracking-widest">Volume</p>
                      <p className="text-sm font-black text-white">Standard</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-gray-500 uppercase font-black mb-2 tracking-widest">Temps</p>
                      <div className="flex items-center justify-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-blue-400" />
                        <p className="text-sm font-black text-white">25 min</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button 
                      onClick={() => handleAccept(mission._id)}
                      className="flex-[3] py-5 rounded-2xl bg-amber-500 text-gray-950 font-black text-lg hover:bg-amber-400 transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center gap-3"
                    >
                      <Check className="w-6 h-6" />
                      Accepter
                    </button>
                    <button 
                      onClick={() => handleRefuse(mission._id)}
                      className="flex-1 py-5 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-all flex items-center justify-center"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>
                
                {/* Weather Warning Bottom Bar */}
                <div className="bg-blue-500/10 px-8 py-4 border-t border-blue-500/20 flex items-center justify-between group-hover:bg-blue-500/20 transition-all">
                  <span className="flex items-center gap-3 text-xs text-blue-300 font-black uppercase tracking-widest">
                    <Info className="w-4 h-4" />
                    Météo : Risque faible
                  </span>
                  <div className="flex items-center gap-2 text-[10px] font-black text-blue-400 uppercase opacity-0 group-hover:opacity-100 transition-all">
                    Plus d'infos
                    <ArrowRight className="w-4 h-4" />
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
