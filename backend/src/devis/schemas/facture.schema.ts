import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FactureDocument = Facture & Document;

const ArticleLineSchema = {
  nom: { type: String, required: true },
  quantite: { type: Number, required: true, min: 0 },
  prix_unitaire: { type: Number, required: true, min: 0 },
  total: { type: Number, required: false, min: 0 },
};

@Schema({ timestamps: true })
export class Facture {
  @Prop({ trim: true, required: true })
  numero_facture: string;

  @Prop({ trim: true })
  titre?: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ type: [ArticleLineSchema], default: [] })
  articles: Array<{
    nom: string;
    quantite: number;
    prix_unitaire: number;
    total?: number;
  }>;

  @Prop({ required: true, min: 0 })
  montant_total: number;

  @Prop({ default: 0, min: 0 })
  montant_paye: number;

  @Prop({ default: 0, min: 0 })
  solde_du: number;

  @Prop({ default: 'envoyée' })
  statut: string;

  @Prop({ type: Date, default: () => new Date() })
  date_facture: Date;

  @Prop({ type: Date })
  date_echeance?: Date;

  @Prop({ type: Types.ObjectId, ref: 'Project' })
  projectId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  clientId?: Types.ObjectId;

  /** expert / artisan ayant émis le devis */
  @Prop({ type: Types.ObjectId, ref: 'User' })
  artisanId?: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'Devis',
    required: true,
    unique: true,
  })
  devisId: Types.ObjectId;

  @Prop({ trim: true })
  temp_client_nom?: string;

  @Prop({ trim: true })
  temp_client_email?: string;

  /** Historique des règlements */
  @Prop({
    type: [
      {
        montant: { type: Number, required: true, min: 0 },
        methode_paiement: { type: String, default: 'virement' },
        details: { type: Object, required: false },
        createdAt: { type: Date, default: () => new Date() },
      },
    ],
    default: [],
  })
  paiements: Array<{
    montant: number;
    methode_paiement?: string;
    details?: Record<string, unknown>;
    createdAt?: Date;
  }>;
}

export const FactureSchema = SchemaFactory.createForClass(Facture);
