import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { SheetColumn } from '../model/sheet.schema';


export class CreateSheetDto {
  @ApiProperty({ description: 'Excel-in ID-si', example: 'excel-1' })
  @IsNotEmpty()
  @IsString()
  excelId: string;

  @ApiProperty({ description: 'Layihənin (project) ID-si', example: 'proj-1' })
  @IsNotEmpty()
  @IsString()
  projectId: string;

  @ApiProperty({ description: 'Sheet adı', example: 'Yanvar satışları' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'İstəyə bağlı təsvir', example: 'Yanvar ayı satışları', required: false })
  @IsOptional()
  @IsString()
  description: string;

  @ApiProperty({ description: 'Bu sheet-ə aid agent ID-ləri', type: [Types.ObjectId], required: false, example: ['user-1', 'user-2'] })
  @IsOptional()
  @IsArray()
  agentIds: Types.ObjectId[];

  @ApiProperty({ description: 'Bu sheet-ə aid sütunlar', required: false })
  @IsOptional()
  @IsArray()
  columnIds: SheetColumn[];
}


export class CreateSheetColumnDto {

  @ApiProperty({ description: 'Sütunun ID-si', example: 'column-1' })
  @IsOptional()
  columnId: Types.ObjectId;

  @ApiProperty({ description: 'Sütunun redaktə olunma qabiliyyəti', example: true })
  @IsOptional()
  editable: boolean;

  @ApiProperty({ description: 'Sütunun doldurulma məcburiyyəti', example: true })
  @IsOptional()
  required: boolean;

  @ApiProperty({ description: 'Sütunun aid olduğu agentin ID-si', example: 'agent-1' })
  @IsOptional()
  agentId: Types.ObjectId;

  @ApiProperty({ description: 'Sütunun sıralama nömrəsi', example: 1 })
  @IsOptional()
  order: number;
}
