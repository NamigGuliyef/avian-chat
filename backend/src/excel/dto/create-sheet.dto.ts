import { IsString, IsOptional, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class AgentRowPermissionDto {
  @IsString()
  agentId: string;

  @IsOptional()
  @IsNumber()
  startRow?: number;

  @IsOptional()
  @IsNumber()
  endRow?: number;
}

export class CreateSheetDto {
  @IsString()
  projectId: string;

  @IsString()
  excelId: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  agentIds?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AgentRowPermissionDto)
  agentRowPermissions?: AgentRowPermissionDto[];
}
