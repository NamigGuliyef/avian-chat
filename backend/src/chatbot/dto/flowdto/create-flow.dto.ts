import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BlockDto } from './flow-block.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

export class CreateFlowDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiProperty()
  @IsNotEmpty()
  chatbotId: Types.ObjectId;

  @ApiProperty()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => BlockDto)
  blocks?: BlockDto[];
}
