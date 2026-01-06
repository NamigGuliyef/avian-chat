import { Prop, Schema } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ _id: true })
export class FlowButton {
  @Prop({ required: true })
  label: string;

  @Prop()
  emoji?: string;

  // Go to Flow
  @Prop({ type: Types.ObjectId, ref: 'Flow' })
  goToFlowId?: Types.ObjectId;
}
