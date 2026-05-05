import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type StatsDocument = Stats & Document;

@Schema({ timestamps: true })
export class Stats {
  @Prop({ required: true })
  date: Date;

  @Prop({ default: 0 })
  totalVentes: number;

  @Prop({ default: 0 })
  chiffreAffaires: number;

  @Prop({ default: 0 })
  nombreCommandes: number;

  @Prop({ default: 0 })
  nombreClients: number;

  @Prop({ type: Object, default: {} })
  topProduits: any[];

  @Prop({ type: Object, default: {} })
  topLivreurs: any[];

  @Prop({ type: Object, default: {} })
  ventesParCategorie: any[];
}

export const StatsSchema = SchemaFactory.createForClass(Stats);