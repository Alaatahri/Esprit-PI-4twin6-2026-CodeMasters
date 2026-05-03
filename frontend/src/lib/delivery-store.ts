import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DeliveryLocation {
  lat: number;
  lng: number;
  adresse: string;
  ville?: string;
  code_postal?: string;
}

interface DeliveryStore {
  location: DeliveryLocation | null;
  selectedDriverId: string | null;
  deliveryPrice: number;
  distance: number;
  setLocation: (location: DeliveryLocation) => void;
  setSelectedDriver: (driverId: string | null) => void;
  setDeliveryPrice: (price: number) => void;
  setDistance: (distance: number) => void;
  clearDelivery: () => void;
}

export const useDeliveryStore = create<DeliveryStore>()(
  persist(
    (set) => ({
      location: null,
      selectedDriverId: null,
      deliveryPrice: 0,
      distance: 0,
      setLocation: (location) => set({ location }),
      setSelectedDriver: (selectedDriverId) => set({ selectedDriverId }),
      setDeliveryPrice: (deliveryPrice) => set({ deliveryPrice }),
      setDistance: (distance) => set({ distance }),
      clearDelivery: () => set({ location: null, selectedDriverId: null, deliveryPrice: 0, distance: 0 }),
    }),
    { name: 'delivery-storage' }
  )
);