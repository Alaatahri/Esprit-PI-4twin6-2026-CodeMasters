'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { 
  Navigation, AlertTriangle, CloudSun, 
  Layers, MapPin, Search, Maximize2,
  Thermometer, Wind, Droplets
} from 'lucide-react';

// Import de la carte de manière dynamique pour éviter les erreurs SSR
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });
const Polyline = dynamic(() => import('react-leaflet').then(mod => mod.Polyline), { ssr: false });

export default function SmartMapPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [showTraffic, setShowTraffic] = useState(true);
  const [showWeather, setShowWeather] = useState(false);
  const [alerts, setAlerts] = useState([
    { id: 1, type: 'works', pos: [36.8065, 10.1815], msg: 'Travaux sur l\'Avenue Bourguiba', severity: 'high' },
    { id: 2, type: 'traffic', pos: [36.8188, 10.1659], msg: 'Bouchon important - Route de Marsa', severity: 'medium' },
  ]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  // Position centre de Tunis
  const position: [number, number] = [36.8065, 10.1815];

  return (
    <div className="h-[calc(100vh-64px)] relative overflow-hidden flex flex-col">
      {/* Search & Stats Overlay */}
      <div className="absolute top-6 left-6 z-[1000] w-80 space-y-4 pointer-events-none">
        <div className="bg-gray-900/90 backdrop-blur-xl border border-white/10 p-4 rounded-3xl shadow-2xl pointer-events-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Destination..." 
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500/50"
            />
          </div>
        </div>

        <div className="bg-gray-900/90 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl space-y-4 pointer-events-auto">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Alertes en temps réel
          </h3>
          <div className="space-y-3">
            {alerts.map(alert => (
              <div key={alert.id} className="p-3 rounded-2xl bg-white/5 border border-white/5 flex gap-3 items-start">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${alert.severity === 'high' ? 'bg-red-500 animate-pulse' : 'bg-amber-500'}`}></div>
                <p className="text-[11px] text-gray-300 leading-relaxed">{alert.msg}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weather Overlay Toggle */}
      <div className="absolute top-6 right-6 z-[1000] flex flex-col gap-3 pointer-events-auto">
        <div className="bg-gray-900/90 backdrop-blur-xl border border-white/10 p-2 rounded-2xl flex flex-col gap-2">
          <button 
            onClick={() => setShowTraffic(!showTraffic)}
            className={`p-3 rounded-xl transition-all ${showTraffic ? 'bg-amber-500 text-gray-900' : 'text-gray-400 hover:bg-white/5'}`}
          >
            <Layers className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setShowWeather(!showWeather)}
            className={`p-3 rounded-xl transition-all ${showWeather ? 'bg-blue-500 text-white' : 'text-gray-400 hover:bg-white/5'}`}
          >
            <CloudSun className="w-5 h-5" />
          </button>
        </div>

        <button className="bg-gray-900/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl text-white hover:bg-gray-800 transition-all">
          <Maximize2 className="w-5 h-5" />
        </button>
      </div>

      {/* Bottom Weather Bar */}
      {showWeather && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] bg-gray-900/90 backdrop-blur-xl border border-white/10 p-4 rounded-3xl shadow-2xl flex items-center gap-8 px-8">
          <div className="flex items-center gap-3">
            <Thermometer className="w-5 h-5 text-orange-400" />
            <div>
              <p className="text-[10px] text-gray-500 uppercase font-black">Température</p>
              <p className="text-sm font-bold text-white">28°C</p>
            </div>
          </div>
          <div className="w-px h-8 bg-white/10"></div>
          <div className="flex items-center gap-3">
            <Wind className="w-5 h-5 text-blue-400" />
            <div>
              <p className="text-[10px] text-gray-500 uppercase font-black">Vent</p>
              <p className="text-sm font-bold text-white">15 km/h</p>
            </div>
          </div>
          <div className="w-px h-8 bg-white/10"></div>
          <div className="flex items-center gap-3">
            <Droplets className="w-5 h-5 text-blue-300" />
            <div>
              <p className="text-[10px] text-gray-500 uppercase font-black">Humidité</p>
              <p className="text-sm font-bold text-white">42%</p>
            </div>
          </div>
        </div>
      )}

      {/* Map Implementation */}
      <div className="flex-1 z-0">
        <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Driver Position Marker */}
          <Marker position={position}>
            <Popup>
              <div className="text-center p-2">
                <p className="font-bold text-gray-900">Ma Position</p>
                <p className="text-xs text-gray-500">Véhicule: Camion Benne</p>
              </div>
            </Popup>
          </Marker>

          {/* Traffic/Alert Markers */}
          {showTraffic && alerts.map(alert => (
            <Marker key={alert.id} position={alert.pos as any}>
              <Popup>
                <div className="p-2">
                  <p className={`font-bold ${alert.severity === 'high' ? 'text-red-500' : 'text-amber-500'}`}>
                    {alert.type === 'works' ? 'Zone de travaux' : 'Embouteillage'}
                  </p>
                  <p className="text-xs text-gray-600">{alert.msg}</p>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Dummy Route */}
          <Polyline 
            positions={[
              [36.8065, 10.1815],
              [36.8122, 10.1755],
              [36.8255, 10.1700]
            ]}
            color="#f59e0b"
            weight={5}
            opacity={0.8}
          />
        </MapContainer>
      </div>

      <style jsx global>{`
        .leaflet-container {
          background: #0f172a !important;
          filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
        }
        .leaflet-popup-content-wrapper {
          background: white !important;
          border-radius: 12px !important;
          padding: 0 !important;
        }
        .leaflet-popup-tip {
          background: white !important;
        }
      `}</style>
    </div>
  );
}
