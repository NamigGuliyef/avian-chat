
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';


@Schema({ timestamps: true, versionKey: false })
export class Excel {
  @Prop({ type: Types.ObjectId, ref: 'Project', required: true })
  projectId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ type: [Types.ObjectId], ref: 'User' })
  agentIds: Types.ObjectId[];
}

export const ExcelSchema = SchemaFactory.createForClass(Excel);
