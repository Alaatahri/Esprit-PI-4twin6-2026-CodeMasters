import {
 Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  Patch,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { MarketplaceService } from './marketplace.service';
import { CreateProduitDto } from './dto/create-produit.dto';
import { UpdateProduitDto } from './dto/update-produit.dto';
import { CreateCommandeDto } from './dto/create-commande.dto';
import { UpdateCommandeDto } from './dto/update-commande.dto';
import { CreateAvisDto } from './dto/create-avis.dto';
import { CreateLivraisonDto } from './dto/create-livraison.dto';
import { AIEstimationService } from './services/ai-estimation.service'; // ⭐ AJOUTER CET IMPORT
import { CreateEstimationDto } from './dto/create-estimation.dto'; // ⭐ AJOUTER CET IMPORT
import { EstimatePriceDto } from './dto/estimate-price.dto';
import { CalculateDeliveryDto } from './dto/calculate-delivery.dto';
import { AnalyserBesoinDto } from './dto/analyser-besoin.dto';
import { AnalyserImageDto } from './dto/analyser-image.dto';

@Controller('marketplace')
export class MarketplaceController {
  constructor(
    private readonly marketplaceService: MarketplaceService,
    private readonly aiEstimationService: AIEstimationService, // ⭐ AJOUTER CETTE LIGNE
  ) {}

  // ==================== PRODUITS ====================

  @Post('produits')
  createProduit(@Body() createProduitDto: CreateProduitDto) {
    const produitData = {
      ...createProduitDto,
      vendeurId: new Types.ObjectId(createProduitDto.vendeurId),
    };
    return this.marketplaceService.createProduit(produitData);
  }

  @Get('produits')
  findAllProduits() {
    return this.marketplaceService.findAllProduits();
  }

  @Get('produits/:id')
  findProduitById(@Param('id') id: string) {
    return this.marketplaceService.findProduitById(id);
  }

  @Put('produits/:id')
  updateProduit(
    @Param('id') id: string,
    @Body() updateProduitDto: UpdateProduitDto,
  ) {
    return this.marketplaceService.updateProduit(id, updateProduitDto);
  }

  @Delete('produits/:id')
  removeProduit(@Param('id') id: string) {
    return this.marketplaceService.removeProduit(id);
  }

  // ==================== COMMANDES ====================

  @Post('commandes')
  createCommande(@Body() createCommandeDto: CreateCommandeDto) {
    return this.marketplaceService.createCommande(createCommandeDto);
  }

  @Get('commandes')
  findAllCommandes(@Query('clientId') clientId?: string) {
    if (clientId) {
      return this.marketplaceService.findByClient(clientId);
    }
    return this.marketplaceService.findAllCommandes();
  }

  @Get('commandes/:id')
  findCommandeById(@Param('id') id: string) {
    return this.marketplaceService.findCommandeById(id);
  }

  @Put('commandes/:id')
  updateCommande(
    @Param('id') id: string,
    @Body() updateCommandeDto: UpdateCommandeDto,
  ) {
    return this.marketplaceService.updateCommande(id, updateCommandeDto);
  }

  @Patch('commandes/:id/statut')
  updateCommandeStatus(
    @Param('id') id: string,
    @Body('statut') statut: string,
  ) {
    return this.marketplaceService.updateCommandeStatus(id, statut);
  }

  @Delete('commandes/:id')
  removeCommande(@Param('id') id: string) {
    return this.marketplaceService.removeCommande(id);
  }

  // ==================== ITEMS DE COMMANDE ====================

  @Get('commandes/:id/items')
  findCommandeItems(@Param('id') commandeId: string) {
    return this.marketplaceService.findItemsByCommande(commandeId);
  }

  // ==================== LIVRAISONS ====================

  @Post('commandes/:id/livraison')
  createLivraison(
    @Param('id') commandeId: string,
    @Body() createLivraisonDto: CreateLivraisonDto,
  ) {
    return this.marketplaceService.createLivraison(commandeId, createLivraisonDto);
  }

  @Get('commandes/:id/livraison')
  getLivraisonByCommande(@Param('id') commandeId: string) {
    return this.marketplaceService.getLivraisonByCommande(commandeId);
  }

  @Put('livraison/:id/tracking')
  updateTrackingPosition(
    @Param('id') livraisonId: string,
    @Body() position: { lat: number; lng: number },
  ) {
    return this.marketplaceService.updateTrackingPosition(livraisonId, position);
  }

  @Patch('livraison/:id/statut')
  updateLivraisonStatus(
    @Param('id') livraisonId: string,
    @Body('statut') statut: string,
  ) {
    return this.marketplaceService.updateLivraisonStatus(livraisonId, statut);
  }

  // ==================== ENDPOINTS LIVREUR ====================

  @Get('livreur/:userId/vehicle')
  getVehicleByUser(@Param('userId') userId: string) {
    return this.marketplaceService.getVehicleByUser(userId);
  }

  @Get('livreur/vehicle/:vehicleId/deliveries')
  getDeliveriesByVehicle(@Param('vehicleId') vehicleId: string) {
    return this.marketplaceService.getDeliveriesByVehicle(vehicleId);
  }

  @Get('livreur/available-deliveries')
  getAvailableDeliveries() {
    return this.marketplaceService.getAvailableDeliveries();
  }

  @Post('livreur/livraison/:id/accept')
  acceptDelivery(
    @Param('id') livraisonId: string,
    @Body('vehicleId') vehicleId: string,
  ) {
    return this.marketplaceService.acceptDelivery(livraisonId, vehicleId);
  }

  // ==================== VEHICULES ====================

  @Get('vehicles')
  async getVehicles() {
    return this.marketplaceService.getVehicles();
  }

  @Get('vehicles/available')
  async getAvailableVehicles() {
    return this.marketplaceService.getAvailableVehicles();
  }

  @Get('vehicles/:id')
  async getVehicleById(@Param('id') id: string) {
    return this.marketplaceService.getVehicleById(id);
  }

  @Put('vehicles/:id/position')
  async updateVehiclePosition(
    @Param('id') id: string,
    @Body() position: { lat: number; lng: number },
  ) {
    return this.marketplaceService.updateVehiclePosition(id, position);
  }

  @Patch('vehicles/:id/availability')
  async updateVehicleAvailability(
    @Param('id') id: string,
    @Body('disponible') disponible: boolean,
  ) {
    return this.marketplaceService.updateVehicleAvailability(id, disponible);
  }

  // ==================== RECHERCHE AVANCÉE ====================

  @Get('produits/recherche/avancee')
  searchProducts(
    @Query('q') query: string,
    @Query('categorie') categorie: string,
    @Query('prixMin') prixMin: number,
    @Query('prixMax') prixMax: number,
    @Query('enStock') enStock: boolean,
    @Query('ville') ville: string,
  ) {
    return this.marketplaceService.searchProducts({
      query,
      categorie,
      prixMin,
      prixMax,
      enStock,
      ville,
    });
  }

  // ==================== PRODUITS SIMILAIRES ====================

  @Get('produits/:id/similaires')
  getSimilarProducts(@Param('id') produitId: string) {
    return this.marketplaceService.getSimilarProducts(produitId);
  }

 // ==================== AVIS ====================

@Post('avis')
async createAvis(@Body() createAvisDto: CreateAvisDto) {
  return this.marketplaceService.createAvis(createAvisDto);
}

@Get('avis/produit/:produitId')
async getAvisByProduit(@Param('produitId') produitId: string) {
  return this.marketplaceService.getAvisByProduit(produitId);
}

@Get('avis/livreur/:vehicleId')
async getAvisByLivreur(@Param('vehicleId') vehicleId: string) {
  return this.marketplaceService.getAvisByLivreur(vehicleId);
}

@Get('avis/service')
async getAvisService() {
  return this.marketplaceService.getAvisService();
}

@Get('avis/stats')
async getAvisStats() {
  return this.marketplaceService.getAvisStats();
}
// ==================== STATISTIQUES ====================

@Get('stats/global')
async getGlobalStats() {
  return this.marketplaceService.getGlobalStats();
}

@Get('stats/ventes')
async getSalesStats(@Query('periode') periode?: string) {
  return this.marketplaceService.getSalesStats(periode);
}

@Get('stats/livreurs/populaires')
async getTopLivreurs() {
  return this.marketplaceService.getTopLivreurs();
}

@Get('stats/produits/tendances')
async getTopProduits() {
  return this.marketplaceService.getTopProduits();
}
  // ==================== NOTIFICATIONS ====================

  @Get('users/:userId/notifications')
  getUserNotifications(@Param('userId') userId: string) {
    return this.marketplaceService.getUserNotifications(userId);
  }

  @Put('notifications/:id/read')
  markNotificationAsRead(@Param('id') id: string) {
    return this.marketplaceService.markNotificationAsRead(id);
  }

  @Put('users/:userId/notifications/read-all')
  markAllNotificationsAsRead(@Param('userId') userId: string) {
    return this.marketplaceService.markAllNotificationsAsRead(userId);
  }

  

  // ==================== ESTIMATION PRIX ====================

  @Post('estimation/prix')
  estimatePrice(@Body() data: EstimatePriceDto) {
    return this.marketplaceService.estimatePrice(data);
  }

  // ==================== CALCUL LIVRAISON ====================

  @Post('calcul/livraison')
  calculateDeliveryPrice(@Body() data: CalculateDeliveryDto) {
    return this.marketplaceService.calculateDeliveryPrice(
      data.produitId,
      data.destinationLat,
      data.destinationLng,
      data.vehicleId
    );
  }

  // ==================== ESTIMATION INTELLIGENTE ====================

@Post('estimation/analyser-besoin')
async analyserBesoin(@Body() data: AnalyserBesoinDto) {
  return this.aiEstimationService.analyserBesoin(
    data.description,
    data.surface,
    data.type_projet
  );
}

@Post('estimation/analyser-image')
async analyserImage(@Body() data: AnalyserImageDto) {
  return this.aiEstimationService.analyserImage(data.image);
}

@Post('estimations')
async createEstimation(@Body() createEstimationDto: CreateEstimationDto) {
  return this.marketplaceService.createEstimation(createEstimationDto);
}

@Get('estimations/client/:clientId')
async getEstimationsByClient(@Param('clientId') clientId: string) {
  return this.marketplaceService.getEstimationsByClient(clientId);
}

@Get('estimations/:id')
async getEstimationById(@Param('id') id: string) {
  return this.marketplaceService.getEstimationById(id);
}
}