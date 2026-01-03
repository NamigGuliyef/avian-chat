import { IsString, IsOptional, IsArray, ValidateNested, IsNumber, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { Column } from '../model/column.schema';

export class AgentRowPermissionDto {

  @ApiProperty({ description: "Agent-in ID-si", example: 'user-1' })
  @IsNotEmpty()
  agentId: Types.ObjectId;

  @ApiProperty({ description: 'Başlanğıc sətir (start)', example: 1, required: false })
  @IsOptional()
  @IsNumber()
  startRow: number;


  @ApiProperty({ description: 'Son sətir (end)', example: 100, required: false })
  @IsOptional()
  @IsNumber()
  endRow: number;
}

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

  @ApiProperty({ description: 'Bu sheet-ə aid agent ID-ləri', type: [Types.ObjectId], required: false, example: ['user-1','user-2'] })
  @IsOptional()
  @IsArray()
  agentIds: Types.ObjectId[];


  @ApiProperty({ description: 'Agentlərin sətir icazələri', type: [AgentRowPermissionDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AgentRowPermissionDto)
  agentRowPermissions: AgentRowPermissionDto[];


  @ApiProperty({ description: 'Bu sheet-ə aid sütunlar', type: [Column], required: false })
  @IsOptional()
  @IsArray()
  columnIds: Column[];
}
