import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OperationLogDocument = OperationLog & Document;

@Schema({ versionKey: false, timestamps: true })
export class OperationLog {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  userName: string;

  @Prop({ required: true })
  operation: string;

  @Prop({ required: false })
  field?: string;

  @Prop({ required: false })
  oldValue?: string;

  @Prop({ required: false })
  newValue?: string;
}

export const OperationLogSchema = SchemaFactory.createForClass(OperationLog);