import { useState, useEffect } from 'react';
import { marketplaceAPI, Delivery } from '@/lib/marketplace-api';

export function useDelivery(orderId: string) {
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;
    
    const fetchDelivery = async () => {
      try {
        const data = await marketplaceAPI.getDeliveryByOrder(orderId);
        setDelivery(data);
      } catch (err) {
        setError('Erreur chargement livraison');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDelivery();
    
    // Polling pour mise à jour temps réel
    const interval = setInterval(fetchDelivery, 30000);
    return () => clearInterval(interval);
  }, [orderId]);

  return { delivery, loading, error };
}