import { ApiOperation, ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  IsMongoId,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UserRole, OnlineStatus } from '../../enum/enum';
import { Types } from 'mongoose';


export class CreateUserDto {
  @ApiProperty({ example: 'John', required: true })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Doe', required: true })
  @IsString()
  @IsNotEmpty()
  surname: string;

  @ApiProperty({ example: 'user@example.com', required: true })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ required: false, minLength: 8 })
  @IsString()
  @IsOptional()
  @MinLength(8)
  password?: string;

  @ApiProperty({ enum: UserRole, default: UserRole.agent, required: true })
  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;

  @ApiProperty({ example: 'active', required: true })
  @IsString()
  @IsNotEmpty()
  status: string;

  // @ApiProperty()
  // @IsOptional()
  // assignedChannels: string[];

  @ApiProperty({ required: false, enum: OnlineStatus, default: OnlineStatus.offline })
  @IsEnum(OnlineStatus)
  @IsOptional()
  onlineStatus?: OnlineStatus;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  chatbotEnabled: boolean;

  @ApiProperty()
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  channelIds: Types.ObjectId[]; // user-e aid channel-lerin id-lerinin massivi


  @ApiProperty({ required: false })
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  projectIds: Types.ObjectId[];

  @ApiProperty({ required: true })
  @IsBoolean()
  @IsOptional()
  isActive: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isDeleted: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  startRow: number;

  @ApiProperty({ required: false })
  @IsOptional()
  endRow: number;

}
