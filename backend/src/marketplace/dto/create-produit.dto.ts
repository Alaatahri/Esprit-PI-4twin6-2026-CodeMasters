import { Type } from 'class-transformer';
import {
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
  IsObject,
  ValidateNested,
} from 'class-validator';

export class EmplacementDto {
  @IsString()
  ville: string;

  @IsString()
  adresse: string;

  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;
}

export class CreateProduitDto {
  @IsString()
  @MinLength(1)
  nom: string;

  @IsString()
  @MinLength(1)
  description: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  prix: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  stock: number;

  @IsOptional()
  @IsString()
  image_url?: string;

  @IsMongoId()
  vendeurId: string;

  @IsOptional()
  @IsString()
  categorie?: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => EmplacementDto)
  emplacement?: EmplacementDto;

  @IsOptional()
  @IsNumber()
  @Min(0)
  poids_kg?: number;
}