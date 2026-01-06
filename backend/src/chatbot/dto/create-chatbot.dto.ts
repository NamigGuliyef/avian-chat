import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { Types } from 'mongoose';

export class CreateChatbotDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  companyId: string;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  
  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isDeleted?: boolean;
  
  @ApiProperty({ required: false })
  @IsOptional()
  flowIds: Types.ObjectId[];
  
  
  @IsOptional()
  @ApiProperty({ required: false,  })
  triggerIds : Types.ObjectId[];
}
