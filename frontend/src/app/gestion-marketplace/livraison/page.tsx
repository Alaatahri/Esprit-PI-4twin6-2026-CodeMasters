'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Truck, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { DeliveryMap } from '@/components/marketplace/DeliveryMap';
import { VehicleSelector, Vehicle } from '@/components/marketplace/VehicleSelector';
import { useCartStore } from '@/lib/cart-store';
import { useDeliveryStore } from '@/lib/delivery-store';
import { deliveryService, Driver } from '@/lib/delivery-service';
import { marketplaceAPI } from '@/lib/marketplace-api';

export default function LivraisonPage() {
  const router = useRouter();
  const { items } = useCartStore();
  const { setLocation, setSelectedDriver, setDeliveryPrice, setDistance, location } = useDeliveryStore();
  
  const [step, setStep] = useState(1);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedDriver, setSelectedDriverState] = useState<Driver | null>(null);
  const [loading, setLoading] = useState(false);
  const [pickupLocation, setPickupLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [dropoffLocation, setDropoffLocation] = useState<{ lat: number; lng: number } | null>(
    location ? { lat: location.lat, lng: location.lng } : null
  );
  const [poidsTotal, setPoidsTotal] = useState(0);
  const [distance, setDistanceState] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Calculer le poids total des produits
  useEffect(() => {
    const total = items.reduce((sum, item) => sum + (item.poids_kg || 0) * item.quantite, 0);
    setPoidsTotal(total);
  }, [items]);

  // Récupérer l'emplacement du premier produit (point de départ)
  useEffect(() => {
    const getPickupLocation = async () => {
      if (items.length > 0 && items[0].productId) {
        try {
          const product = await marketplaceAPI.getProduct(items[0].productId);
          if (product.emplacement) {
            setPickupLocation({
              lat: product.emplacement.lat,
              lng: product.emplacement.lng
            });
          } else {
            setPickupLocation({ lat: 36.8065, lng: 10.1815 });
          }
        } catch (error) {
          console.error('Erreur récupération produit:', error);
          setPickupLocation({ lat: 36.8065, lng: 10.1815 });
        }
      } else {
        setPickupLocation({ lat: 36.8065, lng: 10.1815 });
      }
    };
    getPickupLocation();
  }, [items]);

  // Rechercher les livreurs quand la destination change
  useEffect(() => {
    const searchDrivers = async () => {
      if (pickupLocation && dropoffLocation) {
        setLoading(true);
        try {
          const nearbyDrivers = await deliveryService.getNearbyDrivers(
            pickupLocation.lat,
            pickupLocation.lng,
            dropoffLocation.lat,
            dropoffLocation.lng,
            poidsTotal
          );
          setDrivers(nearbyDrivers);
          
          const dist = calculateDistance(
            pickupLocation.lat,
            pickupLocation.lng,
            dropoffLocation.lat,
            dropoffLocation.lng
          );
          setDistanceState(dist);
          setDistance(dist);
        } catch (error) {
          console.error('Erreur recherche livreurs:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    searchDrivers();
  }, [pickupLocation, dropoffLocation, poidsTotal, setDistance]);

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleDestinationSelect = (lat: number, lng: number) => {
    console.log('Destination sélectionnée:', lat, lng);
    setDropoffLocation({ lat, lng });
    setLocation({
      lat,
      lng,
      adresse: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
    });
  };

  const handleDriverSelect = (driver: Driver) => {
    setSelectedDriverState(driver);
    setSelectedDriver(driver._id);
    setDeliveryPrice(driver.prix_livraison);
  };

  const convertToVehicle = (driver: Driver | null): Vehicle | null => {
    if (!driver) return null;
    return {
      _id: driver._id,
      nom: driver.nom,
      type: driver.vehicule.type,
      capacite_tonnes: driver.vehicule.capacite_tonnes,
      prix_km: driver.prix_par_km,
      prix_base: 0,
      position_actuelle: driver.position_actuelle,
      disponible: driver.disponible,
      chauffeur: driver.nom,
      telephone_chauffeur: driver.telephone,
      immatriculation: driver.vehicule.immatriculation,
      note_moyenne: driver.note,
      nombre_courses: driver.nombre_courses,
    };
  };

  const handleNext = () => {
    if (step === 1 && dropoffLocation) {
      setStep(2);
    } else if (step === 2 && selectedDriver) {
      router.push('/gestion-marketplace/checkout');
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else {
      router.back();
    }
  };

  // Rediriger si le panier est vide
  useEffect(() => {
    if (items.length === 0) {
      router.push('/gestion-marketplace');
    }
  }, [items, router]);

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-gray-400">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-400 hover:text-amber-400 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
          <h1 className="text-2xl font-bold text-white">Finaliser la commande</h1>
          <p className="text-gray-500 mt-1">Livraison et paiement sécurisé</p>
        </div>

        {/* Steps */}
        <div className="flex items-center justify-between mb-8 max-w-md mx-auto">
          {[
            { num: 1, label: 'Livraison', icon: MapPin },
            { num: 2, label: 'Véhicule', icon: Truck },
            { num: 3, label: 'Paiement', icon: CheckCircle },
          ].map((stepItem) => (
            <div key={stepItem.num} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                  step >= stepItem.num
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-900'
                    : 'bg-white/10 text-gray-500'
                }`}
              >
                {step > stepItem.num ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <stepItem.icon className="w-5 h-5" />
                )}
              </div>
              <span
                className={`ml-2 text-sm font-medium hidden sm:inline ${
                  step >= stepItem.num ? 'text-white' : 'text-gray-500'
                }`}
              >
                {stepItem.label}
              </span>
              {stepItem.num < 3 && (
                <div className="w-12 h-px bg-white/10 mx-3 hidden sm:block" />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Map */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                Choisissez votre adresse de livraison
              </h2>
              <p className="text-sm text-gray-400 mb-4">
                Cliquez sur la carte pour sélectionner l'emplacement exact de livraison
              </p>
              
              {pickupLocation && (
                <DeliveryMap
                  pickupLat={pickupLocation.lat}
                  pickupLng={pickupLocation.lng}
                  dropoffLat={dropoffLocation?.lat || pickupLocation.lat}
                  dropoffLng={dropoffLocation?.lng || pickupLocation.lng}
                  drivers={[]}
                  onDriverSelect={() => {}}
                  onMapClick={handleDestinationSelect}
                  height="400px"
                />
              )}

              {dropoffLocation && (
                <div className="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm font-medium">Adresse sélectionnée</span>
                  </div>
                  <p className="text-white text-sm mt-1">
                    Latitude: {dropoffLocation.lat.toFixed(6)}<br />
                    Longitude: {dropoffLocation.lng.toFixed(6)}
                  </p>
                  <p className="text-gray-400 text-xs mt-2">
                    💡 Vous pouvez modifier l'adresse en cliquant sur la carte
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleNext}
                disabled={!dropoffLocation}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-900 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-amber-500/30 transition-all"
              >
                Continuer
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Vehicle selection */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                Choisissez votre véhicule de livraison
              </h2>
              
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 rounded-full border-2 border-amber-500/50 border-t-amber-400 animate-spin" />
                </div>
              ) : drivers.length > 0 ? (
                <VehicleSelector
                  vehicles={drivers.map(d => convertToVehicle(d)!)}
                  selectedVehicle={convertToVehicle(selectedDriver)}
                  onSelect={(v) => {
                    const driver = drivers.find(d => d._id === v._id);
                    if (driver) handleDriverSelect(driver);
                  }}
                  poidsTotal={poidsTotal}
                />
              ) : (
                <div className="text-center py-12">
                  <Truck className="w-12 h-12 mx-auto text-gray-600 mb-3" />
                  <p className="text-gray-500">Aucun véhicule disponible pour le moment</p>
                  <p className="text-gray-600 text-sm mt-2">Poids total: {poidsTotal} kg</p>
                </div>
              )}

              {selectedDriver && (
                <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                  <h3 className="font-medium text-amber-400 mb-2">Résumé de la livraison</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Distance</span>
                      <span className="text-white">{distance.toFixed(1)} km</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Livreur</span>
                      <span className="text-white">{selectedDriver.nom}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Véhicule</span>
                      <span className="text-white">{selectedDriver.vehicule.type}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-amber-500/20">
                      <span className="font-medium text-white">Prix livraison</span>
                      <span className="font-bold text-amber-400">{selectedDriver.prix_livraison} TND</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour
              </button>
              <button
                onClick={handleNext}
                disabled={!selectedDriver}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-900 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-amber-500/30 transition-all"
              >
                Continuer
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}