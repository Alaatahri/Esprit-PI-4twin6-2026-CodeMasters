'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, Truck, ShoppingBag, Star, TrendingUp, 
  Calendar, Users, Award, Crown, BarChart3, 
  DollarSign, Activity, Zap, Heart 
} from 'lucide-react';
import { marketplaceAPI } from '@/lib/marketplace-api';

interface GlobalStats {
  totalCommandes: number;
  totalProduits: number;
  totalLivreurs: number;
  totalAvis: number;
  chiffreAffaires: number;
  noteMoyenneService: number;
}

interface TopLivreur {
  _id: string;
  nombreLivraisons: number;
  vehicle: {
    nom: string;
    type: string;
    note_moyenne: number;
  };
  noteMoyenne: number;
}

interface TopProduit {
  _id: string;
  totalVendus: number;
  chiffreAffaires: number;
  produit: {
    nom: string;
    prix: number;
  };
  noteMoyenne: number;
}

interface VentesData {
  ventesParJour: Array<{ _id: string; total: number; count: number }>;
  ventesParMois: Array<{ _id: string; total: number; count: number }>;
}

export default function StatsPage() {
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [topLivreurs, setTopLivreurs] = useState<TopLivreur[]>([]);
  const [topProduits, setTopProduits] = useState<TopProduit[]>([]);
  const [ventesData, setVentesData] = useState<VentesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [periode, setPeriode] = useState<'all' | 'semaine' | 'mois'>('all');

  useEffect(() => {
    loadStats();
  }, [periode]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [global, topLivreursData, topProduitsData, ventes] = await Promise.all([
        marketplaceAPI.getGlobalStats(),
        marketplaceAPI.getTopLivreurs(),
        marketplaceAPI.getTopProduits(),
        marketplaceAPI.getSalesStats(periode === 'all' ? undefined : periode)
      ]);
      
      setGlobalStats(global);
      setTopLivreurs(topLivreursData);
      setTopProduits(topProduitsData);
      setVentesData(ventes);
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-amber-500/50 border-t-amber-400 animate-spin" />
          <p className="text-gray-400">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-400 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-gray-900" />
            </div>
            <h1 className="text-2xl font-bold text-white">Statistiques Marketplace</h1>
          </div>
          <p className="text-gray-500">Analyse des ventes, performances et tendances</p>
        </div>

        {/* Période selector */}
        <div className="flex gap-3 mb-8">
          {[
            { key: 'all', label: 'Tout' },
            { key: 'semaine', label: '7 derniers jours' },
            { key: 'mois', label: 'Ce mois' }
          ].map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriode(p.key as any)}
              className={`px-4 py-2 rounded-xl transition-all ${
                periode === p.key
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-900 font-semibold'
                  : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Cartes KPI */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Chiffre d'affaires"
            value={`${globalStats?.chiffreAffaires.toFixed(2) || 0} TND`}
            icon={<DollarSign className="w-6 h-6" />}
            color="emerald"
          />
          <StatCard
            title="Commandes"
            value={globalStats?.totalCommandes || 0}
            icon={<ShoppingBag className="w-6 h-6" />}
            color="amber"
          />
          <StatCard
            title="Produits vendus"
            value={globalStats?.totalProduits || 0}
            icon={<Package className="w-6 h-6" />}
            color="blue"
          />
          <StatCard
            title="Livreurs actifs"
            value={globalStats?.totalLivreurs || 0}
            icon={<Truck className="w-6 h-6" />}
            color="purple"
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Top produits */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-semibold text-white">Produits les plus vendus</h2>
            </div>
            <div className="space-y-4">
              {topProduits.map((item, index) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <span className="text-amber-400 font-bold">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-white">{item.produit?.nom || 'Produit'}</p>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-gray-500">{item.totalVendus} vendus</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400" />
                          <span className="text-white">{item.noteMoyenne || 'Nouveau'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-amber-400">{item.chiffreAffaires.toFixed(0)} TND</p>
                    <p className="text-xs text-gray-500">CA généré</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Top livreurs */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Award className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-semibold text-white">Livreurs les plus demandés</h2>
            </div>
            <div className="space-y-4">
              {topLivreurs.map((item, index) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <span className="text-amber-400 font-bold">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-white">{item.vehicle?.nom || 'Livreur'}</p>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-gray-500">{item.nombreLivraisons} livraisons</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400" />
                          <span className="text-white">{item.noteMoyenne || 'Nouveau'}/5</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${i < Math.floor(item.noteMoyenne) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Graphiques ventes */}
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Calendar className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-semibold text-white">Ventes par jour</h2>
            </div>
            <div className="space-y-3">
              {ventesData?.ventesParJour?.slice(-7).map((jour) => (
                <div key={jour._id} className="flex items-center gap-4">
                  <span className="text-sm text-gray-400 w-24">{jour._id}</span>
                  <div className="flex-1 h-8 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full flex items-center justify-end px-3 text-xs font-bold text-gray-900"
                      style={{ width: `${Math.min(100, (jour.total / 1000) * 100)}%` }}
                    >
                      {jour.total > 0 && `${jour.total.toFixed(0)} TND`}
                    </div>
                  </div>
                  <span className="text-sm text-white w-16 text-right">{jour.count} cmd</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-semibold text-white">Performance générale</h2>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Satisfaction client</span>
                  <span className="text-white">{globalStats?.noteMoyenneService || 0}/5</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full"
                    style={{ width: `${((globalStats?.noteMoyenneService || 0) / 5) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Taux de conversion</span>
                  <span className="text-white">--%</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full" style={{ width: '45%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Livraisons réussies</span>
                  <span className="text-white">98%</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" style={{ width: '98%' }} />
                </div>
              </div>
              <div className="pt-4 mt-2 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-400">Total avis</span>
                  </div>
                  <span className="text-white font-bold">{globalStats?.totalAvis || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string; value: string | number; icon: React.ReactNode; color: string }) {
  const colorClasses = {
    emerald: 'from-emerald-500 to-emerald-400',
    amber: 'from-amber-500 to-yellow-400',
    blue: 'from-blue-500 to-blue-400',
    purple: 'from-purple-500 to-purple-400'
  };
  
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} bg-opacity-20`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{title}</p>
    </div>
  );
}