import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class AnalyserBesoinDto {
  @IsString()
  @MinLength(3)
  @MaxLength(8000)
  description: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1_000_000)
  surface?: number;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  type_projet?: string;
}
