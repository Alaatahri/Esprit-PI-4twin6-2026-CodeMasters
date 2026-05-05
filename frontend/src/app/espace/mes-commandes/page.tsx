'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Package, Truck, CheckCircle, Clock, Eye, ArrowRight, Calendar, CreditCard } from 'lucide-react';
import { getStoredUser } from '@/lib/auth';
import { getApiBaseUrl } from '@/lib/api-base';

const API_URL = getApiBaseUrl();

/** Mise à jour statuts commandes sans recharger toute la page */
const ORDERS_POLL_MS = 20_000;

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

  const loadOrders = useCallback(async (opts?: { silent?: boolean }) => {
    const silent = opts?.silent === true;
    const user = getStoredUser();
    if (!user) {
      setOrders([]);
      if (!silent) setLoading(false);
      return;
    }

    if (!silent) {
      setLoading(true);
      setError(null);
    }
    try {
      const qs = new URLSearchParams({ clientId: user._id });
      const res = await fetch(`${API_URL}/marketplace/commandes?${qs.toString()}`, {
        cache: 'no-store',
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const allOrders = (await res.json()) as Order[];

      const ordersWithItems = await Promise.all(
        allOrders.map(async (order: Order) => {
          try {
            const itemsRes = await fetch(
              `${API_URL}/marketplace/commandes/${order._id}/items`,
              { cache: 'no-store' },
            );
            if (itemsRes.ok) {
              order.items = await itemsRes.json();
            } else {
              order.items = [];
            }
          } catch {
            order.items = [];
          }
          return order;
        }),
      );

      setOrders(ordersWithItems);
    } catch {
      if (!silent) setError('Unable to load orders. Please try again.');
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    const user = getStoredUser();
    if (!user) {
      router.replace('/login?redirect=/espace/mes-commandes');
      setLoading(false);
      return;
    }
    void loadOrders();
  }, [isMounted, router, loadOrders]);

  useEffect(() => {
    if (!isMounted) return;
    if (!getStoredUser()) return;

    const runSilent = () => {
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;
      void loadOrders({ silent: true });
    };

    const intervalId = window.setInterval(runSilent, ORDERS_POLL_MS);
    const onVisibility = () => {
      if (document.visibilityState === 'visible') runSilent();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [isMounted, loadOrders]);

  const getStatusBadge = (statut: string) => {
    const statusMap: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
      'En attente': { label: 'Pending', color: 'bg-gray-500/20 text-muted-foreground dark:text-gray-400 border-gray-500/30', icon: <Clock className="w-3 h-3" /> },
      'Payée': { label: 'Paid', color: 'bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30', icon: <CreditCard className="w-3 h-3" /> },
      'En préparation': { label: 'Preparing', color: 'bg-yellow-500/20 text-yellow-800 dark:text-yellow-400 border-yellow-500/30', icon: <Package className="w-3 h-3" /> },
      'En livraison': { label: 'Shipping', color: 'bg-amber-500/20 text-amber-800 dark:text-amber-400 border-amber-500/30', icon: <Truck className="w-3 h-3" /> },
      'Livrée': { label: 'Delivered', color: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/30', icon: <CheckCircle className="w-3 h-3" /> },
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
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isMounted || loading) {
    return (
      <div className="min-h-screen bg-background text-foreground dark:bg-gradient-to-b dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-amber-500/50 border-t-amber-400 animate-spin" />
          <p className="text-muted-foreground dark:text-gray-400">Loading orders…</p>
        </div>
      </div>
    );
  }

  if (!getStoredUser()) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground dark:bg-gradient-to-b dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
            <Package className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-red-700 dark:text-red-400">{error}</p>
          <button
            type="button"
            onClick={() => void loadOrders()}
            className="mt-4 px-4 py-2 rounded-xl bg-muted border border-border text-foreground hover:bg-muted/80 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground dark:bg-gradient-to-b dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 dark:text-white">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-400 flex items-center justify-center">
              <Package className="w-5 h-5 text-gray-900" />
            </div>
            <h1 className="text-2xl font-bold text-foreground dark:text-white">My orders</h1>
          </div>
          <p className="text-muted-foreground dark:text-gray-500">Signed-in client orders only</p>
          {orders.length > 0 && (
            <p className="text-xs text-muted-foreground mt-2">Total: {orders.length}</p>
          )}
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Package className="w-10 h-10 text-muted-foreground" />
            </div>
            <p className="text-foreground dark:text-gray-500 text-lg">No orders yet</p>
            <p className="text-muted-foreground text-sm mt-2">Browse the marketplace to place an order</p>
            <Link
              href="/gestion-marketplace"
              className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-900 font-semibold hover:shadow-lg hover:shadow-amber-500/30 transition-all"
            >
              Go to marketplace
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="rounded-2xl border border-border/60 bg-card shadow-bmp-sm backdrop-blur-sm overflow-hidden hover:border-brand/35 transition-all duration-300 dark:border-white/10 dark:bg-white/5 dark:shadow-none dark:hover:border-amber-500/30"
              >
                <div className="p-5 border-b border-border/60 bg-muted/30 dark:border-white/10 dark:bg-white/5">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground dark:text-gray-500">Order</p>
                      <p className="text-sm font-mono text-foreground dark:text-white font-medium">
                        #{order._id.slice(-8).toUpperCase()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground dark:text-gray-500">Date</p>
                      <p className="text-sm text-foreground dark:text-white flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        {formatDate(order.date_commande)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground dark:text-gray-500">Total</p>
                      <p className="text-lg font-bold text-brand">{order.montant_total.toFixed(2)} TND</p>
                    </div>
                    <div>{getStatusBadge(order.statut)}</div>
                  </div>
                </div>

                <div className="px-5 pt-4">
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500"
                      style={{ width: `${getProgressWidth(order.statut)}%` }}
                    />
                  </div>
                </div>

                <div className="p-5">
                  <p className="text-xs text-muted-foreground mb-3">Line items</p>
                  <div className="space-y-2">
                    {order.items && order.items.length > 0 ? (
                      order.items.slice(0, 6).map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-muted-foreground dark:text-gray-400">
                            {item.produitNom || `Product ${String(item.produitId).slice(-6)}`}{' '}
                            <span className="text-foreground dark:text-gray-500">×{item.quantite}</span>
                          </span>
                          <span className="text-foreground dark:text-white">
                            {(item.prix * item.quantite).toFixed(2)} TND
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">Loading items…</p>
                    )}
                    {order.items && order.items.length > 6 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        +{order.items.length - 6} more
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-5 pt-0 flex justify-end">
                  <Link
                    href={`/gestion-marketplace/commande/${order._id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-muted border border-border text-muted-foreground hover:text-brand hover:border-brand/35 transition-all text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    Details
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
