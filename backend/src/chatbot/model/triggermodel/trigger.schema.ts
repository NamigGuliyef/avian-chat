
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';

@Schema({ timestamps: true, versionKey: false })
export class Trigger {
  @Prop({ required: true })
  name: string;

  @Prop({ type: [String], default: [] })
  keywords: string[];

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'Chatbot' })
  chatbotId: Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Flow', required: true })
  targetFlowId: Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;
}

export const TriggerSchema = SchemaFactory.createForClass(Trigger);
