'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';
import type { Driver } from '@/lib/delivery-service';

interface DeliveryMapProps {
  pickupLat: number;
  pickupLng: number;
  dropoffLat: number;
  dropoffLng: number;
  drivers: Driver[];
  onDriverSelect?: (driver: Driver) => void;
  onMapClick?: (lat: number, lng: number) => void;
  selectedDriverId?: string;
  height?: string;
}

export function DeliveryMap({ 
  pickupLat, pickupLng, dropoffLat, dropoffLng, 
  drivers, onMapClick,
  height = '500px'
}: DeliveryMapProps) {
  const [isClient, setIsClient] = useState(false);
  const [selectedLat, setSelectedLat] = useState<number | null>(null);
  const [selectedLng, setSelectedLng] = useState<number | null>(null);
  const [mapKey, setMapKey] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
    setMapKey(prev => prev + 1);
  }, [pickupLat, pickupLng, dropoffLat, dropoffLng]);

  // Calcul des limites de la carte
  const minLat = Math.min(pickupLat, dropoffLat);
  const maxLat = Math.max(pickupLat, dropoffLat);
  const minLng = Math.min(pickupLng, dropoffLng);
  const maxLng = Math.max(pickupLng, dropoffLng);
  const padding = 0.05;
  const bbox = `${minLng - padding},${minLat - padding},${maxLng + padding},${maxLat + padding}`;
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik`;

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onMapClick) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    const lat = pickupLat + (dropoffLat - pickupLat) * y;
    const lng = pickupLng + (dropoffLng - pickupLng) * x;
    
    setSelectedLat(lat);
    setSelectedLng(lng);
    onMapClick(lat, lng);
  };

  if (!isClient) {
    return (
      <div style={{ height, minHeight: '400px' }} className="w-full rounded-xl overflow-hidden border border-border dark:border-white/10 bg-gray-800/50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 rounded-full border-2 border-amber-500/50 border-t-amber-400 animate-spin" />
          <p className="text-muted-foreground dark:text-gray-400 text-sm">Chargement de la carte...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" style={{ height }}>
      <div 
        ref={containerRef}
        onClick={handleMapClick}
        className="relative w-full h-full cursor-crosshair rounded-xl overflow-hidden border border-border dark:border-white/10"
        style={{ cursor: 'crosshair' }}
      >
        <iframe
          key={mapKey}
          src={mapUrl}
          style={{ width: '100%', height: '100%', border: 'none', pointerEvents: 'none' }}
          title="Carte de sélection de livraison"
          className="rounded-xl"
          loading="lazy"
        />
        
        {/* Overlay de clic */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black/5 dark:bg-black/50 rounded-full p-3 backdrop-blur-sm">
            <MapPin className="w-8 h-8 text-amber-400" />
          </div>
        </div>
        
        {/* Instructions */}
        <div className="absolute top-3 left-3 right-3 bg-black/5 dark:bg-black/70 backdrop-blur-sm rounded-lg px-4 py-2 text-foreground dark:text-white text-sm text-center">
          📍 Cliquez n'importe où sur la carte pour sélectionner votre adresse
        </div>
      </div>
      
      {(selectedLat && selectedLng) && (
        <div className="absolute bottom-3 left-3 right-3 bg-emerald-500/90 backdrop-blur-sm rounded-lg px-4 py-2 text-foreground dark:text-white text-sm text-center">
          ✅ Destination : {selectedLat.toFixed(4)}°, {selectedLng.toFixed(4)}°
        </div>
      )}
    </div>
  );
}