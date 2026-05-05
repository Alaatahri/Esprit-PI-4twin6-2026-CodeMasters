'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Truck, CreditCard, CheckCircle, Package } from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';
import { useDeliveryStore } from '@/lib/delivery-store';
import {
  PaymentForm,
  PaymentData,
  validatePaymentData,
} from '@/components/marketplace/PaymentForm';
import { marketplaceAPI } from '@/lib/marketplace-api';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCartStore();
  const { location, selectedDriverId, deliveryPrice, distance } = useDeliveryStore();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'full' | 'half'>('full');
  const [isMounted, setIsMounted] = useState(false);
  const [clientId, setClientId] = useState<string | null>(null);

  const subtotal = getTotal();
  const total = subtotal + deliveryPrice;

  useEffect(() => {
    setIsMounted(true);
    
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setClientId(user._id || user.id);
      } catch (e) {
        console.error('Erreur parsing user:', e);
        setClientId('67f8a1b2c3d4e5f6a7b8c9d0');
      }
    } else {
      setClientId('67f8a1b2c3d4e5f6a7b8c9d0');
    }
  }, []);

  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    if (isMounted && items.length === 0 && !paymentSuccess) {
      router.push('/gestion-marketplace');
    }
  }, [items, router, isMounted, paymentSuccess]);

  useEffect(() => {
    if (isMounted && !location) {
      router.push('/gestion-marketplace/livraison');
    }
  }, [location, router, isMounted]);

  const handlePayment = async (paymentData: PaymentData) => {
    const payErr = validatePaymentData(paymentData);
    if (payErr) {
      alert(payErr);
      return;
    }

    let currentClientId = clientId;
    if (!currentClientId) {
      currentClientId = '67f8a1b2c3d4e5f6a7b8c9d0';
    }

    if (!location) {
      alert('Veuillez sélectionner une adresse de livraison');
      router.push('/gestion-marketplace/livraison');
      return;
    }

    if (!selectedDriverId) {
      alert('Veuillez sélectionner un livreur');
      router.push('/gestion-marketplace/livraison');
      return;
    }

    if (items.length === 0) {
      alert('Votre panier est vide');
      router.push('/gestion-marketplace');
      return;
    }

    setLoading(true);
    try {
      // Validation de l'ID du véhicule (doit être un ID MongoDB valide)
      const isValidMongoId = (id: string | null) => {
        if (!id) return false;
        return /^[0-9a-fA-F]{24}$/.test(id);
      };

      const validVehicleId = isValidMongoId(selectedDriverId) ? selectedDriverId : undefined;

      // Créer la commande
      const orderItems = items.map(item => ({
        produitId: item.productId,
        quantite: item.quantite,
      }));

      const orderData = {
        clientId: currentClientId,
        items: orderItems,
        mode_paiement: paymentMethod === 'half' ? '50/50' : '100%',
        vehicleId: validVehicleId as any,
        prix_livraison: deliveryPrice,
      };
      
      console.log('Création commande:', orderData);
      const order = await marketplaceAPI.createOrder(orderData);
      console.log('Commande créée:', order);
      
      if (order && order._id) {
        const deliveryData = {
          adresse_livraison: location.adresse || `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`,
          coordonnees: {
            lat: location.lat,
            lng: location.lng,
          },
          vehicleId: validVehicleId,
          distance_km: distance,
          cout_livraison: deliveryPrice,
        };
        
        console.log('Création livraison:', deliveryData);
        await marketplaceAPI.createDelivery(order._id, deliveryData);
      }
      
      setPaymentSuccess(true);
      clearCart();
      router.push(`/gestion-marketplace/commande/${order._id}/success`);
    } catch (error) {
      console.error('Erreur paiement:', error);
      alert('Une erreur est survenue lors du paiement. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-amber-500/50 border-t-amber-400 animate-spin" />
          <p className="text-muted-foreground dark:text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Link
            href="/gestion-marketplace/livraison"
            className="inline-flex items-center gap-2 text-muted-foreground dark:text-gray-400 hover:text-amber-400 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à la livraison
          </Link>
          <h1 className="text-2xl font-bold text-foreground dark:text-white">Paiement sécurisé</h1>
          <p className="text-foreground dark:text-gray-500 mt-1">Finalisez votre commande en toute sécurité</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {location && (
              <div className="rounded-2xl border border-border dark:border-white/10 bg-black/5 dark:bg-white/5 p-6">
                <div className="flex items-center gap-2 text-emerald-400 mb-3">
                  <MapPin className="w-5 h-5" />
                  <h2 className="font-semibold">Adresse de livraison</h2>
                </div>
                <div className="pl-7">
                  <p className="text-foreground dark:text-white font-mono text-sm">
                    📍 {location.lat.toFixed(6)}°, {location.lng.toFixed(6)}°
                  </p>
                  <p className="text-muted-foreground dark:text-gray-400 text-xs mt-1">
                    Position sélectionnée sur la carte
                  </p>
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-border dark:border-white/10 bg-black/5 dark:bg-white/5 p-6">
              <div className="flex items-center gap-2 text-amber-400 mb-4">
                <CreditCard className="w-5 h-5" />
                <h2 className="font-semibold">Mode de paiement</h2>
              </div>
              
              <div className="space-y-3 mb-6">
                <label className="flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all bg-black/5 dark:bg-white/5 border-border dark:border-white/10 hover:border-amber-500/30">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMode"
                      checked={paymentMethod === 'full'}
                      onChange={() => setPaymentMethod('full')}
                      className="w-4 h-4 text-amber-500"
                    />
                    <div>
                      <p className="font-medium text-foreground dark:text-white">Paiement complet</p>
                      <p className="text-xs text-foreground dark:text-gray-500">Payer la totalité maintenant</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-amber-400">{total.toFixed(2)} TND</span>
                </label>
                
                <label className="flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all bg-black/5 dark:bg-white/5 border-border dark:border-white/10 hover:border-amber-500/30">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMode"
                      checked={paymentMethod === 'half'}
                      onChange={() => setPaymentMethod('half')}
                      className="w-4 h-4 text-amber-500"
                    />
                    <div>
                      <p className="font-medium text-foreground dark:text-white">50% maintenant / 50% à la livraison</p>
                      <p className="text-xs text-foreground dark:text-gray-500">Payer la moitié maintenant, le reste à la réception</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-amber-400">{(total / 2).toFixed(2)} TND</span>
                    <p className="text-xs text-foreground dark:text-gray-500">+ {(total / 2).toFixed(2)} TND à la livraison</p>
                  </div>
                </label>
              </div>

              <PaymentForm
                amount={paymentMethod === 'full' ? total : total / 2}
                onSubmit={handlePayment}
                loading={loading}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-border dark:border-white/10 bg-black/5 dark:bg-white/5 p-6 sticky top-24">
              <h2 className="font-semibold text-foreground dark:text-white mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-400" />
                Résumé de la commande
              </h2>
              
              <div className="space-y-3 max-h-64 overflow-y-auto mb-4 pr-2">
                {items.map((item) => (
                  <div key={item.productId} className="flex justify-between text-sm py-1">
                    <span className="text-muted-foreground dark:text-gray-400">
                      {item.nom} <span className="text-foreground dark:text-gray-500">x{item.quantite}</span>
                    </span>
                    <span className="text-foreground dark:text-white">{(item.prix * item.quantite).toFixed(2)} TND</span>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-border dark:border-white/10 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground dark:text-gray-400">Sous-total</span>
                  <span className="text-foreground dark:text-white">{subtotal.toFixed(2)} TND</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground dark:text-gray-400 flex items-center gap-1">
                    <Truck className="w-3 h-3" />
                    Livraison
                  </span>
                  <span className="text-foreground dark:text-white">{deliveryPrice.toFixed(2)} TND</span>
                </div>
                {distance > 0 && (
                  <div className="flex justify-between text-xs text-foreground dark:text-gray-500">
                    <span>Distance</span>
                    <span>{distance.toFixed(1)} km</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-border dark:border-white/10">
                  <span className="font-semibold text-foreground dark:text-white">Total</span>
                  <span className="text-xl font-bold text-amber-400">{total.toFixed(2)} TND</span>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <div className="flex items-center gap-2 text-emerald-400 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-medium">Paiement sécurisé</span>
                </div>
                <p className="text-muted-foreground dark:text-gray-400 text-xs mt-1">
                  Vos informations bancaires sont cryptées et sécurisées
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}