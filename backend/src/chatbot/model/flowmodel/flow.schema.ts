import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { FlowBlock } from './flow-block.schema';
import mongoose, { Types } from 'mongoose';

@Schema({ timestamps: true, versionKey: false })
export class Flow {
  @Prop({ required: true })
  name: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Chatbot', required: true })
  chatbotId: Types.ObjectId;

  @Prop({ default: false })
  isDefault: boolean;

  @Prop({ type: [FlowBlock], default: [] })
  blocks: FlowBlock[];
}

export const FlowSchema = SchemaFactory.createForClass(Flow);