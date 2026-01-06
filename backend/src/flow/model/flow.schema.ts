import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { FlowBlock } from './flow-block.schema';

@Schema({ timestamps: true, versionKey: false })
export class Flow {
  @Prop({ required: true })
  name: string;

  @Prop({ default: false })
  isDefault: boolean;

  @Prop({ type: [FlowBlock], default: [] })
  blocks: FlowBlock[];
}

export const FlowSchema = SchemaFactory.createForClass(Flow);