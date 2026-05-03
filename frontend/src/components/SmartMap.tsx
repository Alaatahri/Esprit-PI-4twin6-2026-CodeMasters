'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { AlertTriangle, CloudRain, Construction } from 'lucide-react';

// Fix pour les icônes Leaflet par défaut
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Icônes personnalisées
const TruckIcon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3514/3514486.png',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const DestinationIcon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

type SmartMapProps = {
  delivery?: any;
};

export default function SmartMap({ delivery }: SmartMapProps) {
  const [position, setPosition] = useState<[number, number]>([36.8065, 10.1815]); // Tunis par défaut
  const [incidents, setIncidents] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Simuler des incidents en temps réel
    setIncidents([
      { id: 1, type: 'travaux', lat: 36.82, lng: 10.17, desc: 'Travaux sur la voirie - Retard 10min' },
      { id: 2, type: 'meteo', lat: 36.85, lng: 10.20, desc: 'Averse forte - Visibilité réduite' },
    ]);

    // Simuler la position du camion
    const interval = setInterval(() => {
      setPosition(prev => [prev[0] + 0.0001, prev[1] + 0.0001]);
    }, 5000);

    return () => {
      setMounted(false);
      clearInterval(interval);
    };
  }, []);

  if (!mounted) return (
    <div className="h-[400px] w-full bg-gray-900 animate-pulse rounded-[2.5rem] flex items-center justify-center text-gray-500">
      Initialisation de la carte...
    </div>
  );

  const destination: [number, number] = delivery?.coordonnees 
    ? [delivery.coordonnees.lat, delivery.coordonnees.lng] 
    : [36.86, 10.30];

  return (
    <div className="h-[400px] w-full relative">
      <MapContainer 
        key={delivery?._id || 'default-map'}
        center={position} 
        zoom={13} 
        scrollWheelZoom={false}
        className="h-full w-full z-0"
      >
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Mode Sombre">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Mode Standard">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>

          <LayersControl.Overlay checked name="Trafic & Travaux">
            <IncidentLayer incidents={incidents.filter(i => i.type === 'travaux')} color="orange" />
          </LayersControl.Overlay>
          
          <LayersControl.Overlay checked name="Alertes Météo">
            <IncidentLayer incidents={incidents.filter(i => i.type === 'meteo')} color="blue" />
          </LayersControl.Overlay>
        </LayersControl>

        {/* Position du Camion */}
        <Marker position={position} icon={TruckIcon}>
          <Popup>
            <div className="text-gray-900">
              <p className="font-bold">Votre Camion</p>
              <p className="text-xs">Vitesse: 45 km/h</p>
            </div>
          </Popup>
        </Marker>

        {/* Destination */}
        <Marker position={destination} icon={DestinationIcon}>
          <Popup>
            <div className="text-gray-900">
              <p className="font-bold">Destination</p>
              <p className="text-xs">{delivery?.adresse_livraison || 'Chantier Marsa'}</p>
            </div>
          </Popup>
        </Marker>

        <MapUpdater center={position} />
      </MapContainer>

      {/* Légende flottante */}
      <div className="absolute bottom-4 left-4 z-[1000] p-3 rounded-xl bg-gray-900/90 backdrop-blur-md border border-white/10 text-[10px] space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-orange-500"></div>
          <span className="text-gray-300 font-bold uppercase">Zone de travaux</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          <span className="text-gray-300 font-bold uppercase">Alerte météo</span>
        </div>
      </div>
    </div>
  );
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    // map.setView(center); // On ne force pas la vue pour laisser l'utilisateur explorer
  }, [center, map]);
  return null;
}

function IncidentLayer({ incidents, color }: { incidents: any[], color: string }) {
  return (
    <>
      {incidents.map(incident => (
        <Marker 
          key={incident.id} 
          position={[incident.lat, incident.lng]}
          icon={L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px ${color};"></div>`,
            iconSize: [12, 12],
            iconAnchor: [6, 6]
          })}
        >
          <Popup>
            <div className="text-gray-900 flex items-center gap-2">
              {color === 'orange' ? <Construction className="w-4 h-4 text-orange-500" /> : <CloudRain className="w-4 h-4 text-blue-500" />}
              <span className="text-xs font-bold">{incident.desc}</span>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}
