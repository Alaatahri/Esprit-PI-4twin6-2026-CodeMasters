import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProduitDocument = Produit & Document;

@Schema({ timestamps: true })
export class Produit {
  @Prop({ required: true })
  nom: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, min: 0 })
  prix: number;

  @Prop({ required: true, min: 0 })
  stock: number;

  @Prop()
  image_url?: string;

  @Prop({ required: true, default: 'Autre' })
  categorie: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  vendeurId: Types.ObjectId;

  // ⭐ NOUVEAU : Emplacement géographique du produit (entrepôt)
  @Prop({
    type: {
      ville: { type: String, required: true, default: 'Tunis' },
      adresse: { type: String, required: true, default: 'Zone industrielle' },
      lat: { type: Number, required: true, default: 36.8065 },
      lng: { type: Number, required: true, default: 10.1815 },
    },
    required: true,
  })
  emplacement: {
    ville: string;
    adresse: string;
    lat: number;
    lng: number;
  };

  // ⭐ NOUVEAU : Poids du produit en kg (pour calcul capacité véhicule)
  @Prop({ default: 0, min: 0 })
  poids_kg: number;

  @Prop()
  model3d_url?: string;
}

export const ProduitSchema = SchemaFactory.createForClass(Produit);