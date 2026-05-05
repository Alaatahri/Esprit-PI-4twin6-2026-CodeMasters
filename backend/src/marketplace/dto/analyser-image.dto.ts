import { IsString, MaxLength, MinLength } from 'class-validator';

export class AnalyserImageDto {
  @IsString()
  @MinLength(50)
  @MaxLength(15_000_000)
  /** Base64 ou data URL */
  image: string;
}
