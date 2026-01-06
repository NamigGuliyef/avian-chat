import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsString } from 'class-validator';
import { mongo, Mongoose, Types } from 'mongoose';

export class CreateTriggerDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsArray()
  keywords: string[];

  @ApiProperty()
  @IsString()
  chatbotId: Types.ObjectId;
  
  @ApiProperty()
  @IsString()
  targetFlowId: string;
  
  @ApiProperty()
  @IsBoolean()
  isActive: boolean;
}
