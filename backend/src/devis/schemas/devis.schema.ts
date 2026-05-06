import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DevisDocument = Devis & Document;

const ArticleLineSchema = {
  nom: { type: String, required: true },
  quantite: { type: Number, required: true, min: 0 },
  prix_unitaire: { type: Number, required: true, min: 0 },
  total: { type: Number, required: false, min: 0 },
};

@Schema({ timestamps: true })
export class Devis {
  @Prop({ type: Types.ObjectId, ref: 'Project', required: false })
  projectId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  clientId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  expertId: Types.ObjectId;

  @Prop({ trim: true })
  titre?: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ trim: true })
  temp_client_nom?: string;

  @Prop({ trim: true })
  temp_client_email?: string;

  @Prop({ type: [ArticleLineSchema], default: [] })
  articles: Array<{
    nom: string;
    quantite: number;
    prix_unitaire: number;
    total?: number;
  }>;

  @Prop({ default: 30, min: 1 })
  delai_validite?: number;

  /** Référence lisible (ex. DV-2026-001) */
  @Prop({ trim: true })
  numero_devis?: string;

  @Prop({ required: true, min: 0 })
  montant_total: number;

  @Prop({
    required: true,
    default: 'brouillon',
  })
  statut: string;

  @Prop({ required: false })
  date_creation?: Date;
}

export const DevisSchema = SchemaFactory.createForClass(Devis);
