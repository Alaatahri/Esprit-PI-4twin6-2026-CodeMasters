const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Génère un ID MongoDB valide (24 caractères hexadécimaux)
function generateValidMongoId(): string {
  const timestamp = Math.floor(Date.now() / 1000).toString(16);
  const random = Math.random().toString(16).substring(2, 18);
  const id = (timestamp + random).substring(0, 24);
  return id.padEnd(24, '0');
}

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
  dimensions?: string;
  emplacement?: {
    ville: string;
    adresse: string;
    lat: number;
    lng: number;
  };
  model3d_url?: string;
}

export interface Order {
  _id: string;
  clientId: string;
  montant_total: number;
  statut: string;
  date_commande: string;
  mode_paiement?: string;
  montant_paye?: number;
  vehicleId?: string;
  prix_livraison?: number;
  items: OrderItem[];
}

export interface OrderItem {
  _id: string;
  produitId: string;
  produitNom?: string;
  quantite: number;
  prix: number;
}

export interface DeliveryRequest {
  _id: string;
  commandeId: string;
  adresse_livraison: { adresse: string; lat: number; lng: number };
  adresse_depart: { adresse: string; lat: number; lng: number };
  statut: string;
  distance_km: number;
  cout_livraison: number;
  duree_estimee_min: number;
  chauffeur_nom?: string;
  chauffeur_telephone?: string;
  vehicule_type?: string;
  immatriculation?: string;
  date_livraison_prevue?: string;
  date_livraison_reelle?: string;
  historique_position: Array<{ lat: number; lng: number; timestamp: string }>;
}

class MarketplaceAPI {
  // ==================== PRODUITS ====================
  
  async getProducts(): Promise<Product[]> {
    const res = await fetch(`${API_URL}/marketplace/produits`);
    if (!res.ok) throw new Error('Erreur chargement produits');
    return res.json();
  }

  async getProduct(id: string): Promise<Product> {
    const res = await fetch(`${API_URL}/marketplace/produits/${id}`);
    if (!res.ok) throw new Error('Produit non trouvé');
    return res.json();
  }

  async searchProducts(filters: { 
    q?: string; 
    categorie?: string; 
    prixMin?: number; 
    prixMax?: number; 
    enStock?: boolean 
  }): Promise<Product[]> {
    const params = new URLSearchParams();
    if (filters.q) params.append('q', filters.q);
    if (filters.categorie) params.append('categorie', filters.categorie);
    if (filters.prixMin) params.append('prixMin', filters.prixMin.toString());
    if (filters.prixMax) params.append('prixMax', filters.prixMax.toString());
    if (filters.enStock) params.append('enStock', 'true');
    
    const res = await fetch(`${API_URL}/marketplace/produits/recherche/avancee?${params}`);
    if (!res.ok) throw new Error('Erreur recherche produits');
    return res.json();
  }

  async getSimilarProducts(productId: string): Promise<Product[]> {
    const res = await fetch(`${API_URL}/marketplace/produits/${productId}/similaires`);
    if (!res.ok) throw new Error('Erreur chargement produits similaires');
    return res.json();
  }

  // ==================== COMMANDES ====================

  async createOrder(orderData: { 
    clientId: string; 
    items: { produitId: string; quantite: number }[];
    mode_paiement?: string;
    vehicleId?: string;
    prix_livraison?: number;
  }): Promise<Order> {
    const requestBody = {
      clientId: orderData.clientId,
      montant_total: 0,
      statut: 'En attente',
      date_commande: new Date().toISOString(),
      mode_paiement: orderData.mode_paiement || '100%',
      vehicleId: orderData.vehicleId,
      prix_livraison: orderData.prix_livraison || 0,
      items: orderData.items.map(item => ({
        produitId: item.produitId,
        quantite: item.quantite
      }))
    };
    
    const res = await fetch(`${API_URL}/marketplace/commandes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Erreur création commande: ${errorText}`);
    }
    const order = await res.json();
    return this.getOrder(order._id);
  }

  async getOrder(id: string): Promise<Order> {
    const res = await fetch(`${API_URL}/marketplace/commandes/${id}`);
    if (!res.ok) throw new Error('Commande non trouvée');
    const order = await res.json();
    order.items = await this.findCommandeItems(id);
    return order;
  }

  async findCommandeItems(id: string): Promise<OrderItem[]> {
    const res = await fetch(`${API_URL}/marketplace/commandes/${id}/items`);
    if (!res.ok) return [];
    return res.json();
  }

  async getOrdersByClient(clientId: string): Promise<Order[]> {
    const res = await fetch(`${API_URL}/marketplace/commandes?clientId=${clientId}`);
    if (!res.ok) throw new Error('Erreur chargement commandes');
    return res.json();
  }

  async updateOrderStatus(orderId: string, statut: string): Promise<Order> {
    const res = await fetch(`${API_URL}/marketplace/commandes/${orderId}/statut`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ statut }),
    });
    if (!res.ok) throw new Error('Erreur mise à jour statut');
    return res.json();
  }

  // ==================== LIVRAISONS ====================

  async createDelivery(commandeId: string, deliveryData: any): Promise<DeliveryRequest> {
    const res = await fetch(`${API_URL}/marketplace/commandes/${commandeId}/livraison`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(deliveryData),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error('Erreur backend livraison:', errorData);
      throw new Error(`Erreur création livraison: ${errorData.message || res.statusText}`);
    }
    return res.json();
  }

  async getLivraisonByOrder(orderId: string): Promise<DeliveryRequest> {
    const res = await fetch(`${API_URL}/marketplace/commandes/${orderId}/livraison`);
    if (!res.ok) throw new Error('Livraison non trouvée');
    return res.json();
  }

  // ==================== MÉTHODES LIVREUR ====================

  async getDriverVehicle(userId: string): Promise<any> {
    const res = await fetch(`${API_URL}/marketplace/livreur/${userId}/vehicle`);
    if (!res.ok) throw new Error('Aucun véhicule trouvé pour ce livreur');
    return res.json();
  }

  async getDriverDeliveries(vehicleId: string): Promise<DeliveryRequest[]> {
    const res = await fetch(`${API_URL}/marketplace/livreur/vehicle/${vehicleId}/deliveries`);
    if (!res.ok) throw new Error('Erreur chargement livraisons');
    return res.json();
  }

  async getAvailableDeliveries(): Promise<DeliveryRequest[]> {
    const res = await fetch(`${API_URL}/marketplace/livreur/available-deliveries`);
    if (!res.ok) throw new Error('Erreur chargement livraisons disponibles');
    return res.json();
  }

  async acceptDeliveryTask(livraisonId: string, vehicleId: string): Promise<DeliveryRequest> {
    const res = await fetch(`${API_URL}/marketplace/livreur/livraison/${livraisonId}/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vehicleId }),
    });
    if (!res.ok) throw new Error('Erreur lors de l\'acceptation de la livraison');
    return res.json();
  }

  async updateDeliveryStatus(livraisonId: string, statut: string): Promise<DeliveryRequest> {
    const res = await fetch(`${API_URL}/marketplace/livraison/${livraisonId}/statut`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ statut }),
    });
    if (!res.ok) throw new Error('Erreur mise à jour statut livraison');
    return res.json();
  }

  // ==================== VEHICULES ====================

  async getVehicles(): Promise<any[]> {
    const res = await fetch(`${API_URL}/marketplace/vehicles`);
    if (!res.ok) return [];
    return res.json();
  }

  async getVehicleById(id: string): Promise<any> {
    const res = await fetch(`${API_URL}/marketplace/vehicles/${id}`);
    if (!res.ok) throw new Error('Véhicule non trouvé');
    return res.json();
  }

  // ==================== UTILISATEURS ====================
  async getUser(id: string): Promise<any> {
    const res = await fetch(`${API_URL}/users/${id}`);
    if (!res.ok) throw new Error('Utilisateur non trouvé');
    return res.json();
  }

  // ==================== ESTIMATIONS ====================

  async estimatePrice(data: any): Promise<any> {
    const res = await fetch(`${API_URL}/marketplace/estimation/prix`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  }

  async calculateDeliveryPrice(data: any): Promise<any> {
    const res = await fetch(`${API_URL}/marketplace/calcul/livraison`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  }

  // ==================== AVIS ====================

  async createAvis(avisData: any): Promise<any> {
    const res = await fetch(`${API_URL}/marketplace/avis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(avisData),
    });
    return res.json();
  }
}

export const marketplaceAPI = new MarketplaceAPI();