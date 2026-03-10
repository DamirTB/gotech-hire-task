import { IsString, IsNumber, MinLength, MaxLength } from 'class-validator';

// This DTO is defined but never used - controllers use `body: any` instead
export class SendMessageDto {
  @IsNumber()
  roomId: number;

  @IsNumber()
  userId: number;

  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  content: string;
}
