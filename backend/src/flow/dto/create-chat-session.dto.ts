import { IsNotEmpty, IsString, IsBoolean, IsOptional } from 'class-validator';
import { Types } from 'mongoose';

export class CreateChatSessionDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsOptional()
  flowId?: Types.ObjectId; // Başlanğıcda session trigger-a görə təyin olunur

  @IsNotEmpty()
  @IsString()
  currentBlockId: string;

  @IsOptional()
  @IsBoolean()
  isFinished?: boolean = false;
}
