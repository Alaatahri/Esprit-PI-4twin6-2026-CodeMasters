'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment, ContactShadows, Float, Box } from '@react-three/drei';
import { Package, AlertCircle, Rotate3d, Loader2 } from 'lucide-react';

// --- PLACEHOLDER 3D ---
function PlaceholderModel({ color = "#fbbf24", label = "" }: { color?: string, label?: string }) {
  return (
    <group>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <Box args={[1.5, 1.5, 1.5]} castShadow>
          <meshStandardMaterial 
            color={color} 
            metalness={0.6} 
            roughness={0.2} 
            emissive={color}
            emissiveIntensity={0.1}
          />
        </Box>
      </Float>
    </group>
  );
}

// --- CHARGEUR DE MODÈLE ---
function SafeModel({ url, onLoadingError }: { url: string; onLoadingError: () => void }) {
  try {
    const { scene } = useGLTF(url);
    return <primitive object={scene} />;
  } catch (err) {
    onLoadingError();
    return null;
  }
}

// --- ERROR BOUNDARY ---
class CanvasErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

interface ProductViewer3DProps {
  modelUrl?: string;
  fallbackImageUrl?: string;
  altText?: string;
}

export default function ProductViewer3D({ modelUrl, fallbackImageUrl, altText }: ProductViewer3DProps) {
  const [loadStatus, setLoadStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [webGLSupported, setWebGLSupported] = useState(true);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setWebGLSupported(false);
    } catch (e) {
      setWebGLSupported(false);
    }
  }, []);

  if (!webGLSupported) {
    return (
      <div className="aspect-square w-full bg-card dark:bg-gray-900 rounded-3xl overflow-hidden flex items-center justify-center">
        {fallbackImageUrl && <img src={fallbackImageUrl} alt={altText} className="w-full h-full object-cover" />}
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-square bg-gradient-to-br from-gray-950 to-gray-900 rounded-3xl overflow-hidden border border-border dark:border-white/10 shadow-2xl">
      <Canvas shadows camera={{ position: [0, 2, 5], fov: 45 }}>
        <ambientLight intensity={0.8} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} castShadow />
        <pointLight position={[-10, -5, -10]} intensity={0.5} color="#3b82f6" />
        
        <Suspense fallback={null}>
          {modelUrl ? (
            <CanvasErrorBoundary fallback={<PlaceholderModel color="#444" />}>
              <SafeModel 
                url={modelUrl} 
                onLoadingError={() => setLoadStatus('error')} 
              />
              {/* Si on arrive ici, on considère que ça charge ou a réussi */}
              <Environment preset="city" />
              <ContactShadows position={[0, -1.2, 0]} opacity={0.4} scale={10} blur={2} far={4} />
            </CanvasErrorBoundary>
          ) : (
            <PlaceholderModel color="#fbbf24" />
          )}
        </Suspense>
        
        <OrbitControls 
          enablePan={false}
          autoRotate={true}
          autoRotateSpeed={0.5}
          minDistance={3}
          maxDistance={8}
        />
      </Canvas>

      {/* Overlay d'information */}
      <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/90 to-transparent pointer-events-none z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <Rotate3d className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-foreground dark:text-white font-medium text-sm">Vue 3D Interactive</p>
              <p className="text-muted-foreground dark:text-gray-400 text-xs">Faites glisser pour explorer le produit</p>
            </div>
          </div>
          <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-[10px] font-bold tracking-wider">
            360° LIVE
          </div>
        </div>
      </div>
    </div>
  );
}
