import { IsMongoId, IsString, MaxLength, MinLength } from 'class-validator';

export class SendMessageDto {
  @IsMongoId()
  toUserId: string;

  @IsString()
  @MinLength(1)
  @MaxLength(8000)
  body: string;
}
