import { Type } from 'class-transformer';
import {
  IsLatitude,
  IsLongitude,
  IsMongoId,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

export class CalculateDeliveryDto {
  @IsMongoId()
  produitId: string;

  @Type(() => Number)
  @Min(-90)
  @Max(90)
  @IsLatitude()
  destinationLat: number;

  @Type(() => Number)
  @Min(-180)
  @Max(180)
  @IsLongitude()
  destinationLng: number;

  @IsOptional()
  @IsMongoId()
  vehicleId?: string;
}
