import { Transform, Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class CreateAvisDto {
  @IsOptional()
  @ValidateIf((_, v) => v != null && String(v).trim() !== '')
  @IsMongoId()
  commandeId?: string;

  @IsMongoId()
  clientId: string;

  /** Requis si type=livreur ou si vehicleId est envoyé */
  @ValidateIf(
    (o) =>
      (o.type ?? 'service') === 'livreur' ||
      (o.vehicleId != null && String(o.vehicleId).trim() !== ''),
  )
  @IsMongoId()
  vehicleId?: string;

  /** Requis si type=produit ou si produitId est envoyé */
  @ValidateIf(
    (o) =>
      (o.type ?? 'service') === 'produit' ||
      (o.produitId != null && String(o.produitId).trim() !== ''),
  )
  @IsMongoId()
  produitId?: string;

  /** Requis si type=worker ou si workerId est envoyé */
  @ValidateIf(
    (o) =>
      (o.type ?? 'service') === 'worker' ||
      (o.workerId != null && String(o.workerId).trim() !== ''),
  )
  @IsMongoId()
  workerId?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  note: number;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : String(value ?? ''),
  )
  @IsString()
  @MinLength(1, { message: 'Le commentaire est requis.' })
  @MaxLength(4000)
  commentaire: string;

  @IsOptional()
  @IsString()
  @IsIn(['service', 'produit', 'livreur', 'worker'])
  type?: string;
}
