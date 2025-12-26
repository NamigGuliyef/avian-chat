import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  name: string;

  @IsArray()
  @IsOptional()
  channels?: string[];

  @IsString()
  domain: string;
}
