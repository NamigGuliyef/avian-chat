import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class CreateExcelDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  projectId: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description: string;

  @ApiProperty()
  @IsOptional()
  @IsArray()
  agentIds: Types.ObjectId[];


  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  sheetIds: Types.ObjectId[];

}
