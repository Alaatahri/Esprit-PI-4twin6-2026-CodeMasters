import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LivraisonDocument = Livraison & Document;

@Schema({ timestamps: true })
export class Livraison {
  @Prop({ type: Types.ObjectId, ref: 'Commande', required: true })
  commandeId: Types.ObjectId;

  @Prop({ required: true })
  adresse_livraison: string;

  @Prop({
    type: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    required: true,
  })
  coordonnees: {
    lat: number;
    lng: number;
  };

  @Prop({
    enum: ['En préparation', 'Expédiée', 'En livraison', 'Livrée', 'Annulée'],
    default: 'En préparation',
  })
  statut: string;

  @Prop()
  date_expedition?: Date;

  @Prop()
  date_livraison_prevue?: Date;

  @Prop()
  date_livraison_reelle?: Date;

  @Prop({ type: [{ lat: Number, lng: Number, timestamp: Date }], default: [] })
  historique_position: Array<{
    lat: number;
    lng: number;
    timestamp: Date;
  }>;

  @Prop()
  livreur_nom?: string;

  @Prop()
  livreur_telephone?: string;

  @Prop()
  tracking_number?: string;

  // ⭐ NOUVEAU : Distance totale parcourue (km)
  @Prop({ default: 0 })
  distance_totale_km: number;

  // ⭐ NOUVEAU : Point de départ (entrepôt)
  @Prop({
    type: {
      adresse: { type: String },
      lat: { type: Number },
      lng: { type: Number },
    },
  })
  point_depart: {
    adresse: string;
    lat: number;
    lng: number;
  };

  // ⭐ NOUVEAU : Dernière mise à jour position
  @Prop()
  derniere_mise_a_jour: Date;

  // ⭐ NOUVEAU : Véhicule assigné
  @Prop({ type: Types.ObjectId, ref: 'Vehicle' })
  vehicleId?: Types.ObjectId;

  @Prop()
  cout_livraison?: number;
}

export const LivraisonSchema = SchemaFactory.createForClass(Livraison);