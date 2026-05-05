import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export class EstimatePriceDto {
  @IsString()
  @MinLength(1)
  type: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  @Max(1_000_000)
  quantite: number;

  @IsOptional()
  @IsString()
  qualite?: string;
}
