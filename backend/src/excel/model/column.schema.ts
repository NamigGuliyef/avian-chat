
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';
import { ColumnType } from 'src/enum/enum';
import { ColumnOption } from './column-option.schema';


@Schema({ timestamps: true, versionKey: false })
export class Column {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  dataKey: string;

  @Prop({ type: String, enum: ColumnType, required: true, default: ColumnType.Text })
  type: ColumnType;

  // yalnız select üçün
  @Prop({ type: [ColumnOption] })
  options?: ColumnOption[];
}

export const ColumnSchema = SchemaFactory.createForClass(Column);
