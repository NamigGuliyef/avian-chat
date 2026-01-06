import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';

@Schema({ versionKey: false, timestamps: true })
export class FlowButton {
  @Prop({ required: true })
  label: string;

  @Prop()
  emoji?: string;

  // Go to Flow
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Flow' })
  goToFlowId?: Types.ObjectId;
}

export const FlowButtonSchema = SchemaFactory.createForClass(FlowButton);
