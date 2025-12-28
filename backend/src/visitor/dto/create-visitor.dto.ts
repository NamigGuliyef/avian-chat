import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

export enum Gender {
  Male = 'Male',
  Female = 'Female',
  Gay = 'Gay',
  Other = 'Other',
}

export class CreateVisitorDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  ipAddress?: string;

  @IsString()
  conversationId: string;

  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @IsString()
  @IsOptional()
  device?: string;

  @IsString()
  @IsOptional()
  os?: string;

  @IsString()
  @IsOptional()
  language?: string;

  @IsString()
  @IsOptional()
  originChannel?: string;

  @IsDateString()
  @IsOptional()
  firstSeen?: string;

  @IsDateString()
  @IsOptional()
  lastSeen?: string;
}
