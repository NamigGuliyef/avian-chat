import { ApiProperty } from '@nestjs/swagger';
import { ColumnType } from 'src/enum/enum';
import { ColumnOption } from '../model/column-option.schema';
import { IsOptional, IsString } from 'class-validator';

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

  // only for select
  @IsOptional()
  @ApiProperty({ required: false, type: [ColumnOption] })
  options?: ColumnOption[];
}
