'use client';

import { useCartStore } from '@/lib/cart-store';
import { useEffect, useState } from 'react';

export function CartCounter() {
  const getItemCount = useCartStore((state) => state.getItemCount);
  const [count, setCount] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setCount(getItemCount());
  }, [getItemCount]);

  useEffect(() => {
    if (isMounted) {
      setCount(getItemCount());
    }
  }, [getItemCount, isMounted]);

  // Pendant l'hydratation, ne rien afficher
  if (!isMounted) {
    return null;
  }

  // Si le panier est vide, ne rien afficher
  if (count === 0) {
    return null;
  }

  return (
    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-foreground dark:text-white text-xs flex items-center justify-center">
      {count > 99 ? '99+' : count}
    </span>
  );
}