import { IsOptional, IsString, IsArray } from 'class-validator';

export class UpdateExcelDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  agentIds?: string[];
}
