import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, ValidateNested, IsObject } from 'class-validator';

export class CoordonneesDto {
  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;
}

export class PointDepartDto {
  @IsString()
  adresse: string;

  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;
}

export class CreateLivraisonDto {
  @IsString()
  adresse_livraison: string;

  @IsObject()
  @ValidateNested()
  @Type(() => CoordonneesDto)
  coordonnees: CoordonneesDto;

  @IsOptional()
  @IsString()
  statut?: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => PointDepartDto)
  point_depart?: PointDepartDto;

  @IsOptional()
  @IsString()
  livreur_nom?: string;

  @IsOptional()
  @IsString()
  livreur_telephone?: string;

  @IsOptional()
  @IsString()
  vehicleId?: string;

  @IsOptional()
  @IsNumber()
  distance_km?: number;

  @IsOptional()
  @IsNumber()
  cout_livraison?: number;
}