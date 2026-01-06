
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true, versionKey: false })
export class Trigger {
  @Prop({ required: true })
  name: string;

  @Prop({ type: [String], default: [] })
  keywords: string[];

  @Prop({ type: Types.ObjectId, ref: 'Flow', required: true })
  targetFlowId: Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;
}

export const TriggerSchema = SchemaFactory.createForClass(Trigger);
