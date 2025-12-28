import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Channel } from 'diagnostics_channel';

export class CreateCompanyDto {
  @ApiProperty({ example: 'Acme Inc.' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'acme.com', required: false })
  @IsString()
  @IsOptional()
  domain: string;

  @ApiProperty({ type: [String], description: 'Channel ids', required: false, example: ['64f3b2e...'], default: [] })
  @IsArray()
  @IsOptional()
  channels: Channel[];

}
