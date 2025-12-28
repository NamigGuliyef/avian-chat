import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateLeadDto {
  @IsString()
  phone: string;

  @IsString()
  @IsOptional()
  maskedPhone?: string;

  @IsString()
  @IsOptional()
  callStatus?: string;

  @IsString()
  @IsOptional()
  callDate?: string;

  @IsString()
  @IsOptional()
  customerStatus?: string;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsNumber()
  @IsOptional()
  monthlyPayment?: number;

  @IsString()
  @IsOptional()
  tariff?: string;

  @IsString()
  @IsOptional()
  bonus?: string;

  @IsNumber()
  @IsOptional()
  cost?: number;

  @IsString()
  @IsOptional()
  assignedUser?: string;

  @IsString()
  @IsOptional()
  sheetId?: string;
}
