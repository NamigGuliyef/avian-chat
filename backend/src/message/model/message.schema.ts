import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MessageDocument = Message & Document;

@Schema({ versionKey: false })
export class Message {
  @Prop({ required: true })
  conversationId: string; // ObjectId

  @Prop({ required: true, enum: ['visitor', 'agent', 'bot'] })
  sender: 'visitor' | 'agent' | 'bot';

  @Prop({ required: false })
  senderId?: string;

  @Prop({ required: false })
  senderName?: string;

  @Prop({ required: true })
  content: string;

  @Prop({ type: Date, default: Date.now })
  timestamp: Date;

  @Prop({ type: Boolean, default: false })
  isRead: boolean;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
