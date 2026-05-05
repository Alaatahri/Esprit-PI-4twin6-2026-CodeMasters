import { Type } from 'class-transformer';
import {
  IsDate,
  IsIn,
  IsMongoId,
  IsNumber,
  IsOptional,
  Min,
  IsArray,
  ValidateNested,
  IsString,
} from 'class-validator';

export class CommandeItemInputDto {
  @IsMongoId()
  produitId: string;

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  quantite: number;
}

export class CreateCommandeDto {
  @IsMongoId()
  clientId: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  montant_total?: number;

  @IsOptional()
  @IsIn(['En attente', 'Payée', 'En préparation', 'En livraison', 'Livrée', 'Annulée'])
  statut?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  date_commande?: Date;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CommandeItemInputDto)
  items: CommandeItemInputDto[];

  @IsOptional()
  @IsIn(['100%', '50/50', 'à_livraison'])
  mode_paiement?: string;

  @IsOptional()
  @IsMongoId()
  vehicleId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  prix_livraison?: number;
}