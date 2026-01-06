import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Mongoose, Types } from 'mongoose';

@Schema({ versionKey: false, timestamps: true })
export class Chatbot  {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true , type: mongoose.Schema.Types.ObjectId, ref: 'Company' })
  companyId: Types.ObjectId; // ObjectId of company

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;

  @Prop({ type: [mongoose.Schema.Types.ObjectId], default: [], ref: 'Flow' })
  flowIds: Types.ObjectId[];

  @Prop({ type: [mongoose.Schema.Types.ObjectId], default: [], ref: 'Trigger' })
  triggerIds: Types.ObjectId[];
}

export const ChatbotSchema = SchemaFactory.createForClass(Chatbot);
