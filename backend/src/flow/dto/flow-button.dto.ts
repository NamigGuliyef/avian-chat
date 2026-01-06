import { IsOptional, IsString } from 'class-validator';

export class ButtonDto {
  @IsString()
  label: string;

  @IsOptional()
  @IsString()
  emoji?: string;

  @IsOptional()
  @IsString()
  goToFlowId?: string;
}
