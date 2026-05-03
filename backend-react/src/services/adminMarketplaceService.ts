import api from './api';

export interface Product {
  _id: string;
  nom: string;
  description: string;
  prix: number;
  stock: number;
  image_url?: string;
  categorie: string;
  vendeurId: string;
  createdAt: string;
  poids_kg?: number;
  note_moyenne?: number;
}

export interface Order {
  _id: string;
  clientId: string;
  clientNom?: string;
  montant_total: number;
  statut: string;
  date_commande: string;
  items: OrderItem[];
  prix_livraison?: number;
}

export interface OrderItem {
  _id: string;
  produitId: string;
  produitNom: string;
  quantite: number;
  prix: number;
}

export interface Review {
  _id: string;
  clientId: string;
  clientNom?: string;
  produitId?: string;
  produitNom?: string;
  vehicleId?: string;
  vehicleNom?: string;
  note: number;
  commentaire: string;
  type: string;
  date_avis: string;
  reponse?: string;
}

export interface Stats {
  totalCommandes: number;
  totalProduits: number;
  totalAvis: number;
  chiffreAffaires: number;
  commandesParStatut: Record<string, number>;
  topProduits: Array<{ produit: Product; totalVendus: number; chiffreAffaires: number }>;
  recentOrders: Order[];
  recentReviews: Review[];
}

class AdminMarketplaceService {
  // ==================== PRODUITS ====================
  
  async getProducts(): Promise<Product[]> {
    const res = await api.get('/marketplace/produits');
    return res.data;
  }

  async getProduct(id: string): Promise<Product> {
    const res = await api.get(`/marketplace/produits/${id}`);
    return res.data;
  }

  async createProduct(productData: Partial<Product>): Promise<Product> {
    const res = await api.post('/marketplace/produits', productData);
    return res.data;
  }

  async updateProduct(id: string, productData: Partial<Product>): Promise<Product> {
    const res = await api.put(`/marketplace/produits/${id}`, productData);
    return res.data;
  }

  async deleteProduct(id: string): Promise<void> {
    await api.delete(`/marketplace/produits/${id}`);
  }

  // ==================== COMMANDES ====================
  
  async getOrders(): Promise<Order[]> {
    const res = await api.get('/marketplace/commandes');
    // Enrichir avec les noms des clients
    const orders = res.data;
    for (const order of orders) {
      const itemsRes = await api.get(`/marketplace/commandes/${order._id}/items`);
      order.items = itemsRes.data || [];
    }
    return orders;
  }

  async getOrder(id: string): Promise<Order> {
    const res = await api.get(`/marketplace/commandes/${id}`);
    const itemsRes = await api.get(`/marketplace/commandes/${id}/items`);
    res.data.items = itemsRes.data || [];
    return res.data;
  }

  async updateOrderStatus(id: string, statut: string): Promise<Order> {
    const res = await api.patch(`/marketplace/commandes/${id}/statut`, { statut });
    return res.data;
  }

  async deleteOrder(id: string): Promise<void> {
    await api.delete(`/marketplace/commandes/${id}`);
  }

  // ==================== AVIS ====================
  
  async getAllReviews(): Promise<Review[]> {
    try {
      const res = await api.get('/marketplace/avis/service');
      return res.data;
    } catch (error) {
      console.error('Erreur chargement avis:', error);
      return [];
    }
  }

  async deleteReview(id: string): Promise<void> {
    // Note: Cette route doit être ajoutée dans le backend
    await api.delete(`/marketplace/avis/${id}`);
  }

  async respondToReview(id: string, reponse: string): Promise<Review> {
    const res = await api.patch(`/marketplace/avis/${id}/repondre`, { reponse });
    return res.data;
  }

  // ==================== STATISTIQUES ====================
  
  async getStats(): Promise<Stats> {
    const [commandes, produits, avis] = await Promise.all([
      api.get('/marketplace/commandes'),
      api.get('/marketplace/produits'),
      this.getAllReviews()
    ]);

    const orders = commandes.data;
    const products = produits.data;
    
    // Calculer les commandes par statut
    const commandesParStatut: Record<string, number> = {};
    orders.forEach((order: Order) => {
      commandesParStatut[order.statut] = (commandesParStatut[order.statut] || 0) + 1;
    });

    // Calculer le chiffre d'affaires
    const chiffreAffaires = orders
      .filter((order: Order) => order.statut === 'Livrée')
      .reduce((sum: number, order: Order) => sum + order.montant_total, 0);

    // Top produits
    const produitsVendus: Record<string, { quantite: number; ca: number }> = {};
    for (const order of orders) {
      const itemsRes = await api.get(`/marketplace/commandes/${order._id}/items`);
      const items = itemsRes.data || [];
      for (const item of items) {
        if (!produitsVendus[item.produitId]) {
          produitsVendus[item.produitId] = { quantite: 0, ca: 0 };
        }
        produitsVendus[item.produitId].quantite += item.quantite;
        produitsVendus[item.produitId].ca += item.quantite * item.prix;
      }
    }

    const topProduits = Object.entries(produitsVendus)
      .map(([id, data]) => {
        const produit = products.find((p: Product) => p._id === id);
        return {
          produit: produit || { _id: id, nom: 'Produit inconnu' } as Product,
          totalVendus: data.quantite,
          chiffreAffaires: data.ca
        };
      })
      .sort((a, b) => b.totalVendus - a.totalVendus)
      .slice(0, 5);

    return {
      totalCommandes: orders.length,
      totalProduits: products.length,
      totalAvis: avis.length,
      chiffreAffaires,
      commandesParStatut,
      topProduits,
      recentOrders: orders.slice(-10).reverse(),
      recentReviews: avis.slice(-10).reverse()
    };
  }
}

export const adminMarketplaceService = new AdminMarketplaceService();