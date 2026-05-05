'use client';

import { motion } from 'framer-motion';
import { Truck, Weight, MapPin, CheckCircle } from 'lucide-react';

export interface Vehicle {
  _id: string;
  nom: string;
  type: string;
  capacite_tonnes: number;
  prix_km: number;
  prix_base: number;
  position_actuelle: { lat: number; lng: number };
  disponible: boolean;
  image_url?: string;
  chauffeur?: string;           // ✅ Ajouté
  telephone_chauffeur?: string; // ✅ Ajouté
  immatriculation?: string;     // ✅ Ajouté
  note_moyenne?: number;        // ✅ Ajouté
  nombre_courses?: number;      // ✅ Ajouté
}

interface VehicleSelectorProps {
  vehicles: Vehicle[];
  selectedVehicle: Vehicle | null;
  onSelect: (vehicle: Vehicle) => void;
  poidsTotal: number;
}

export function VehicleSelector({ vehicles, selectedVehicle, onSelect, poidsTotal }: VehicleSelectorProps) {
  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'camion_remorque':
        return '🚛';
      case 'camion_benne':
        return '🚚';
      case 'camion_toupie':
        return '🥄';
      default:
        return '🚐';
    }
  };

  const getVehicleTypeName = (type: string) => {
    switch (type) {
      case 'camion_remorque':
        return 'Camion avec remorque';
      case 'camion_benne':
        return 'Camion benne';
      case 'camion_toupie':
        return 'Camion toupie';
      default:
        return 'Utilitaire';
    }
  };

  if (!vehicles || vehicles.length === 0) {
    return (
      <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-center">
        <p className="text-sm text-yellow-400">Aucun véhicule disponible pour le moment</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-muted-foreground dark:text-gray-300">
        Choisissez votre véhicule de livraison
      </label>
      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {vehicles.map((vehicle) => {
          // poidsTotal est en kg, capacite_tonnes en tonnes
          const canTransport = poidsTotal <= vehicle.capacite_tonnes * 1000;
          const isSelected = selectedVehicle?._id === vehicle._id;
          
          return (
            <motion.div
              key={vehicle._id}
              whileHover={{ scale: canTransport ? 1.01 : 1 }}
              onClick={() => canTransport && onSelect(vehicle)}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'border-amber-500 bg-amber-500/10'
                  : canTransport
                  ? 'border-border dark:border-white/10 bg-black/5 dark:bg-white/5 hover:border-amber-500/30'
                  : 'border-red-500/30 bg-red-500/5 opacity-60 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="text-3xl">{getVehicleIcon(vehicle.type)}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-foreground dark:text-white">{vehicle.nom}</p>
                    {canTransport ? (
                      <span className="text-xs text-emerald-400 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Disponible
                      </span>
                    ) : (
                      <span className="text-xs text-red-400">Capacité insuffisante</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground dark:text-gray-400">{getVehicleTypeName(vehicle.type)}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs">
                    <span className="flex items-center gap-1 text-muted-foreground dark:text-gray-400">
                      <Weight className="w-3 h-3" />
                      {vehicle.capacite_tonnes} tonnes
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground dark:text-gray-400">
                      <MapPin className="w-3 h-3" />
                      {vehicle.position_actuelle?.lat?.toFixed(2) || '36.80'}, {vehicle.position_actuelle?.lng?.toFixed(2) || '10.18'}
                    </span>
                  </div>
                  {vehicle.chauffeur && (
                    <div className="text-xs text-foreground dark:text-gray-500 mt-1">
                      👨‍✈️ {vehicle.chauffeur} {vehicle.telephone_chauffeur && `· 📞 ${vehicle.telephone_chauffeur}`}
                    </div>
                  )}
                  {isSelected && (
                    <div className="mt-2 pt-2 border-t border-border dark:border-white/10">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-foreground dark:text-gray-500">Prix de base</p>
                          <p className="text-foreground dark:text-white font-medium">{vehicle.prix_base} TND</p>
                        </div>
                        <div>
                          <p className="text-foreground dark:text-gray-500">Prix au km</p>
                          <p className="text-foreground dark:text-white font-medium">{vehicle.prix_km} TND/km</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}