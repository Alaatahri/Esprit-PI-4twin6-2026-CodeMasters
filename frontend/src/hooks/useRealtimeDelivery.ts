import { useState, useEffect, useCallback } from 'react';

interface DeliveryPosition {
  lat: number;
  lng: number;
  timestamp: Date;
  status: string;
}

export function useRealtimeDelivery(orderId: string, refreshInterval: number = 10000) {
  const [position, setPosition] = useState<DeliveryPosition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosition = useCallback(async () => {
    if (!orderId) return;
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/marketplace/delivery-requests/by-order/${orderId}`);
      if (!res.ok) throw new Error('Erreur chargement position');
      
      const data = await res.json();
      
      if (data.historique_position && data.historique_position.length > 0) {
        const lastPosition = data.historique_position[data.historique_position.length - 1];
        setPosition({
          lat: lastPosition.lat,
          lng: lastPosition.lng,
          timestamp: new Date(lastPosition.timestamp),
          status: data.statut,
        });
      }
      
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchPosition();
    
    const interval = setInterval(fetchPosition, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchPosition, refreshInterval]);

  return { position, loading, error, refresh: fetchPosition };
}