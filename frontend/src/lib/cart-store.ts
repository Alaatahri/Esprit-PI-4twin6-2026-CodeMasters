import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productId: string;
  nom: string;
  prix: number;
  quantite: number;
  image_url?: string;
  stock: number;
  poids_kg?: number;
  emplacement?: {           // Ajout de la propriété emplacement
    ville: string;
    adresse: string;
    lat: number;
    lng: number;
  };
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantite: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item) => {
        const { items } = get();
        const existingIndex = items.findIndex(i => i.productId === item.productId);
        
        if (existingIndex >= 0) {
          const newItems = [...items];
          const newQuantite = Math.min(newItems[existingIndex].quantite + item.quantite, item.stock);
          newItems[existingIndex] = { ...newItems[existingIndex], quantite: newQuantite };
          set({ items: newItems });
        } else {
          set({ items: [...items, { ...item, quantite: Math.min(item.quantite, item.stock) }] });
        }
      },
      
      removeItem: (productId) => {
        set({ items: get().items.filter(i => i.productId !== productId) });
      },
      
      updateQuantity: (productId, quantite) => {
        const { items } = get();
        const item = items.find(i => i.productId === productId);
        if (item && quantite <= item.stock && quantite > 0) {
          set({
            items: items.map(i =>
              i.productId === productId ? { ...i, quantite } : i
            ),
          });
        }
      },
      
      clearCart: () => set({ items: [] }),
      
      getTotal: () => {
        return get().items.reduce((sum, item) => sum + item.prix * item.quantite, 0);
      },
      
      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantite, 0);
      },
    }),
    {
      name: 'marketplace-cart',
    }
  )
);