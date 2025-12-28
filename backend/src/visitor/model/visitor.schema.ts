import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type VisitorDocument = Visitor & Document;

@Schema({ versionKey: false, timestamps: true })
export class Visitor {
  @Prop({ required: true })
  visitorId: string;

  @Prop({ required: true })
  companyId: string;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;

  @Prop({ type: Date, default: Date.now })
  lastSeenAt: Date;
}

export const VisitorSchema = SchemaFactory.createForClass(Visitor);
