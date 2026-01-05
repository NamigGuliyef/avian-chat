import { ApiProperty } from '@nestjs/swagger';
import { ColumnType } from 'src/enum/enum';
import { ColumnOption } from '../model/column-option.schema';

export class CreateAdminColumnDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  dataKey: string;

  @ApiProperty({ enum: ColumnType, default: ColumnType.Text })
  type: ColumnType;

  // only for select
  @ApiProperty({ required: false, type: [ColumnOption] })
  options?: ColumnOption[];
}
