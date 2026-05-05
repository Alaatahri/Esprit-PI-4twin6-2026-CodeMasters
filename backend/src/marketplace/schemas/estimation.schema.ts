import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EstimationDocument = Estimation & Document;

@Schema({ timestamps: true })
export class Estimation {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  clientId: Types.ObjectId;

  @Prop()
  titre: string;

  @Prop()
  description_besoin: string;

  @Prop()
  type_projet: string; // 'construction', 'renovation', 'terrassement', 'finition'

  @Prop()
  surface_m2: number;

  @Prop()
  nombre_pieces: number;

  @Prop()
  etages: number;

  @Prop({ type: [String] })
  photos: string[];

  @Prop({ type: Object, default: {} })
  produits_recommandes: any[];

  @Prop({ type: Object, default: {} })
  estimation: {
    prix_total: number;
    produits: Array<{
      produitId: string;
      nom: string;
      quantite: number;
      prix_unitaire: number;
      prix_total: number;
    }>;
    main_oeuvre: number;
    frais_livraison: number;
  };

  @Prop({ default: 'en_attente' })
  statut: string;

  @Prop()
  date_estimation: Date;
}

export const EstimationSchema = SchemaFactory.createForClass(Estimation);