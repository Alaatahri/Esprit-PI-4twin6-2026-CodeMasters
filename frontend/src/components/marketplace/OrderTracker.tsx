'use client';

import { motion } from 'framer-motion';
import { Package, Truck, CheckCircle, Clock } from 'lucide-react';

interface OrderTrackerProps {
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  createdAt: string;
  estimatedDelivery?: string;
}

const steps = [
  { key: 'pending', label: 'Commande confirmée', icon: Package, description: 'Votre commande est enregistrée' },
  { key: 'processing', label: 'Préparation', icon: Clock, description: 'Votre commande est en cours de préparation' },
  { key: 'shipped', label: 'En livraison', icon: Truck, description: 'Votre colis est en route' },
  { key: 'delivered', label: 'Livrée', icon: CheckCircle, description: 'Colis livré avec succès' },
];

export function OrderTracker({ status, createdAt, estimatedDelivery }: OrderTrackerProps) {
  const currentStepIndex = steps.findIndex(s => s.key === status);
  
  return (
    <div className="space-y-6">
      {/* Timeline */}
      <div className="relative">
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-white/10">
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
              <div key={step.key} className="flex flex-col items-center flex-1">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isCompleted
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                      : 'bg-white/10 border border-white/20'
                  } ${isCurrent ? 'ring-4 ring-amber-500/30' : ''}`}
                >
                  <Icon className={`w-5 h-5 ${isCompleted ? 'text-gray-900' : 'text-gray-500'}`} />
                </motion.div>
                <p className="text-xs font-medium mt-2 text-center hidden sm:block">{step.label}</p>
                <p className="text-[10px] text-gray-500 text-center max-w-[80px] hidden sm:block">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Informations supplémentaires */}
      <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
        <div>
          <p className="text-xs text-gray-500 mb-1">Date de commande</p>
          <p className="text-sm text-white">{new Date(createdAt).toLocaleString('fr-FR')}</p>
        </div>
        {estimatedDelivery && (
          <div>
            <p className="text-xs text-gray-500 mb-1">Livraison estimée</p>
            <p className="text-sm text-amber-400">{new Date(estimatedDelivery).toLocaleDateString('fr-FR')}</p>
          </div>
        )}
      </div>
    </div>
  );
}