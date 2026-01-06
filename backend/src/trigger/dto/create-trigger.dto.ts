import { IsArray, IsBoolean, IsString } from 'class-validator';

export class CreateTriggerDto {
  @IsString()
  name: string;

  @IsArray()
  keywords: string[];

  @IsString()
  targetFlowId: string;

  @IsBoolean()
  isActive: boolean;
}
