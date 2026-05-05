import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MarketplaceController } from './marketplace.controller';
import { MarketplaceService } from './marketplace.service';
import { AIEstimationService } from './services/ai-estimation.service'; // ⭐ AJOUTER
import { Produit, ProduitSchema } from './schemas/produit.schema';
import { Commande, CommandeSchema } from './schemas/commande.schema';
import { CommandeItem, CommandeItemSchema } from './schemas/commande-item.schema';
import { Livraison, LivraisonSchema } from './schemas/livraison.schema';
import { Vehicle, VehicleSchema } from './schemas/vehicle.schema';
import { Avis, AvisSchema } from './schemas/avis.schema';
import { Notification, NotificationSchema } from './schemas/notification.schema';
import { Estimation, EstimationSchema } from './schemas/estimation.schema'; // ⭐ AJOUTER

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Produit.name, schema: ProduitSchema },
      { name: Commande.name, schema: CommandeSchema },
      { name: CommandeItem.name, schema: CommandeItemSchema },
      { name: Livraison.name, schema: LivraisonSchema },
      { name: Vehicle.name, schema: VehicleSchema },
      { name: Avis.name, schema: AvisSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: Estimation.name, schema: EstimationSchema }, // ⭐ AJOUTER
    ]),
  ],
  controllers: [MarketplaceController],
  providers: [MarketplaceService, AIEstimationService], // ⭐ AJOUTER AIEstimationService
  exports: [MarketplaceService],
})
export class MarketplaceModule {}