import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CommandeDocument = Commande & Document;

@Schema({ timestamps: true })
export class Commande {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  clientId: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  montant_total: number;

  @Prop({
    required: true,
    enum: ['En attente', 'Payée', 'En préparation', 'En livraison', 'Livrée', 'Annulée'],
    default: 'En attente',
  })
  statut: string;

  @Prop({ required: true, default: Date.now })
  date_commande: Date;

  // ⭐ NOUVEAU : Mode de paiement
  @Prop({
    enum: ['100%', '50/50', 'à_livraison'],
    default: '100%',
  })
  mode_paiement: string;

  // ⭐ NOUVEAU : Montant payé immédiatement
  @Prop({ default: 0, min: 0 })
  montant_paye: number;

  // ⭐ NOUVEAU : Référence du livreur choisi
  @Prop({ type: Types.ObjectId, ref: 'Vehicle' })
  vehicleId?: Types.ObjectId;

  // ⭐ NOUVEAU : Prix de la livraison
  @Prop({ default: 0, min: 0 })
  prix_livraison: number;
}

export const CommandeSchema = SchemaFactory.createForClass(Commande);