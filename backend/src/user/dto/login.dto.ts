import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @MaxLength(254)
  email: string;

  @IsString()
  @MinLength(1, { message: 'mot_de_passe est requis' })
  @MaxLength(256)
  mot_de_passe: string;
}
