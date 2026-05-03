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

  if (!isMounted) {
    return null;
  }

  if (count === 0) {
    return null;
  }

  return (
    <span className="absolute -top-2 -right-2 min-w-[1.25rem] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow-lg shadow-red-500/30">
      {count > 99 ? '99+' : count}
    </span>
  );
}