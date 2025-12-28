import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ExcelDocument = Excel & Document;

@Schema({ versionKey: false, timestamps: true })
export class Excel {
  @Prop({ required: true })
  projectId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ type: [String], default: [] })
  agentIds: string[];
}

export const ExcelSchema = SchemaFactory.createForClass(Excel);
