'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CloudSun, MapPin, Navigation, Clock, 
  AlertTriangle, CheckCircle2, TrendingUp,
  Wallet, Star, Calendar, ChevronRight,
  Package, Truck, Map as MapIcon, RefreshCcw,
  Check, X, Activity, Zap, ShieldCheck,
  ChevronDown, ArrowUpRight, LocateFixed, Info
} from 'lucide-react';
import { marketplaceAPI } from '@/lib/marketplace-api';
import dynamic from 'next/dynamic';
import { getStoredUser } from '@/lib/auth';

// Import dynamique de la carte
const SmartMap = dynamic(() => import('@/components/SmartMap'), { 
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-card dark:bg-gray-900 animate-pulse rounded-[2.5rem] flex items-center justify-center text-foreground dark:text-gray-500">Chargement de l'interface cartographique...</div>
});

export default function DriverDashboard() {
  const [user, setUser] = useState<any>(null);
  const [vehicle, setVehicle] = useState<any>(null);
  const [myDeliveries, setMyDeliveries] = useState<any[]>([]);
  const [availableMissions, setAvailableMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'missions' | 'my-deliveries'>('missions');
  const [weather, setWeather] = useState({ temp: 24, status: 'Ensoleillé', wind: 12, risk: 'Faible' });
  const [selectedMission, setSelectedMission] = useState<any>(null);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [activeDelivery, setActiveDelivery] = useState<any>(null);

  useEffect(() => {
    const u = getStoredUser();
    if (u) {
      setUser(u);
      loadDashboardData(u._id);
    }
  }, []);

  const loadDashboardData = async (userId: string) => {
    setLoading(true);
    try {
      // 1. Charger le véhicule
      const v = await marketplaceAPI.getDriverVehicle(userId);
      setVehicle(v);

      if (v) {
        // 2. Charger mes livraisons assignées
        const myDeliveries = await marketplaceAPI.getDriverDeliveries(v._id);
        setMyDeliveries(myDeliveries);
        
        // On cherche une livraison active (En livraison, En route) ou assignée mais pas encore démarrée (En préparation)
        const active = myDeliveries.find((d: any) => 
          ['En livraison', 'En route', 'En préparation'].includes(d.statut)
        );
        setActiveDelivery(active);
      }

      // 3. Charger les missions disponibles
      const available = await marketplaceAPI.getAvailableDeliveries();
      setAvailableMissions(available);

    } catch (error) {
      console.error('Erreur dashboard livreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptMission = async (deliveryId: string) => {
    if (!vehicle) {
      alert("Erreur: Aucun véhicule associé à votre compte. Contactez le support.");
      return;
    }
    try {
      await marketplaceAPI.acceptDeliveryTask(deliveryId, vehicle._id);
      await loadDashboardData(user._id);
      setActiveTab('my-deliveries');
      setSelectedMission(null);
    } catch (error) {
      alert("Erreur lors de l'acceptation de la mission.");
    }
  };

  const openMissionDetails = async (mission: any) => {
    setSelectedMission(mission);
    setOrderDetails(null); // Reset previous details
    try {
      const order = await marketplaceAPI.getOrder(mission.commandeId);
      setOrderDetails(order);
    } catch (error) {
      console.warn('Détails commande non trouvés pour cette mission:', error);
      // On crée un objet de commande factice pour ne pas bloquer l'affichage
      setOrderDetails({
        _id: mission.commandeId,
        items: [],
        montant_total: 0,
        statut: 'Inconnu',
        mode_paiement: 'Inconnu'
      });
    }
  };

  const handleConfirmDelivery = async (deliveryId: string) => {
    try {
      await marketplaceAPI.updateDeliveryStatus(deliveryId, 'Livrée');
      await loadDashboardData(user._id);
      alert("Livraison confirmée avec succès !");
    } catch (error) {
      alert("Erreur lors de la confirmation de la livraison.");
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8 pb-32 max-w-[1600px] mx-auto">
      {/* Dynamic Header with Stats Chips */}
      <div className="flex flex-col xl:flex-row gap-6">
        <div className="flex-1 p-10 rounded-[3rem] bg-gradient-to-br from-amber-500 to-yellow-400 text-gray-950 shadow-2xl shadow-amber-500/20 relative overflow-hidden flex flex-col justify-between min-h-[240px] group">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="px-3 py-1 rounded-full bg-gray-950/10 backdrop-blur-md border border-gray-950/5 text-[10px] font-black uppercase tracking-widest">
                Profil Certifié
              </div>
              <div className="w-2 h-2 rounded-full bg-gray-950 animate-pulse"></div>
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Bonjour, {user?.nom} !</h1>
            <p className="font-bold text-gray-950/70 max-w-lg text-lg leading-snug">
              {availableMissions.length > 0 
                ? `Opportunité : ${availableMissions.length} missions sont actuellement disponibles dans votre secteur.` 
                : "Excellente nouvelle ! Vous êtes à jour. Aucune nouvelle mission pour le moment."}
            </p>
          </div>
          
          <div className="relative z-10 flex flex-wrap gap-3 mt-8">
            <button className="px-6 py-3 rounded-2xl bg-gray-950 text-amber-500 font-black text-sm flex items-center gap-2 hover:scale-105 transition-all">
              <Zap className="w-4 h-4" />
              Mode Boost Actif
            </button>
            <div className="px-6 py-3 rounded-2xl bg-black/5 dark:bg-white/20 backdrop-blur-md border border-border dark:border-white/10 text-gray-900 font-black text-sm">
              Note : 4.9/5
            </div>
          </div>

          {/* Abstract Truck Decoration */}
          <TruckDecoration className="absolute -right-16 -bottom-16 opacity-10 w-96 h-96 group-hover:scale-110 transition-transform duration-700" />
        </div>

        {/* Real-time Environment Info */}
        <div className="xl:w-[400px] grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-6">
          <div className="p-8 rounded-[2.5rem] bg-black/5 dark:bg-white/5 border border-border dark:border-white/10 backdrop-blur-xl flex flex-col justify-between group hover:bg-black/5 dark:bg-white/10 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                  <CloudSun className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-[10px] text-foreground dark:text-gray-500 uppercase font-black tracking-widest mb-1">Météo Tunis</p>
                  <p className="text-xl font-black text-foreground dark:text-white">{weather.status}</p>
                </div>
              </div>
              <p className="text-4xl font-black text-foreground dark:text-white tracking-tighter">{weather.temp}°</p>
            </div>
            <div className="mt-6 flex items-center gap-3 p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Risque : {weather.risk}</p>
            </div>
          </div>

          <div className="p-8 rounded-[2.5rem] bg-black/5 dark:bg-white/5 border border-border dark:border-white/10 backdrop-blur-xl group hover:bg-black/5 dark:bg-white/10 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <Wallet className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-[10px] text-foreground dark:text-gray-500 uppercase font-black tracking-widest mb-1">Gains du jour</p>
                  <p className="text-xl font-black text-foreground dark:text-white">245.50 TND</p>
                </div>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-[10px] font-black">
                <ArrowUpRight className="w-3 h-3" />
                +12%
              </div>
            </div>
            <div className="w-full h-1.5 bg-gray-950 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: '75%' }} className="h-full bg-amber-500"></motion.div>
            </div>
            <p className="text-[10px] text-foreground dark:text-gray-500 mt-2 font-bold uppercase tracking-widest text-right">Objectif : 300 TND</p>
          </div>
        </div>
      </div>

      {/* Main Command Center Layout */}
      <div className="grid grid-cols-1 2xl:grid-cols-4 gap-8">
        
        {/* Missions & Deliveries List (3/4 of space) */}
        <div className="2xl:col-span-3 space-y-8">
          {/* Enhanced Navigation Tabs */}
          <div className="flex items-center justify-between bg-black/5 dark:bg-white/5 p-2 rounded-3xl border border-border dark:border-white/10 w-fit">
            <button 
              onClick={() => setActiveTab('missions')}
              className={`flex items-center gap-3 px-8 py-4 rounded-2xl transition-all font-black text-sm ${activeTab === 'missions' ? 'bg-amber-500 text-gray-950 shadow-xl shadow-amber-500/20 scale-105' : 'text-muted-foreground dark:text-gray-400 hover:text-foreground dark:text-white'}`}
            >
              <Package className="w-5 h-5" />
              Flux de Missions
              {availableMissions.length > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-lg text-[10px] ${activeTab === 'missions' ? 'bg-gray-950 text-amber-500' : 'bg-amber-500 text-gray-950'}`}>
                  {availableMissions.length}
                </span>
              )}
            </button>
            <button 
              onClick={() => setActiveTab('my-deliveries')}
              className={`flex items-center gap-3 px-8 py-4 rounded-2xl transition-all font-black text-sm ${activeTab === 'my-deliveries' ? 'bg-amber-500 text-gray-950 shadow-xl shadow-amber-500/20 scale-105' : 'text-muted-foreground dark:text-gray-400 hover:text-foreground dark:text-white'}`}
            >
              <Activity className="w-5 h-5" />
              Livraisons Actives
              {myDeliveries.filter(d => d.statut !== 'Livré').length > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-lg text-[10px] ${activeTab === 'my-deliveries' ? 'bg-gray-950 text-amber-500' : 'bg-amber-500 text-gray-950'}`}>
                  {myDeliveries.filter(d => d.statut !== 'Livré').length}
                </span>
              )}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'missions' ? (
              <motion.div 
                key="missions-panel"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                {availableMissions.length > 0 ? (
                  availableMissions.map((mission) => (
                    <div key={mission._id} className="p-8 rounded-[2.5rem] bg-black/5 dark:bg-white/5 border border-border dark:border-white/10 hover:border-amber-500/40 transition-all group relative overflow-hidden flex flex-col justify-between min-h-[300px]">
                      <div className="flex justify-between items-start mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                          <Truck className="w-8 h-8" />
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-black text-foreground dark:text-white">{mission.cout_livraison || 45} TND</p>
                          <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Payé à 50%</p>
                        </div>
                      </div>

                      <div className="space-y-4 mb-8">
                        <h3 className="text-xl font-bold text-foreground dark:text-white group-hover:text-amber-500 transition-colors">Mission #{mission.commandeId.slice(-6).toUpperCase()}</h3>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 text-sm text-muted-foreground dark:text-gray-400">
                            <LocateFixed className="w-4 h-4 text-amber-500" />
                            <span className="line-clamp-1">{mission.adresse_livraison}</span>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2 text-xs font-bold text-foreground dark:text-gray-500">
                              <Navigation className="w-3.5 h-3.5" />
                              {mission.distance_km || 12} km
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold text-foreground dark:text-gray-500">
                              <Clock className="w-3.5 h-3.5" />
                              ~25 min
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <button 
                          onClick={() => openMissionDetails(mission)}
                          className="flex-1 py-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-border dark:border-white/10 text-foreground dark:text-white font-black text-sm hover:bg-black/5 dark:bg-white/10 transition-all"
                        >
                          Détails
                        </button>
                        <button 
                          onClick={() => handleAcceptMission(mission._id)}
                          className="flex-[2] py-4 rounded-2xl bg-amber-500 text-gray-950 font-black text-sm hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
                        >
                          <Check className="w-5 h-5" />
                          Accepter la mission
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="lg:col-span-2 p-24 rounded-[3rem] bg-black/5 dark:bg-white/5 border border-dashed border-border dark:border-white/10 flex flex-col items-center justify-center text-center">
                    <div className="w-24 h-24 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center mb-6">
                      <Package className="w-12 h-12 text-gray-700" />
                    </div>
                    <h3 className="text-2xl font-black text-foreground dark:text-white">Zone calme</h3>
                    <p className="text-foreground dark:text-gray-500 max-w-sm mt-2">Nous vous notifierons dès qu'une nouvelle commande est passée dans votre secteur.</p>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div 
                key="active-panel"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-8"
              >
                {activeDelivery ? (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Live Tracker Map */}
                    <div className="lg:col-span-2 rounded-[3rem] border border-border dark:border-white/10 bg-card dark:bg-gray-900 overflow-hidden shadow-2xl relative h-[500px]">
                      <SmartMap delivery={activeDelivery} />
                      <div className="absolute top-6 left-6 right-6 flex justify-between items-start pointer-events-none">
                        <div className="p-5 rounded-[1.5rem] bg-gray-950/80 backdrop-blur-xl border border-border dark:border-white/10 shadow-2xl space-y-3 pointer-events-auto">
                          <p className="text-[10px] text-amber-500 uppercase font-black tracking-widest">Navigation Temps Réel</p>
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                              <Navigation className="w-5 h-5 text-amber-500 animate-pulse" />
                            </div>
                            <div>
                              <p className="text-sm font-black text-foreground dark:text-white">Route la plus rapide via l'A1</p>
                              <p className="text-[10px] text-foreground dark:text-gray-500 font-bold">Trafic fluide, arrivée prévue à 14:42</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Active Mission Details Card */}
                    <div className="p-8 rounded-[3rem] bg-black/5 dark:bg-white/5 border border-amber-500/20 flex flex-col justify-between backdrop-blur-xl shadow-2xl shadow-amber-500/5">
                      <div>
                        <div className="flex items-center justify-between mb-8">
                          <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-black text-amber-500 uppercase tracking-widest">
                            En cours
                          </span>
                          <button onClick={() => openMissionDetails(activeDelivery)} className="text-foreground dark:text-gray-500 hover:text-foreground dark:text-white transition-colors">
                            <Info className="w-5 h-5" />
                          </button>
                        </div>
                        <h3 className="text-3xl font-black text-foreground dark:text-white mb-2 leading-tight">#{activeDelivery.commandeId.slice(-6).toUpperCase()}</h3>
                        <p className="text-muted-foreground dark:text-gray-400 text-sm flex items-center gap-2 mb-8">
                          <MapPin className="w-4 h-4 text-amber-500" />
                          {activeDelivery.adresse_livraison}
                        </p>

                        <div className="space-y-4">
                          <div className="p-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-border dark:border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Clock className="w-5 h-5 text-amber-500" />
                              <span className="text-xs font-bold text-muted-foreground dark:text-gray-400">Temps restant</span>
                            </div>
                            <span className="text-sm font-black text-foreground dark:text-white">~12 min</span>
                          </div>
                          <div className="p-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-border dark:border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Navigation className="w-5 h-5 text-blue-400" />
                              <span className="text-xs font-bold text-muted-foreground dark:text-gray-400">Distance</span>
                            </div>
                            <span className="text-sm font-black text-foreground dark:text-white">4.2 km</span>
                          </div>
                        </div>
                      </div>

                      <button 
                        onClick={() => handleConfirmDelivery(activeDelivery._id)}
                        className="w-full mt-10 py-5 rounded-2xl bg-emerald-500 text-gray-950 font-black text-lg hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3"
                      >
                        <CheckCircle2 className="w-6 h-6" />
                        Confirmer Livraison
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-24 rounded-[3rem] bg-black/5 dark:bg-white/5 border border-dashed border-border dark:border-white/10 flex flex-col items-center justify-center text-center">
                    <Truck className="w-12 h-12 text-gray-700 mb-6" />
                    <h3 className="text-2xl font-black text-foreground dark:text-white">Aucune livraison active</h3>
                    <p className="text-foreground dark:text-gray-500 mt-2">Sélectionnez une mission dans l'onglet disponible pour démarrer.</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Sidebar: Status & vehicle (1/4 of space) */}
        <div className="space-y-8">
          {/* Availability Status */}
          <div className="p-8 rounded-[2.5rem] bg-black/5 dark:bg-white/5 border border-border dark:border-white/10 backdrop-blur-md">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-black text-foreground dark:text-white">Statut</h3>
                <p className="text-[10px] text-foreground dark:text-gray-500 uppercase font-black tracking-widest">En ligne & Prêt</p>
              </div>
              <div className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-16 h-8 bg-secondary dark:bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-8 after:transition-all peer-checked:bg-emerald-500"></div>
              </div>
            </div>

            {/* Vehicle Card */}
            <div className="p-6 rounded-[2rem] bg-gradient-to-br from-white/[0.08] to-transparent border border-border dark:border-white/10 group hover:border-amber-500/30 transition-all mb-8">
              <p className="text-[10px] text-foreground dark:text-gray-500 uppercase font-black tracking-widest mb-4">Véhicule Actif</p>
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                  <Truck className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-lg font-black text-foreground dark:text-white leading-none mb-2">{vehicle?.nom || 'Certifié BMP'}</p>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-gray-950 text-[10px] font-black text-amber-500 border border-border dark:border-white/5">
                      {vehicle?.immatriculation || 'TN-8282'}
                    </span>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-border dark:border-white/5 text-center">
                <p className="text-[10px] text-foreground dark:text-gray-500 uppercase font-black mb-1">Score</p>
                <div className="flex items-center justify-center gap-1">
                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  <span className="text-lg font-black text-foreground dark:text-white">4.9</span>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-border dark:border-white/5 text-center">
                <p className="text-[10px] text-foreground dark:text-gray-500 uppercase font-black mb-1">Missions</p>
                <span className="text-lg font-black text-foreground dark:text-white">124</span>
              </div>
            </div>

            <button 
              onClick={() => loadDashboardData(user?._id)}
              className="w-full py-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-border dark:border-white/10 text-foreground dark:text-white font-bold hover:bg-black/5 dark:bg-white/10 transition-all flex items-center justify-center gap-3"
            >
              <RefreshCcw className="w-5 h-5" />
              Actualiser
            </button>
          </div>

          {/* Traffic/Alert Center */}
          <div className="p-8 rounded-[2.5rem] bg-blue-500/10 border border-blue-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <AlertTriangle className="w-16 h-16" />
            </div>
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h4 className="font-black text-blue-100 uppercase tracking-widest text-sm">Alerte Trafic</h4>
            </div>
            <p className="text-xs text-blue-100/70 leading-relaxed font-medium relative z-10">
              Perturbation majeure signalée sur la <span className="text-foreground dark:text-white font-bold">Route X-20</span>. Nos algorithmes recommandent le passage par l'avenue Bourguiba pour économiser 8 minutes.
            </p>
            <button className="mt-6 flex items-center gap-2 text-[10px] font-black text-blue-400 uppercase hover:text-foreground dark:text-white transition-colors">
              Voir sur la carte
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Improved Mission Details Modal */}
      <AnimatePresence>
        {selectedMission && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-950/90 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="bg-card dark:bg-gray-900 border border-border dark:border-white/10 rounded-[3rem] w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-[0_0_100px_-20px_rgba(245,158,11,0.2)] flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-10 bg-gradient-to-br from-amber-500/20 to-transparent flex justify-between items-center border-b border-border dark:border-white/5">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 rounded-full bg-amber-500 text-gray-950 text-[10px] font-black uppercase">Mission Prioritaire</span>
                    <span className="text-xs font-bold text-foreground dark:text-gray-500">ID: {selectedMission._id.slice(-8)}</span>
                  </div>
                  <h2 className="text-3xl font-black text-foreground dark:text-white leading-tight">Commande #{selectedMission.commandeId?.slice(-6).toUpperCase()}</h2>
                </div>
                <button 
                  onClick={() => setSelectedMission(null)}
                  className="w-14 h-14 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-center text-muted-foreground dark:text-gray-400 hover:text-foreground dark:text-white hover:bg-black/5 dark:bg-white/10 transition-all border border-border dark:border-white/5"
                >
                  <X className="w-8 h-8" />
                </button>
              </div>

              {/* Modal Scrollable Content */}
              <div className="p-10 overflow-y-auto space-y-10 custom-scrollbar">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {/* Left Column: Logistics */}
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-foreground dark:text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-amber-500" />
                        Logistique de Livraison
                      </h4>
                      <div className="p-6 rounded-3xl bg-black/5 dark:bg-white/5 border border-border dark:border-white/5 space-y-4">
                        <div className="flex gap-4">
                          <div className="flex flex-col items-center gap-1">
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                            <div className="w-0.5 h-10 bg-gradient-to-b from-amber-500 to-transparent" />
                          </div>
                          <div>
                            <p className="text-[10px] text-foreground dark:text-gray-500 font-black uppercase">Ramassage</p>
                            <p className="text-sm font-bold text-foreground dark:text-white">Entrepôt Central BMP - Tunis</p>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="w-2.5 h-2.5 rounded-full border-2 border-amber-500" />
                          </div>
                          <div>
                            <p className="text-[10px] text-foreground dark:text-gray-500 font-black uppercase">Arrivée</p>
                            <p className="text-sm font-bold text-foreground dark:text-white leading-snug">{selectedMission.adresse_livraison}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-border dark:border-white/5 text-center">
                        <p className="text-[10px] text-foreground dark:text-gray-500 font-black mb-1">Distance</p>
                        <p className="text-lg font-black text-foreground dark:text-white">{selectedMission.distance_km || 12.4} km</p>
                      </div>
                      <div className="p-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-border dark:border-white/5 text-center">
                        <p className="text-[10px] text-foreground dark:text-gray-500 font-black mb-1">Durée Est.</p>
                        <p className="text-lg font-black text-foreground dark:text-white">25 min</p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Financial & Order */}
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-foreground dark:text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        <Wallet className="w-3.5 h-3.5 text-amber-500" />
                        Transaction Financière
                      </h4>
                      <div className="p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 space-y-6">
                        <div className="flex justify-between items-center">
                          <p className="text-xs font-bold text-muted-foreground dark:text-gray-400">Mode :</p>
                          <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase">
                            {orderDetails?.mode_paiement === '50/50' ? 'Paiement 50/50' : 'Paiement Intégral'}
                          </span>
                        </div>
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-[10px] text-foreground dark:text-gray-500 font-black uppercase">À encaisser</p>
                            <p className="text-3xl font-black text-foreground dark:text-white">
                              {orderDetails?.mode_paiement === '50/50' ? (orderDetails?.montant_total / 2).toFixed(2) : '0.00'} 
                              <span className="text-sm ml-1 text-emerald-400">TND</span>
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-foreground dark:text-gray-500 font-black uppercase">Votre gain</p>
                            <p className="text-xl font-black text-amber-500">{selectedMission.cout_livraison || 45} TND</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-foreground dark:text-gray-500 uppercase tracking-widest">Articles Transportés</h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                        {orderDetails?.items?.map((item: any, i: number) => (
                          <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-border dark:border-white/5">
                            <span className="text-xs font-bold text-muted-foreground dark:text-gray-300">{item.produitNom || 'Produit'}</span>
                            <span className="text-xs font-black text-foreground dark:text-white">x{item.quantite}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interactive Map Section */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-foreground dark:text-gray-500 uppercase tracking-widest">Aperçu du Trajet</h4>
                  <div className="h-64 rounded-3xl overflow-hidden border border-border dark:border-white/10 relative">
                    <SmartMap delivery={selectedMission} />
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              {!activeTab.includes('my-deliveries') && (
                <div className="p-10 bg-black/5 dark:bg-white/5 border-t border-border dark:border-white/5 flex gap-6">
                  <button 
                    onClick={() => handleAcceptMission(selectedMission._id)}
                    className="flex-[3] py-6 rounded-2xl bg-amber-500 text-gray-950 font-black text-lg hover:bg-amber-400 transition-all shadow-2xl shadow-amber-500/20 flex items-center justify-center gap-3"
                  >
                    <CheckCircle2 className="w-6 h-6" />
                    Démarrer la mission
                  </button>
                  <button 
                    onClick={() => setSelectedMission(null)}
                    className="flex-1 py-6 rounded-2xl bg-black/5 dark:bg-white/5 border border-border dark:border-white/10 text-foreground dark:text-white font-black text-lg hover:bg-black/5 dark:bg-white/10 transition-all"
                  >
                    Fermer
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TruckDecoration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M10 17h4V5H2v12h3" />
      <path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5" />
      <circle cx="7.5" cy="17.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
    </svg>
  );
}
