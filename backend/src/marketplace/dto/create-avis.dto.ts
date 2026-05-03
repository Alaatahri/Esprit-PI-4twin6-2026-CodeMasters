import { IsMongoId, IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';

export class CreateAvisDto {
  @IsOptional()
  @IsMongoId()
  commandeId?: string;

  @IsMongoId()
  clientId: string;

  @IsOptional()
  @IsMongoId()
  vehicleId?: string;

  @IsOptional()
  @IsMongoId()
  produitId?: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  note: number;

  @IsOptional()
  @IsString()
  commentaire?: string;
}