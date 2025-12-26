import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LeadDocument = Lead & Document;

@Schema({ versionKey: false, timestamps: true })
export class Lead {
  @Prop({ required: true })
  phone: string;

  @Prop({ required: false })
  maskedPhone?: string;

  @Prop({ required: false })
  callStatus?: string;

  @Prop({ required: false })
  callDate?: string;

  @Prop({ required: false })
  customerStatus?: string;

  @Prop({ required: false })
  reason?: string;

  @Prop({ required: false })
  monthlyPayment?: number;

  @Prop({ required: false })
  tariff?: string;

  @Prop({ required: false })
  bonus?: string;

  @Prop({ required: false })
  cost?: number;

  @Prop({ required: false })
  assignedUser?: string;

  @Prop({ required: false })
  sheetId?: string;
}

export const LeadSchema = SchemaFactory.createForClass(Lead);