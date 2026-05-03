'use client';

import { useState, useEffect } from 'react';
import { Navigation, Truck, MapPin } from 'lucide-react';

interface RealMapProps {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  currentLat?: number;
  currentLng?: number;
  title?: string;
  height?: string;
}

export function RealMap({ 
  startLat, 
  startLng, 
  endLat, 
  endLng, 
  currentLat, 
  currentLng, 
  title = "Suivi de livraison",
  height = "400px"
}: RealMapProps) {
  const [isClient, setIsClient] = useState(false);
  const [mapKey, setMapKey] = useState(0);

  useEffect(() => {
    setIsClient(true);
    setMapKey(prev => prev + 1);
  }, [startLat, startLng, endLat, endLng, currentLat, currentLng]);

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

  const distance = calculateDistance(startLat, startLng, endLat, endLng);
  const duration = Math.round(distance * 2);

  const minLat = Math.min(startLat, endLat, currentLat ?? startLat);
  const maxLat = Math.max(startLat, endLat, currentLat ?? endLat);
  const minLng = Math.min(startLng, endLng, currentLng ?? startLng);
  const maxLng = Math.max(startLng, endLng, currentLng ?? endLng);
  const padding = 0.05;
  const bbox = `${minLng - padding},${minLat - padding},${maxLng + padding},${maxLat + padding}`;
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik`;

  if (!isClient) {
    return (
      <div style={{ height, minHeight: '300px' }} className="w-full rounded-xl overflow-hidden border border-white/10 bg-gray-800/50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 rounded-full border-2 border-amber-500/50 border-t-amber-400 animate-spin" />
          <p className="text-gray-400 text-sm">Chargement de la carte...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {title && (
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-6 bg-amber-500 rounded-full" />
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
      )}

      <div className="relative rounded-xl overflow-hidden border border-white/10 bg-gray-900" style={{ height, minHeight: '300px' }}>
        <iframe
          key={mapKey}
          src={mapUrl}
          style={{ width: '100%', height: '100%', border: 'none' }}
          title="Carte d'itinéraire"
          className="rounded-xl"
          loading="lazy"
        />
        
        <div className="absolute bottom-3 left-3 right-3 bg-black/80 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-white">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span>🏭 Entrepôt</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <span>📍 Destination</span>
            </div>
            {currentLat && currentLng && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
                <span>🚚 Livreur</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-gray-400 mb-1">
            <Navigation className="w-4 h-4" />
            <p className="text-xs">Distance</p>
          </div>
          <p className="text-xl font-bold text-white">{distance.toFixed(1)} km</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-gray-400 mb-1">
            <Truck className="w-4 h-4" />
            <p className="text-xs">Temps estimé</p>
          </div>
          <p className="text-xl font-bold text-white">{duration} min</p>
        </div>
      </div>

      {currentLat && currentLng && (
        <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30">
          <div className="flex items-center gap-2 text-blue-400 text-sm">
            <MapPin className="w-4 h-4" />
            <span className="font-medium">Position du livreur</span>
          </div>
          <p className="text-white text-xs mt-1 font-mono">
            {currentLat.toFixed(6)}°, {currentLng.toFixed(6)}°
          </p>
        </div>
      )}
    </div>
  );
}