import { Type } from 'class-transformer';
import {
  IsMongoId,
  IsOptional,
  IsString,
  MinLength,
  IsNumber,
  Min,
  Max,
} from 'class-validator';

export class SuiviPhotoDto {
  @IsMongoId()
  projectId: string;

  @IsMongoId()
  workerId: string;

  @IsString()
  @MinLength(1)
  photoUrl: string;

  @IsOptional()
  @IsString()
  photoBase64?: string;

  @IsOptional()
  uploadedAt?: string | Date;

  /** Pourcentage cible (0–100) si pas d’analyse IA ou en complément. */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  progressPercent?: number;
}
