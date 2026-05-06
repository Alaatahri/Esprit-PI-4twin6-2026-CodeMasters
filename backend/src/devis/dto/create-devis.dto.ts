import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

/** Ligne article alignée sur le formulaire marketplace / gestion-devis */
export class DevisArticleLineDto {
  @IsString()
  @MaxLength(500)
  nom: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  quantite: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  prix_unitaire: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  total?: number;
}

export class CreateDevisDto {
  @IsOptional()
  @IsMongoId()
  projectId?: string;

  @IsOptional()
  @IsMongoId()
  clientId?: string;

  /** Expert référencé sur le devis (synonyme métier : artisan qui rédige) */
  @IsOptional()
  @IsMongoId()
  expertId?: string;

  @IsOptional()
  @IsMongoId()
  artisanId?: string;

  /** Si absent, calculé à partir des lignes `articles` (somme HT des totaux / qté×pu) */
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  montant_total?: number;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  titre?: string;

  @IsOptional()
  @IsString()
  @MaxLength(8000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  temp_client_nom?: string;

  @IsOptional()
  @IsString()
  @MaxLength(254)
  temp_client_email?: string;

  /** Consommé par le service pour fixer le statut ; non persisté tel quel */
  @IsOptional()
  @IsBoolean()
  envoyer?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DevisArticleLineDto)
  articles?: DevisArticleLineDto[];

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(3650)
  @Type(() => Number)
  delai_validite?: number;

  @IsOptional()
  @IsIn([
    'En attente',
    'Accepté',
    'Refusé',
    'brouillon',
    'envoyé',
    'accepté',
    'refusé',
    'expiré',
  ])
  statut?: string;

  @IsOptional()
  date_creation?: Date;
}
