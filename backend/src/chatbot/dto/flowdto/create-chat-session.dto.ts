import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsBoolean, IsOptional } from 'class-validator';
import { Types } from 'mongoose';

export class CreateChatSessionDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty()
  @IsOptional()
  flowId?: Types.ObjectId; // Başlanğıcda session trigger-a görə təyin olunur

  
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  currentBlockId: string;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isFinished?: boolean = false;
}
