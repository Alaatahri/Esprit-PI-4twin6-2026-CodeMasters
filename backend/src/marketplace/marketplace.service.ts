import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Produit, ProduitDocument } from './schemas/produit.schema';
import { Commande, CommandeDocument } from './schemas/commande.schema';
import { CommandeItem, CommandeItemDocument } from './schemas/commande-item.schema';
import { Livraison, LivraisonDocument } from './schemas/livraison.schema';
import { Vehicle, VehicleDocument } from './schemas/vehicle.schema';
import { Avis, AvisDocument } from './schemas/avis.schema';
import { Notification, NotificationDocument } from './schemas/notification.schema';
import { Estimation, EstimationDocument } from './schemas/estimation.schema'; // ⭐ AJOUTER

@Injectable()
export class MarketplaceService {
  constructor(
    @InjectModel(Produit.name) private produitModel: Model<ProduitDocument>,
    @InjectModel(Commande.name) private commandeModel: Model<CommandeDocument>,
    @InjectModel(CommandeItem.name) private commandeItemModel: Model<CommandeItemDocument>,
    @InjectModel(Livraison.name) private livraisonModel: Model<LivraisonDocument>,
    @InjectModel(Vehicle.name) private vehicleModel: Model<VehicleDocument>,
    @InjectModel(Avis.name) private avisModel: Model<AvisDocument>,
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
     @InjectModel(Estimation.name) private estimationModel: Model<EstimationDocument>,
  ) {}

  // ==================== PRODUITS ====================

  async createProduit(createProduitDto: any): Promise<Produit> {
    if (!createProduitDto.emplacement) {
      createProduitDto.emplacement = {
        ville: 'Tunis',
        adresse: 'Zone industrielle',
        lat: 36.8065,
        lng: 10.1815,
      };
    }
    if (createProduitDto.poids_kg === undefined) {
      createProduitDto.poids_kg = 0;
    }
    const createdProduit = new this.produitModel(createProduitDto);
    return createdProduit.save();
  }

  async findAllProduits(): Promise<Produit[]> {
    return this.produitModel.find().exec();
  }

  async findProduitById(id: string): Promise<Produit> {
    const produit = await this.produitModel.findById(id).exec();
    if (!produit) throw new NotFoundException(`Produit ${id} non trouvé`);
    return produit;
  }

  async updateProduit(id: string, updateProduitDto: any): Promise<Produit> {
    const produit = await this.produitModel.findByIdAndUpdate(id, updateProduitDto, { new: true }).exec();
    if (!produit) throw new NotFoundException(`Produit ${id} non trouvé`);
    return produit;
  }

  async removeProduit(id: string): Promise<Produit> {
    const produit = await this.produitModel.findByIdAndDelete(id).exec();
    if (!produit) throw new NotFoundException(`Produit ${id} non trouvé`);
    return produit;
  }

  // ==================== COMMANDES ====================

  async createCommande(createCommandeDto: any): Promise<Commande> {
    let totalProduits = 0;
    let poidsTotal = 0;

    for (const item of createCommandeDto.items) {
      const produit = await this.produitModel.findById(item.produitId).exec();
      if (!produit) {
        throw new BadRequestException(`Produit ${item.produitId} non trouvé`);
      }
      if (produit.stock < item.quantite) {
        throw new BadRequestException(`Stock insuffisant pour ${produit.nom}. Disponible: ${produit.stock}`);
      }
      totalProduits += produit.prix * item.quantite;
      poidsTotal += (produit.poids_kg || 0) * item.quantite;
    }

    const commandeData = {
      clientId: new Types.ObjectId(createCommandeDto.clientId),
      montant_total: createCommandeDto.montant_total || totalProduits,
      statut: createCommandeDto.statut || 'En attente',
      date_commande: createCommandeDto.date_commande || new Date(),
      mode_paiement: createCommandeDto.mode_paiement || '100%',
      montant_paye: createCommandeDto.mode_paiement === '50/50' ? totalProduits / 2 : 
                     createCommandeDto.mode_paiement === '100%' ? totalProduits : 0,
      vehicleId: createCommandeDto.vehicleId ? new Types.ObjectId(createCommandeDto.vehicleId) : undefined,
      prix_livraison: createCommandeDto.prix_livraison || 0,
    };

    const createdCommande = new this.commandeModel(commandeData);
    const savedCommande = await createdCommande.save();

    for (const item of createCommandeDto.items) {
      const produit = await this.produitModel.findById(item.produitId).exec();
      
      const itemData = {
        commandeId: savedCommande._id,
        produitId: new Types.ObjectId(item.produitId),
        quantite: item.quantite,
        prix: produit.prix,
        produitNom: produit.nom,
        poids_total_kg: (produit.poids_kg || 0) * item.quantite,
      };
      
      const createdItem = new this.commandeItemModel(itemData);
      await createdItem.save();

      await this.produitModel.updateOne(
        { _id: item.produitId },
        { $inc: { stock: -item.quantite } }
      );
    }

    await this.updateCommandeTotal(savedCommande._id.toString());

    await this.createNotification(
      savedCommande.clientId.toString(),
      'Commande créée',
      `Votre commande #${savedCommande._id} a été créée avec succès. Montant: ${totalProduits} TND`,
      'success'
    );

    return this.findCommandeById(savedCommande._id.toString());
  }

  async findAllCommandes(): Promise<Commande[]> {
    return this.commandeModel.find().exec();
  }

  async findCommandeById(id: string): Promise<Commande> {
    const commande = await this.commandeModel.findById(id).exec();
    if (!commande) throw new NotFoundException(`Commande ${id} non trouvée`);
    return commande;
  }

  async findByClient(clientId: string): Promise<Commande[]> {
    return this.commandeModel.find({ clientId: new Types.ObjectId(clientId) }).exec();
  }

  async updateCommande(id: string, updateCommandeDto: any): Promise<Commande> {
    const commande = await this.commandeModel.findByIdAndUpdate(id, updateCommandeDto, { new: true }).exec();
    if (!commande) throw new NotFoundException(`Commande ${id} non trouvée`);
    
    if (updateCommandeDto.statut) {
      await this.createNotification(
        commande.clientId.toString(),
        `Statut commande #${id}`,
        `Votre commande est maintenant: ${updateCommandeDto.statut}`,
        'info'
      );
    }
    
    return commande;
  }

  async removeCommande(id: string): Promise<Commande> {
    const items = await this.commandeItemModel.find({ commandeId: new Types.ObjectId(id) }).exec();
    for (const item of items) {
      await this.produitModel.updateOne(
        { _id: item.produitId },
        { $inc: { stock: item.quantite } }
      );
    }
    
    await this.commandeItemModel.deleteMany({ commandeId: new Types.ObjectId(id) }).exec();
    const commande = await this.commandeModel.findByIdAndDelete(id).exec();
    if (!commande) throw new NotFoundException(`Commande ${id} non trouvée`);
    return commande;
  }

  async updateCommandeStatus(id: string, statut: string): Promise<Commande> {
    return this.updateCommande(id, { statut });
  }

  private async updateCommandeTotal(commandeId: string): Promise<void> {
    const items = await this.commandeItemModel.find({ commandeId: new Types.ObjectId(commandeId) }).exec();
    const total = items.reduce((sum, item) => sum + item.quantite * item.prix, 0);
    await this.commandeModel.findByIdAndUpdate(commandeId, { montant_total: total }).exec();
  }

  // ==================== ITEMS DE COMMANDE ====================

  async createCommandeItem(createItemDto: any): Promise<CommandeItem> {
    const createdItem = new this.commandeItemModel(createItemDto);
    const savedItem = await createdItem.save();

    if (createItemDto.commandeId) {
      await this.updateCommandeTotal(createItemDto.commandeId.toString());
    }

    return savedItem;
  }

  async findItemsByCommande(commandeId: string): Promise<CommandeItem[]> {
    return this.commandeItemModel.find({ commandeId: new Types.ObjectId(commandeId) }).exec();
  }

  async updateCommandeItem(id: string, updateItemDto: any): Promise<CommandeItem> {
    const updatedItem = await this.commandeItemModel.findByIdAndUpdate(id, updateItemDto, { new: true }).exec();
    if (!updatedItem) throw new NotFoundException(`Item ${id} non trouvé`);

    if (updatedItem) {
      await this.updateCommandeTotal(updatedItem.commandeId.toString());
    }

    return updatedItem;
  }

  async removeCommandeItem(id: string): Promise<CommandeItem> {
    const item = await this.commandeItemModel.findById(id).exec();
    const deletedItem = await this.commandeItemModel.findByIdAndDelete(id).exec();

    if (deletedItem && item) {
      await this.updateCommandeTotal(item.commandeId.toString());
    }

    return deletedItem;
  }

  // ==================== LIVRAISONS ====================

  async createLivraison(commandeId: string, createLivraisonDto: any): Promise<Livraison> {
    const livraisonData = {
      commandeId: new Types.ObjectId(commandeId),
      ...createLivraisonDto,
      vehicleId: createLivraisonDto.vehicleId ? new Types.ObjectId(createLivraisonDto.vehicleId) : undefined,
      distance_totale_km: createLivraisonDto.distance_km || 0,
      historique_position: [],
      statut: createLivraisonDto.statut || (createLivraisonDto.vehicleId ? 'En livraison' : 'En préparation'),
    };
    
    const livraison = new this.livraisonModel(livraisonData);
    const savedLivraison = await livraison.save();
    
    if (createLivraisonDto.vehicleId) {
      await this.updateCommandeStatus(commandeId, 'En livraison');
    } else {
      await this.updateCommandeStatus(commandeId, 'En préparation');
    }
    
    return savedLivraison;
  }

  async getLivraisonByCommande(commandeId: string): Promise<Livraison> {
    const livraison = await this.livraisonModel.findOne({ commandeId: new Types.ObjectId(commandeId) }).exec();
    if (!livraison) throw new NotFoundException(`Livraison pour commande ${commandeId} non trouvée`);
    return livraison;
  }

  async updateTrackingPosition(livraisonId: string, position: { lat: number; lng: number }): Promise<Livraison> {
    return this.livraisonModel.findByIdAndUpdate(
      livraisonId,
      {
        $push: {
          historique_position: {
            ...position,
            timestamp: new Date(),
          },
        },
        'coordonnees.lat': position.lat,
        'coordonnees.lng': position.lng,
        derniere_mise_a_jour: new Date(),
      },
      { new: true },
    ).exec();
  }

  async updateLivraisonStatus(livraisonId: string, statut: string): Promise<Livraison> {
    const livraison = await this.livraisonModel.findByIdAndUpdate(
      livraisonId,
      { statut },
      { new: true }
    ).exec();
    
    if (livraison) {
      let commandeStatut = 'En préparation';
      if (statut === 'Expédiée') commandeStatut = 'En préparation';
      else if (statut === 'En livraison') commandeStatut = 'En livraison';
      else if (statut === 'Livrée') commandeStatut = 'Livrée';
      else if (statut === 'Annulée') commandeStatut = 'Annulée';
      
      await this.updateCommandeStatus(livraison.commandeId.toString(), commandeStatut);
      
      if (statut === 'Livrée') {
        const commande = await this.findCommandeById(livraison.commandeId.toString());
        await this.createNotification(
          commande.clientId.toString(),
          'Livraison terminée',
          `Votre commande a été livrée avec succès ! N'oubliez pas de noter votre livreur.`,
          'success'
        );
      }
    }
    
    return livraison;
  }

  // ==================== VEHICULES ====================

  async getVehicles(): Promise<Vehicle[]> {
    return this.vehicleModel.find().exec();
  }

  async getAvailableVehicles(): Promise<Vehicle[]> {
    return this.vehicleModel.find({ disponible: true, statut_disponible: true }).exec();
  }

  async getVehicleByUser(userId: string): Promise<Vehicle> {
    const vehicle = await this.vehicleModel.findOne({ userId }).exec();
    if (!vehicle) throw new NotFoundException(`Aucun véhicule associé à l'utilisateur ${userId}`);
    return vehicle;
  }

  async getDeliveriesByVehicle(vehicleId: string): Promise<Livraison[]> {
    return this.livraisonModel.find({ vehicleId: new Types.ObjectId(vehicleId) }).sort({ createdAt: -1 }).exec();
  }

  async getAvailableDeliveries(): Promise<Livraison[]> {
    return this.livraisonModel.find({ 
      $or: [
        { vehicleId: { $exists: false } },
        { vehicleId: null }
      ],
      statut: 'En préparation' 
    }).exec();
  }

  async acceptDelivery(livraisonId: string, vehicleId: string): Promise<Livraison> {
    const livraison = await this.livraisonModel.findByIdAndUpdate(
      livraisonId,
      { vehicleId: new Types.ObjectId(vehicleId), statut: 'En livraison' },
      { new: true }
    ).exec();
    
    if (!livraison) throw new NotFoundException(`Livraison ${livraisonId} non trouvée`);
    
    // Mettre à jour la commande (si elle existe)
    try {
      await this.updateCommandeStatus(livraison.commandeId.toString(), 'En livraison');
    } catch (error) {
      console.warn(`Impossible de mettre à jour le statut de la commande ${livraison.commandeId}:`, error.message);
      // On continue quand même car la livraison a été assignée avec succès
    }
    
    return livraison;
  }

  async getVehicleById(id: string): Promise<Vehicle> {
    const vehicle = await this.vehicleModel.findById(id).exec();
    if (!vehicle) throw new NotFoundException(`Véhicule ${id} non trouvé`);
    return vehicle;
  }

  async updateVehiclePosition(vehicleId: string, position: { lat: number; lng: number }): Promise<Vehicle> {
    return this.vehicleModel.findByIdAndUpdate(
      vehicleId,
      { position_actuelle: position },
      { new: true }
    ).exec();
  }

  async updateVehicleAvailability(vehicleId: string, disponible: boolean): Promise<Vehicle> {
    return this.vehicleModel.findByIdAndUpdate(
      vehicleId,
      { disponible, statut_disponible: disponible },
      { new: true }
    ).exec();
  }

  async createVehicle(createVehicleDto: any): Promise<Vehicle> {
    const vehicle = new this.vehicleModel(createVehicleDto);
    return vehicle.save();
  }

  // ==================== RECHERCHE ====================

  async searchProducts(filters: {
    query?: string;
    categorie?: string;
    prixMin?: number;
    prixMax?: number;
    enStock?: boolean;
    ville?: string;
  }): Promise<Produit[]> {
    const query: any = {};
    
    if (filters.query) {
      query.$or = [
        { nom: { $regex: filters.query, $options: 'i' } },
        { description: { $regex: filters.query, $options: 'i' } },
      ];
    }
    
    if (filters.categorie) {
      query.categorie = filters.categorie;
    }
    
    if (filters.prixMin !== undefined || filters.prixMax !== undefined) {
      query.prix = {};
      if (filters.prixMin !== undefined) query.prix.$gte = filters.prixMin;
      if (filters.prixMax !== undefined) query.prix.$lte = filters.prixMax;
    }
    
    if (filters.enStock) {
      query.stock = { $gt: 0 };
    }
    
    if (filters.ville) {
      query['emplacement.ville'] = { $regex: filters.ville, $options: 'i' };
    }
    
    return this.produitModel.find(query).exec();
  }

  async getSimilarProducts(produitId: string): Promise<Produit[]> {
    const produit = await this.produitModel.findById(produitId).exec();
    if (!produit) return [];
    
    return this.produitModel.find({
      _id: { $ne: new Types.ObjectId(produitId) },
      $or: [
        { categorie: produit.categorie },
        { nom: { $regex: produit.nom.split(' ')[0], $options: 'i' } },
      ],
    }).limit(4).exec();
  }

 // ==================== AVIS ====================

async createAvis(createAvisDto: any): Promise<Avis> {
  const avisData: any = {
    clientId: new Types.ObjectId(createAvisDto.clientId),
    note: createAvisDto.note,
    commentaire: createAvisDto.commentaire || '',
    date_avis: new Date(),
    type: createAvisDto.type || 'service',
  };

  if (createAvisDto.commandeId) {
    try {
      avisData.commandeId = new Types.ObjectId(createAvisDto.commandeId);
    } catch (e) {}
  }

  if (createAvisDto.produitId) {
    try {
      avisData.produitId = new Types.ObjectId(createAvisDto.produitId);
      avisData.type = 'produit';
    } catch (e) {}
  }
  
  if (createAvisDto.vehicleId) {
    try {
      avisData.vehicleId = new Types.ObjectId(createAvisDto.vehicleId);
      avisData.type = 'livreur';
    } catch (e) {}
  }

  const avis = new this.avisModel(avisData);
  const savedAvis = await avis.save();
  
  return savedAvis;
}

async getAvisByProduit(produitId: string): Promise<Avis[]> {
  return this.avisModel.find({ 
    produitId: new Types.ObjectId(produitId),
    type: 'produit'
  }).sort({ createdAt: -1 }).exec();
}

async getAvisByLivreur(vehicleId: string): Promise<Avis[]> {
  return this.avisModel.find({ 
    vehicleId: new Types.ObjectId(vehicleId),
    type: 'livreur'
  }).sort({ createdAt: -1 }).exec();
}

async getAvisService(): Promise<Avis[]> {
  // Récupérer TOUS les avis de type 'service'
  const avis = await this.avisModel.find({ type: 'service' })
    .sort({ createdAt: -1 })
    .exec();
  
  console.log(`📊 ${avis.length} avis service trouvés`);
  return avis;
}

async getAvisStats(): Promise<any> {
  const totalAvis = await this.avisModel.countDocuments().exec();
  const moyenneGlobale = await this.avisModel.aggregate([
    { $group: { _id: null, moyenne: { $avg: '$note' } } }
  ]).exec();
  
  const avisParType = await this.avisModel.aggregate([
    { $group: { _id: '$type', count: { $sum: 1 }, moyenne: { $avg: '$note' } } }
  ]).exec();
  
  return {
    totalAvis,
    moyenneGlobale: moyenneGlobale[0]?.moyenne?.toFixed(1) || 0,
    avisParType,
  };
}
  // ==================== NOTIFICATIONS ====================

  async createNotification(userId: string, title: string, message: string, type: string = 'info'): Promise<Notification> {
    const notification = new this.notificationModel({
      userId: new Types.ObjectId(userId),
      title,
      message,
      type,
    });
    return notification.save();
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return this.notificationModel.find({ userId: new Types.ObjectId(userId) }).sort({ createdAt: -1 }).limit(50).exec();
  }

  async markNotificationAsRead(notificationId: string): Promise<Notification> {
    return this.notificationModel.findByIdAndUpdate(notificationId, { lu: true }, { new: true }).exec();
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    await this.notificationModel.updateMany(
      { userId: new Types.ObjectId(userId), lu: false },
      { lu: true }
    ).exec();
  }

  // ==================== STATISTIQUES ====================

async getGlobalStats(): Promise<any> {
  const totalCommandes = await this.commandeModel.countDocuments().exec();
  const totalProduits = await this.produitModel.countDocuments().exec();
  const totalLivreurs = await this.vehicleModel.countDocuments().exec();
  const totalAvis = await this.avisModel.countDocuments().exec();
  
  const chiffreAffaires = await this.commandeModel.aggregate([
    { $match: { statut: 'Livrée' } },
    { $group: { _id: null, total: { $sum: '$montant_total' } } }
  ]).exec();
  
  const noteMoyenneService = await this.avisModel.aggregate([
    { $match: { type: 'service' } },
    { $group: { _id: null, moyenne: { $avg: '$note' } } }
  ]).exec();
  
  return {
    totalCommandes,
    totalProduits,
    totalLivreurs,
    totalAvis,
    chiffreAffaires: chiffreAffaires[0]?.total || 0,
    noteMoyenneService: noteMoyenneService[0]?.moyenne?.toFixed(1) || 0,
  };
}

async getSalesStats(periode?: string): Promise<any> {
  let dateFilter = {};
  const now = new Date();
  
  if (periode === 'mois') {
    const debutMois = new Date(now.getFullYear(), now.getMonth(), 1);
    dateFilter = { date_commande: { $gte: debutMois } };
  } else if (periode === 'semaine') {
    const debutSemaine = new Date(now.setDate(now.getDate() - 7));
    dateFilter = { date_commande: { $gte: debutSemaine } };
  }
  
  const ventesParJour = await this.commandeModel.aggregate([
    { $match: { ...dateFilter, statut: 'Livrée' } },
    { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$date_commande' } },
        total: { $sum: '$montant_total' },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]).exec();
  
  const ventesParMois = await this.commandeModel.aggregate([
    { $match: { statut: 'Livrée' } },
    { $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$date_commande' } },
        total: { $sum: '$montant_total' },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]).exec();
  
  return { ventesParJour, ventesParMois };
}

async getTopLivreurs(): Promise<any[]> {
  const livreursWithDeliveries = await this.livraisonModel.aggregate([
    { $match: { vehicleId: { $exists: true } } },
    { $group: {
        _id: '$vehicleId',
        nombreLivraisons: { $sum: 1 }
      }
    },
    { $sort: { nombreLivraisons: -1 } },
    { $limit: 5 },
    { $lookup: { from: 'vehicles', localField: '_id', foreignField: '_id', as: 'vehicle' } }
  ]).exec();
  
  const livreursWithAvis = await Promise.all(livreursWithDeliveries.map(async (l) => {
    const avis = await this.avisModel.aggregate([
      { $match: { vehicleId: l._id, type: 'livreur' } },
      { $group: { _id: null, moyenne: { $avg: '$note' } } }
    ]).exec();
    
    return {
      ...l,
      vehicle: l.vehicle[0],
      noteMoyenne: avis[0]?.moyenne?.toFixed(1) || 0
    };
  }));
  
  return livreursWithAvis;
}

async getTopProduits(): Promise<any[]> {
  const topProduits = await this.commandeItemModel.aggregate([
    { $group: {
        _id: '$produitId',
        totalVendus: { $sum: '$quantite' },
        chiffreAffaires: { $sum: { $multiply: ['$quantite', '$prix'] } }
      }
    },
    { $sort: { totalVendus: -1 } },
    { $limit: 5 },
    { $lookup: { from: 'produits', localField: '_id', foreignField: '_id', as: 'produit' } }
  ]).exec();
  
  const produitsWithAvis = await Promise.all(topProduits.map(async (p) => {
    const avis = await this.avisModel.aggregate([
      { $match: { produitId: p._id, type: 'produit' } },
      { $group: { _id: null, moyenne: { $avg: '$note' } } }
    ]).exec();
    
    return {
      ...p,
      produit: p.produit[0],
      noteMoyenne: avis[0]?.moyenne?.toFixed(1) || 0
    };
  }));
  
  return produitsWithAvis;
}
  // ==================== CALCUL DISTANCE (Haversine) ====================

  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // ==================== ESTIMATION PRIX ====================

  async estimatePrice(data: { type: string; quantite: number; qualite?: string }): Promise<{ prixEstime: number; fourchetteBasse: number; fourchetteHaute: number }> {
    const prixParUnite: Record<string, number> = {
      'ciment': 12.5,
      'briques': 0.85,
      'toles': 25,
      'peinture': 45,
      'carrelage': 42,
    };
    
    const qualiteMultiplier: Record<string, number> = {
      'standard': 1,
      'premium': 1.5,
      'luxe': 2.5,
    };
    
    const prixBase = prixParUnite[data.type.toLowerCase()] || 30;
    const multiplicateur = data.qualite ? qualiteMultiplier[data.qualite] || 1 : 1;
    const prixEstime = prixBase * data.quantite * multiplicateur;
    
    return {
      prixEstime,
      fourchetteBasse: prixEstime * 0.9,
      fourchetteHaute: prixEstime * 1.1,
    };
  }

  // ==================== CALCUL LIVRAISON ====================

  async calculateDeliveryPrice(
    produitId: string,
    destinationLat: number,
    destinationLng: number,
    vehicleId?: string
  ): Promise<{ distance: number; price: number; vehicles: any[] }> {
    const produit = await this.produitModel.findById(produitId).exec();
    if (!produit) throw new NotFoundException('Produit non trouvé');
    
    const distance = this.calculateDistance(
      produit.emplacement.lat,
      produit.emplacement.lng,
      destinationLat,
      destinationLng
    );
    
    const vehicles = await this.getAvailableVehicles();
    
    // Construction manuelle des objets vehicle sans utiliser toObject()
    const vehiclesWithPrice = vehicles.map(vehicle => {
      const vehiclePlain = {
        id: (vehicle as any)._id.toString(),
        nom: vehicle.nom,
        type: vehicle.type,
        capacite_tonnes: vehicle.capacite_tonnes,
        prix_km: vehicle.prix_km,
        prix_base: vehicle.prix_base,
        position_actuelle: vehicle.position_actuelle,
        disponible: vehicle.disponible,
        chauffeur_nom: (vehicle as any).chauffeur_nom,
        chauffeur_telephone: (vehicle as any).chauffeur_telephone,
        immatriculation: (vehicle as any).immatriculation,
        note_moyenne: (vehicle as any).note_moyenne || 0,
        nombre_courses: (vehicle as any).nombre_courses || 0,
        statut_disponible: (vehicle as any).statut_disponible,
        distance_km: distance,
        prix_livraison: vehicle.prix_base + (vehicle.prix_km * distance),
        peut_transporter: (produit.poids_kg || 0) <= vehicle.capacite_tonnes * 1000,
      };
      return vehiclePlain;
    });
    
    const filteredVehicles = vehiclesWithPrice.filter(v => v.peut_transporter);
    
    let selectedPrice = 0;
    if (vehicleId) {
      const selected = filteredVehicles.find(v => v.id === vehicleId);
      if (selected) selectedPrice = selected.prix_livraison;
    } else if (filteredVehicles.length > 0) {
      selectedPrice = filteredVehicles[0].prix_livraison;
    }
    
    return {
      distance,
      price: selectedPrice,
      vehicles: filteredVehicles,
    };
  }
  // ==================== ESTIMATIONS ====================

async createEstimation(createEstimationDto: any): Promise<Estimation> {
  const estimation = new this.estimationModel({
    ...createEstimationDto,
    clientId: new Types.ObjectId(createEstimationDto.clientId),
    date_estimation: new Date(),
  });
  return estimation.save();
}

async getEstimationsByClient(clientId: string): Promise<Estimation[]> {
  return this.estimationModel.find({ 
    clientId: new Types.ObjectId(clientId) 
  }).sort({ createdAt: -1 }).exec();
}

async getEstimationById(id: string): Promise<Estimation> {
  const estimation = await this.estimationModel.findById(id).exec();
  if (!estimation) throw new NotFoundException(`Estimation ${id} non trouvée`);
  return estimation;
}
}