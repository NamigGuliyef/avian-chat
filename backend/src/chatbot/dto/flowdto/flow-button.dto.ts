import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ButtonDto {
  @ApiProperty()
  @IsString()
  label: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  emoji?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  goToFlowId?: string;
}
