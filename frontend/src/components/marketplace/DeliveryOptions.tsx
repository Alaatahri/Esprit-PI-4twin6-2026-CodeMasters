'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Calendar, Truck, Package } from 'lucide-react';

interface DeliveryOption {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  icon: React.ReactNode;
}

interface DeliveryOptionsProps {
  onSelect: (option: DeliveryOption) => void;
  selectedId?: string;
}

const deliveryOptions: DeliveryOption[] = [
  {
    id: 'standard',
    name: 'Livraison standard',
    description: 'Livraison sous 3-5 jours ouvrés',
    price: 0,
    duration: '3-5 jours',
    icon: <Package className="w-5 h-5" />,
  },
  {
    id: 'express',
    name: 'Livraison express',
    description: 'Livraison sous 24-48h',
    price: 29,
    duration: '24-48h',
    icon: <Truck className="w-5 h-5" />,
  },
  {
    id: 'premium',
    name: 'Livraison premium',
    description: 'Livraison le jour même (avant 18h)',
    price: 59,
    duration: 'Jour même',
    icon: <Clock className="w-5 h-5" />,
  },
];

export function DeliveryOptions({ onSelect, selectedId }: DeliveryOptionsProps) {
  const [selected, setSelected] = useState<string | undefined>(selectedId);

  const handleSelect = (option: DeliveryOption) => {
    setSelected(option.id);
    onSelect(option);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-muted-foreground dark:text-gray-300">
        Options de livraison
      </label>
      <div className="grid gap-3">
        {deliveryOptions.map((option) => (
          <motion.div
            key={option.id}
            whileHover={{ scale: 1.01 }}
            onClick={() => handleSelect(option)}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              selected === option.id
                ? 'border-amber-500 bg-amber-500/10'
                : 'border-border dark:border-white/10 bg-black/5 dark:bg-white/5 hover:border-amber-500/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  selected === option.id ? 'bg-amber-500/20 text-amber-400' : 'bg-black/5 dark:bg-white/10 text-muted-foreground dark:text-gray-400'
                }`}>
                  {option.icon}
                </div>
                <div>
                  <p className="font-medium text-foreground dark:text-white">{option.name}</p>
                  <p className="text-xs text-muted-foreground dark:text-gray-400">{option.description}</p>
                  <p className="text-xs text-amber-400 mt-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {option.duration}
                  </p>
                </div>
              </div>
              <div className="text-right">
                {option.price === 0 ? (
                  <span className="text-sm text-emerald-400 font-medium">Gratuite</span>
                ) : (
                  <span className="text-lg font-bold text-amber-400">{option.price} TND</span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}