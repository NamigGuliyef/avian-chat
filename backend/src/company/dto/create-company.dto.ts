import { IsArray, IsOptional, IsString, IsEmail, IsUrl } from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  domain?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsUrl()
  @IsOptional()
  website?: string;

  @IsArray()
  @IsOptional()
  channels?: string[]; // channel ids
}
