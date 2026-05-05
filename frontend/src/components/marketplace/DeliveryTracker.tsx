'use client';

import { motion } from 'framer-motion';
import { Package, Truck, MapPin, CheckCircle, Clock } from 'lucide-react';

interface Delivery {
  statut: string;
  adresse_livraison: string;
  date_livraison_prevue?: string;
  livreur_nom?: string;
  livreur_telephone?: string;
  tracking_number?: string;
}

interface DeliveryTrackerProps {
  delivery: Delivery;
}

const steps = [
  { key: 'En préparation', icon: Package, label: 'Préparation', description: 'Votre commande est en cours de préparation' },
  { key: 'Expédiée', icon: Truck, label: 'Expédiée', description: 'Votre colis a quitté l\'entrepôt' },
  { key: 'En livraison', icon: MapPin, label: 'En livraison', description: 'Votre livreur est en route' },
  { key: 'Livrée', icon: CheckCircle, label: 'Livrée', description: 'Votre colis a été livré' },
];

export function DeliveryTracker({ delivery }: DeliveryTrackerProps) {
  const currentStepIndex = steps.findIndex(s => s.key === delivery.statut);
  
  return (
    <div className="space-y-6">
      {/* Timeline */}
      <div className="relative">
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-black/5 dark:bg-white/10">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-500"
            style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
          />
        </div>
        
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;
            
            return (
              <div key={step.key} className="flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isCompleted
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                      : 'bg-black/5 dark:bg-white/10 border border-border dark:border-white/20'
                  } ${isCurrent ? 'ring-4 ring-amber-500/30' : ''}`}
                >
                  <Icon className={`w-5 h-5 ${isCompleted ? 'text-gray-900' : 'text-foreground dark:text-gray-500'}`} />
                </motion.div>
                <p className={`text-xs font-medium mt-2 ${isCompleted ? 'text-amber-400' : 'text-foreground dark:text-gray-500'}`}>
                  {step.label}
                </p>
                <p className="text-[10px] text-gray-600 text-center max-w-[80px] hidden sm:block">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Informations livraison */}
      <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-border dark:border-white/10">
        <div>
          <p className="text-xs text-foreground dark:text-gray-500 mb-1">Adresse de livraison</p>
          <p className="text-sm text-foreground dark:text-white">{delivery.adresse_livraison}</p>
        </div>
        {delivery.date_livraison_prevue && (
          <div>
            <p className="text-xs text-foreground dark:text-gray-500 mb-1">Livraison prévue</p>
            <div className="flex items-center gap-1 text-sm text-amber-400">
              <Clock className="w-4 h-4" />
              {new Date(delivery.date_livraison_prevue).toLocaleDateString('fr-FR')}
            </div>
          </div>
        )}
        {delivery.livreur_nom && (
          <>
            <div>
              <p className="text-xs text-foreground dark:text-gray-500 mb-1">Livreur</p>
              <p className="text-sm text-foreground dark:text-white">{delivery.livreur_nom}</p>
            </div>
            {delivery.livreur_telephone && (
              <div>
                <p className="text-xs text-foreground dark:text-gray-500 mb-1">Contact</p>
                <a href={`tel:${delivery.livreur_telephone}`} className="text-sm text-amber-400 hover:underline">
                  {delivery.livreur_telephone}
                </a>
              </div>
            )}
          </>
        )}
        {delivery.tracking_number && (
          <div className="col-span-2">
            <p className="text-xs text-foreground dark:text-gray-500 mb-1">Numéro de suivi</p>
            <code className="text-sm text-foreground dark:text-white bg-black/5 dark:bg-black/30 px-2 py-1 rounded">{delivery.tracking_number}</code>
          </div>
        )}
      </div>
    </div>
  );
}