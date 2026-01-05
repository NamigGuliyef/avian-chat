import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';


@Schema({ timestamps: true, versionKey: false })
export class Sheet {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true })
  projectId: Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Excel', required: true })
  excelId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: [Types.ObjectId], ref: 'User' })
  agentIds: Types.ObjectId[];

  @Prop({ default: [] })
  columns: SheetColumn[];
}


@Schema({ versionKey: false, timestamps: true })
export class SheetColumn {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Column' })
  columnId: Types.ObjectId;

  @Prop({ default: true })
  editable: boolean;

  @Prop({ default: false })
  required: boolean;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null })
  agentId: Types.ObjectId;

  @Prop()
  order: number;
}


export interface ISheetRow {
  sheetId: Types.ObjectId;
  rowNumber: number;
  data: Record<string, any>;
}



export const SheetSchema = SchemaFactory.createForClass(Sheet);
