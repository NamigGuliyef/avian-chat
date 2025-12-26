import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CompanyDocument = Company & Document;

@Schema({ versionKey: false, timestamps: true })
export class Company {
  @Prop({ required: true })
  name: string;

  @Prop({ required: false })
  domain?: string;

  @Prop({ required: false })
  email?: string;

  @Prop({ required: false })
  website?: string;

  @Prop({ type: [String], default: [] })
  channels: string[]; // store channel ids
}

export const CompanySchema = SchemaFactory.createForClass(Company);
