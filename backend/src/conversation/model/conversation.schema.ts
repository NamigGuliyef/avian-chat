import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ConversationDocument = Conversation & Document;

@Schema({ versionKey: false, timestamps: true })
export class Conversation {
  @Prop({ required: true })
  visitorId: string;

  @Prop({ required: true })
  companyId: string;

  @Prop({ required: true })
  channelId: string;

  @Prop({ required: false })
  assignedAgentId?: string;

  @Prop({ required: false })
  triggerId?: string;

  @Prop({ required: true, enum: ['open', 'closed', 'snoozed'], default: 'open' })
  status: 'open' | 'closed' | 'snoozed';

  @Prop({ required: true, enum: ['webchat', 'whatsapp', 'sms', 'live-chat', 'instagram', 'facebook'], default: 'webchat' })
  channel: string;

  @Prop({ type: [String], default: [] })
  messages: string[]; // message ids

  @Prop({ type: [String], default: [] })
  tags: string[];
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
