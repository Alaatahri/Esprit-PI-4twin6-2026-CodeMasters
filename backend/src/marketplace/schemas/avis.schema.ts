import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AvisDocument = Avis & Document;

@Schema({ timestamps: true })
export class Avis {
  @Prop({ type: Types.ObjectId, ref: 'Commande' })
  commandeId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  clientId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Vehicle' })
  vehicleId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Produit' })
  produitId?: Types.ObjectId;

  @Prop({ required: true, min: 1, max: 5 })
  note: number;

  @Prop()
  commentaire: string;

  @Prop({ default: 'service' })
  type: string;

  @Prop({ default: '' })
  reponse: string;

  @Prop({ default: Date.now })
  date_avis: Date;
}

export const AvisSchema = SchemaFactory.createForClass(Avis);