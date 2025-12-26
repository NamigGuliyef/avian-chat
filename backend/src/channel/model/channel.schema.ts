import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ChannelDocument = Channel & Document;

@Schema({ versionKey: false, timestamps: true })
export class Channel {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  companyId: string; // ObjectId of company

  @Prop({ type: Boolean, default: true })
  isActive: boolean;
}

export const ChannelSchema = SchemaFactory.createForClass(Channel);
