import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TriggerDocument = Trigger & Document;

@Schema({ versionKey: false, timestamps: true })
export class Trigger {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  companyId: string;

  @Prop({ type: [String], default: [] })
  keywords: string[];

  @Prop({ required: false })
  autoReply?: string;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;
}

export const TriggerSchema = SchemaFactory.createForClass(Trigger);
