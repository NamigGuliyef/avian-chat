import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TicketDocument = Ticket & Document;

@Schema({ versionKey: false, timestamps: true })
export class Ticket {
  @Prop({ required: true })
  title: string;

  @Prop({ required: false })
  description?: string;

  @Prop({ required: true })
  type: 'task' | 'ticket';

  @Prop({ required: true })
  status: string;

  @Prop({ required: false })
  priority?: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ required: false })
  deadline?: string;

  @Prop({ required: false })
  assignedAgentId?: string;

  @Prop({ required: false })
  supervisorId?: string;

  @Prop({ type: [Object], default: [] })
  notes: any[];

  @Prop({ type: [String], default: [] })
  attachments: string[];
}

export const TicketSchema = SchemaFactory.createForClass(Ticket);
