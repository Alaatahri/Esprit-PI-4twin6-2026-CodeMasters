import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DeliveryRequestDocument = DeliveryRequest & Document;

@Schema({ timestamps: true })
export class DeliveryRequest {
  @Prop({ type: Types.ObjectId, ref: 'Commande', required: true })
  commandeId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  clientId: Types.ObjectId;

  @Prop({
    type: {
      adresse: { type: String, required: true },
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    required: true,
  })
  adresse_livraison: {
    adresse: string;
    lat: number;
    lng: number;
  };

  @Prop({
    type: {
      adresse: { type: String, required: true },
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    required: true,
  })
  adresse_depart: {
    adresse: string;
    lat: number;
    lng: number;
  };

  @Prop({ type: Types.ObjectId, ref: 'Vehicle' })
  vehicleId?: Types.ObjectId;

  @Prop()
  distance_km?: number;

  @Prop()
  cout_livraison?: number;

  @Prop()
  duree_estimee_min?: number;

  @Prop({
    enum: ['en_attente', 'en_cours', 'livree', 'annulee'],
    default: 'en_attente',
  })
  statut: string;

  @Prop({ type: [{ lat: Number, lng: Number, timestamp: Date }], default: [] })
  historique_position: Array<{ lat: number; lng: number; timestamp: Date }>;

  @Prop()
  chauffeur_nom?: string;

  @Prop()
  chauffeur_telephone?: string;

  @Prop()
  date_livraison_prevue?: Date;

  @Prop()
  date_livraison_reelle?: Date;
}

export const DeliveryRequestSchema = SchemaFactory.createForClass(DeliveryRequest);