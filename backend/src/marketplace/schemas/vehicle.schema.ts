import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type VehicleDocument = Vehicle & Document;

@Schema({ timestamps: true })
export class Vehicle {
  @Prop({ required: true })
  nom: string;

  @Prop({ required: true, enum: ['camion_remorque', 'camion_benne', 'camion_toupie', 'utilitaire'] })
  type: string;

  @Prop({ required: true, min: 0 })
  capacite_tonnes: number;

  @Prop({ required: true, min: 0 })
  prix_km: number;

  @Prop({ required: true, min: 0 })
  prix_base: number;

  @Prop({
    type: { lat: { type: Number, required: true }, lng: { type: Number, required: true } },
    required: true,
  })
  position_actuelle: { lat: number; lng: number };

  @Prop({ default: true })
  disponible: boolean;

  // ⭐ NOUVEAU : Chauffeur associé (Lien vers User)
  @Prop({ type: String, ref: 'User' })
  userId?: string;

  @Prop()
  chauffeur_nom: string;

  // ⭐ NOUVEAU : Téléphone du chauffeur
  @Prop()
  chauffeur_telephone: string;

  // ⭐ NOUVEAU : Immatriculation
  @Prop()
  immatriculation: string;

  // ⭐ NOUVEAU : Note moyenne du chauffeur (1-5)
  @Prop({ default: 0, min: 0, max: 5 })
  note_moyenne: number;

  // ⭐ NOUVEAU : Nombre de courses effectuées
  @Prop({ default: 0 })
  nombre_courses: number;

  // ⭐ NOUVEAU : Disponibilité en temps réel (toggle)
  @Prop({ default: true })
  statut_disponible: boolean;
}

export const VehicleSchema = SchemaFactory.createForClass(Vehicle);