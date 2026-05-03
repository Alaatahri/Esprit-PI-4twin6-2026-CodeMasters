'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Package, Truck, MapPin, CheckCircle, Clock,
  Phone, ArrowLeft, Navigation, RefreshCw,
  ShoppingBag, Calendar, CreditCard, User
} from 'lucide-react';
import { marketplaceAPI, Order, DeliveryRequest } from '@/lib/marketplace-api';
import { RealMap } from '@/components/marketplace/RealMap';

export default function OrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [delivery, setDelivery] = useState<DeliveryRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const orderId = params.id as string;

  useEffect(() => {
    if (orderId) {
      loadOrderData();
    }
  }, [orderId]);

  const loadOrderData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Charger la commande
      const orderData = await marketplaceAPI.getOrder(orderId);
      console.log('Commande chargée:', orderData);
      setOrder(orderData);
      
      // Charger la livraison si elle existe
      try {
        const deliveryData = await marketplaceAPI.getDeliveryByOrder(orderId);
        console.log('Livraison chargée:', deliveryData);
        setDelivery(deliveryData);
      } catch (err) {
        console.log('Pas de livraison pour cette commande');
        setDelivery(null);
      }
    } catch (err) {
      console.error('Erreur chargement commande:', err);
      setError('Impossible de charger les détails de la commande');
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    setRefreshing(true);
    await loadOrderData();
    setRefreshing(false);
  };

  const getStatusText = () => {
    if (!order) return 'En attente';
    const statusMap: Record<string, string> = {
      'En attente': 'En attente de confirmation',
      'Payée': 'Payée - En préparation',
      'En préparation': 'En cours de préparation',
      'En livraison': 'En cours de livraison',
      'Livrée': 'Livrée avec succès'
    };
    return statusMap[order.statut] || order.statut;
  };

  const getStatusColor = () => {
    if (!order) return 'text-gray-400';
    const colorMap: Record<string, string> = {
      'En attente': 'text-gray-400',
      'Payée': 'text-blue-400',
      'En préparation': 'text-yellow-400',
      'En livraison': 'text-amber-400',
      'Livrée': 'text-emerald-400'
    };
    return colorMap[order.statut] || 'text-gray-400';
  };

  const getProgressWidth = () => {
    if (!order) return 0;
    const progressMap: Record<string, number> = {
      'En attente': 10,
      'Payée': 25,
      'En préparation': 50,
      'En livraison': 75,
      'Livrée': 100,
    };
    return progressMap[order.statut] || 0;
  };

  const steps = [
    { key: 'En attente', label: 'Commande confirmée', icon: ShoppingBag, description: 'Votre commande a été enregistrée' },
    { key: 'Payée', label: 'Paiement validé', icon: CreditCard, description: 'Votre paiement a été accepté' },
    { key: 'En préparation', label: 'Préparation', icon: Package, description: 'Préparation de votre commande' },
    { key: 'En livraison', label: 'En livraison', icon: Truck, description: 'Votre colis est en route' },
    { key: 'Livrée', label: 'Livrée', icon: CheckCircle, description: 'Colis livré avec succès' },
  ];

  const currentStepIndex = order ? steps.findIndex(s => s.key === order.statut) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-amber-500/50 border-t-amber-400 animate-spin" />
          <p className="text-gray-400">Chargement de la commande...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Commande non trouvée</h1>
          <p className="text-gray-400 mb-4">{error || "La commande que vous cherchez n'existe pas"}</p>
          <Link href="/espace/mes-commandes" className="text-amber-400 hover:text-amber-300">
            ← Retour à mes commandes
          </Link>
        </div>
      </div>
    );
  }

  // Coordonnées par défaut (Tunis)
  const defaultCoords = { lat: 36.8065, lng: 10.1815 };
  const startCoords = delivery?.adresse_depart || defaultCoords;
  const endCoords = delivery?.adresse_livraison || defaultCoords;
  const lastPosition = delivery?.historique_position?.[delivery.historique_position.length - 1];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link href="/espace/mes-commandes" className="text-gray-400 hover:text-amber-400">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">Suivi de commande</h1>
              <p className="text-sm text-gray-400">Commande #{order._id.slice(-8).toUpperCase()}</p>
            </div>
          </div>
          <button
            onClick={refresh}
            disabled={refreshing}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-amber-400 transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Statut */}
        <div className="mb-8 flex justify-center">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${getStatusColor()} bg-white/5 border border-white/10`}>
            <div className={`w-2 h-2 rounded-full ${
              getStatusColor() === 'text-emerald-400' ? 'bg-emerald-400' : 
              getStatusColor() === 'text-amber-400' ? 'bg-amber-400 animate-pulse' : 
              getStatusColor() === 'text-yellow-400' ? 'bg-yellow-400' : 
              getStatusColor() === 'text-blue-400' ? 'bg-blue-400' : 'bg-gray-400'
            }`} />
            <span className="text-sm font-medium">{getStatusText()}</span>
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-8">
          <div className="relative">
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-white/10">
              <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-500" style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }} />
            </div>
            <div className="relative flex justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;
                return (
                  <div key={step.key} className="flex flex-col items-center flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isCompleted ? 'bg-gradient-to-r from-amber-500 to-yellow-400' : 'bg-white/10 border border-white/20'
                    } ${isCurrent ? 'ring-4 ring-amber-500/30' : ''}`}>
                      <Icon className={`w-5 h-5 ${isCompleted ? 'text-gray-900' : 'text-gray-500'}`} />
                    </div>
                    <p className="text-xs font-medium mt-2 text-center hidden sm:block">{step.label}</p>
                    <p className="text-[10px] text-gray-500 text-center max-w-[100px] hidden md:block">{step.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Carte */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Navigation className="w-5 h-5 text-amber-400" />
            Itinéraire de livraison
          </h2>
          <RealMap
            startLat={startCoords.lat}
            startLng={startCoords.lng}
            endLat={endCoords.lat}
            endLng={endCoords.lng}
            currentLat={lastPosition?.lat}
            currentLng={lastPosition?.lng}
            title={order.statut === 'En livraison' ? '🚚 Livraison en cours' : '📍 Itinéraire'}
          />
        </div>

        {/* Détails */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Livraison */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-amber-400" />
              Détails livraison
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Adresse de livraison</p>
                <p className="text-sm text-white">{delivery?.adresse_livraison?.adresse || 'Non renseignée'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Distance</p>
                  <p className="text-sm text-white">{delivery?.distance_km?.toFixed(1) || '-'} km</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Frais de livraison</p>
                  <p className="text-sm text-amber-400">{delivery?.cout_livraison?.toFixed(2) || '0.00'} TND</p>
                </div>
              </div>
              {delivery?.chauffeur_nom && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Livreur</p>
                  <p className="text-sm text-white">{delivery.chauffeur_nom}</p>
                  {delivery.chauffeur_telephone && (
                    <a href={`tel:${delivery.chauffeur_telephone}`} className="text-sm text-blue-400 hover:underline">
                      {delivery.chauffeur_telephone}
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Commande */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-400" />
              Détails commande
            </h2>
            <div className="space-y-3">
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm py-1">
                      <span className="text-gray-400">
                        {item.produitNom || `Produit ${item.produitId.slice(-6)}`} x{item.quantite}
                      </span>
                      <span className="text-white">{(item.prix * item.quantite).toFixed(2)} TND</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">Chargement des articles...</p>
                )}
              </div>
              <div className="pt-3 border-t border-white/10 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Sous-total</span>
                  <span className="text-white">{order.montant_total.toFixed(2)} TND</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Livraison</span>
                  <span className="text-white">{delivery?.cout_livraison?.toFixed(2) || '0.00'} TND</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-white/10 font-bold">
                  <span className="text-white">Total</span>
                  <span className="text-amber-400 text-xl">{(order.montant_total + (delivery?.cout_livraison || 0)).toFixed(2)} TND</span>
                </div>
              </div>
              <div className="pt-3">
                <p className="text-xs text-gray-500 mb-1">Date de commande</p>
                <p className="text-sm text-white">{new Date(order.date_commande).toLocaleString('fr-FR')}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Support */}
        <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
          <p className="text-sm text-amber-400">
            Besoin d'aide ? Contactez notre service client au <a href="tel:+21670000000" className="font-bold underline">+216 70 000 000</a>
          </p>
          <p className="text-xs text-gray-500 mt-2">Disponible du lundi au vendredi de 8h à 17h</p>
        </div>
      </div>
    </div>
  );
}