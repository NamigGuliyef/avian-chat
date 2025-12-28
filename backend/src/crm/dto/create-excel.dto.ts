import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreateExcelDto {
  @IsString()
  projectId: string;

  @IsString()
  name: string;

  @IsArray()
  @IsOptional()
  agentIds?: string[];
}
