import { ApiProperty } from '@nestjs/swagger';
import { ColumnType } from '../../enum/enum';
import { ColumnOption } from '../model/column-option.schema';
import { IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class CreateAdminColumnDto {
  @IsString()
  @ApiProperty()
  name: string;

  @IsString()
  @ApiProperty()
  dataKey: string;

  @IsOptional()
  @ApiProperty({ enum: ColumnType, default: ColumnType.Text })
  type: ColumnType;

  @ApiProperty()
  @IsOptional()
  projectId: Types.ObjectId;

  // only for select
  @IsOptional()
  @ApiProperty({ required: false, type: [ColumnOption] })
  options?: ColumnOption[];
}
