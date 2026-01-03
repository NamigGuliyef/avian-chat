
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { ColumnType } from 'src/enum/enum';
import { ColumnOption } from './column-option.schema';


@Schema({ timestamps: true })
export class Column {
  @Prop({ type: Types.ObjectId, ref: 'Sheet', required: true })
  sheetId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  dataKey: string;

  @Prop({ type: String,  enum: ColumnType, required: true, default: ColumnType.Text })
  type: ColumnType;

  @Prop({ default: true })
  visibleToUser: boolean;

  @Prop({ default: true })
  editableByUser: boolean;

  @Prop({ default: false })
  isRequired: boolean;

  @Prop({ required: true })
  order: number;

  // yalnız select üçün
  @Prop({ type: [ColumnOption] })
  options?: ColumnOption[];

  // yalnız phone üçün
  @Prop({ type: [String] })
  phoneNumbers?: string[];
}

export const ColumnSchema = SchemaFactory.createForClass(Column);
