import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SheetDocument = Sheet & Document;

@Schema({ versionKey: false, timestamps: true })
export class Sheet {
  @Prop({ required: true })
  excelId: string;

  @Prop({ required: true })
  projectId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ type: [Object], default: [] })
  columns: any[];

  @Prop({ type: [String], default: [] })
  agentIds: string[];
}

export const SheetSchema = SchemaFactory.createForClass(Sheet);
