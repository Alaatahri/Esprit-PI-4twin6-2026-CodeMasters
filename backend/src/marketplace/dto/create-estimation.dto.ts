import { IsMongoId, IsNumber, IsOptional, IsString, Min, IsArray } from 'class-validator';

export class CreateEstimationDto {
  @IsMongoId()
  clientId: string;

  @IsOptional()
  @IsString()
  titre?: string;

  @IsString()
  description_besoin: string;

  @IsOptional()
  @IsString()
  type_projet?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  surface_m2?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  nombre_pieces?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  etages?: number;

  @IsOptional()
  @IsArray()
  photos?: string[];
}