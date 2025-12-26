import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateChannelDto {
  @IsString()
  name: string;

  @IsString()
  companyId: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
