
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';


@Schema({ timestamps: true, versionKey: false })
export class Excel {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: false })
  projectId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ type: [Types.ObjectId], ref: 'User' })
  agentIds: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'Sheet', default: [] })
  sheetIds: Types.ObjectId[];

}

export const ExcelSchema = SchemaFactory.createForClass(Excel);
