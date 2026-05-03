'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Package, Truck, CheckCircle, Clock, Eye, ArrowRight, Calendar, CreditCard } from 'lucide-react';

interface OrderItem {
  _id: string;
  produitId: string;
  produitNom?: string;
  quantite: number;
  prix: number;
}

interface Order {
  _id: string;
  clientId: string;
  montant_total: number;
  statut: 'En attente' | 'Payée' | 'Livrée' | 'En préparation' | 'En livraison';
  date_commande: string;
  items: OrderItem[];
}

export default function MesCommandesPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      loadOrders();
    }
  }, [isMounted]);

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      // ⚠️ TEMPORAIRE : Afficher toutes les commandes (sans filtre client)
      const res = await fetch('http://localhost:3001/api/marketplace/commandes');
      
      if (!res.ok) {
        throw new Error(`Erreur HTTP: ${res.status}`);
      }
      
      const allOrders = await res.json();
      console.log('Toutes les commandes:', allOrders);
      console.log('Nombre de commandes:', allOrders.length);
      
      // Récupérer les items pour chaque commande
      const ordersWithItems = await Promise.all(
        allOrders.map(async (order: Order) => {
          try {
            const itemsRes = await fetch(`http://localhost:3001/api/marketplace/commandes/${order._id}/items`);
            if (itemsRes.ok) {
              order.items = await itemsRes.json();
            } else {
              order.items = [];
            }
          } catch (err) {
            console.error(`Erreur chargement items pour ${order._id}:`, err);
            order.items = [];
          }
          return order;
        })
      );
      
      setOrders(ordersWithItems);
    } catch (error) {
      console.error('Erreur chargement commandes:', error);
      setError('Impossible de charger les commandes. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (statut: string) => {
    const statusMap: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
      'En attente': { label: 'En attente', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', icon: <Clock className="w-3 h-3" /> },
      'Payée': { label: 'Payée', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: <CreditCard className="w-3 h-3" /> },
      'En préparation': { label: 'En préparation', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: <Package className="w-3 h-3" /> },
      'En livraison': { label: 'En livraison', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: <Truck className="w-3 h-3" /> },
      'Livrée': { label: 'Livrée', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: <CheckCircle className="w-3 h-3" /> },
    };
    
    const status = statusMap[statut] || statusMap['En attente'];
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${status.color}`}>
        {status.icon}
        {status.label}
      </span>
    );
  };

  const getProgressWidth = (statut: string) => {
    const progressMap: Record<string, number> = {
      'En attente': 10,
      'Payée': 25,
      'En préparation': 50,
      'En livraison': 75,
      'Livrée': 100,
    };
    return progressMap[statut] || 0;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isMounted || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-amber-500/50 border-t-amber-400 animate-spin" />
          <p className="text-gray-400">Chargement des commandes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
            <Package className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-red-400">{error}</p>
          <button
            onClick={loadOrders}
            className="mt-4 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-400 flex items-center justify-center">
              <Package className="w-5 h-5 text-gray-900" />
            </div>
            <h1 className="text-2xl font-bold text-white">Mes commandes</h1>
          </div>
          <p className="text-gray-500">Suivez l'état de vos commandes en temps réel</p>
          {orders.length > 0 && (
            <p className="text-xs text-gray-600 mt-2">Total: {orders.length} commande(s)</p>
          )}
        </div>

        {/* Liste des commandes */}
        {orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
              <Package className="w-10 h-10 text-gray-600" />
            </div>
            <p className="text-gray-500 text-lg">Aucune commande pour le moment</p>
            <p className="text-gray-600 text-sm mt-2">Commencez vos achats sur le marketplace</p>
            <Link
              href="/gestion-marketplace"
              className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-900 font-semibold hover:shadow-lg hover:shadow-amber-500/30 transition-all"
            >
              Découvrir le marketplace
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden hover:border-amber-500/30 transition-all duration-300"
              >
                {/* En-tête de la commande */}
                <div className="p-5 border-b border-white/10 bg-white/5">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Commande</p>
                      <p className="text-sm font-mono text-white font-medium">#{order._id.slice(-8).toUpperCase()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Date</p>
                      <p className="text-sm text-white flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-gray-500" />
                        {formatDate(order.date_commande)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Total</p>
                      <p className="text-lg font-bold text-amber-400">{order.montant_total.toFixed(2)} TND</p>
                    </div>
                    <div>
                      {getStatusBadge(order.statut)}
                    </div>
                  </div>
                </div>

                {/* Barre de progression */}
                <div className="px-5 pt-4">
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500"
                      style={{ width: `${getProgressWidth(order.statut)}%` }}
                    />
                  </div>
                </div>

                {/* Items de la commande */}
                <div className="p-5">
                  <p className="text-xs text-gray-500 mb-3">Articles commandés</p>
                  <div className="space-y-2">
                    {order.items && order.items.length > 0 ? (
                      order.items.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-gray-400">
                            {item.produitNom || `Produit ${item.produitId.slice(-6)}`} <span className="text-gray-500">x{item.quantite}</span>
                          </span>
                          <span className="text-white">{(item.prix * item.quantite).toFixed(2)} TND</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">Chargement des articles...</p>
                    )}
                    {order.items && order.items.length > 3 && (
                      <p className="text-xs text-gray-500 mt-1">+{order.items.length - 3} autre(s) article(s)</p>
                    )}
                  </div>
                </div>

                {/* ID Client (pour debug) */}
                <div className="px-5 pb-2">
                  <p className="text-xs text-gray-600">ID Client: {order.clientId}</p>
                </div>

                {/* Actions */}
                <div className="p-5 pt-0 flex justify-end">
                  <Link
                    href={`/gestion-marketplace/commande/${order._id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-amber-400 hover:border-amber-500/30 transition-all text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    Voir le détail
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}