import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';

@Schema({ versionKey: false, timestamps: true })

export class Company {

  @Prop({ required: true })
  name: string;

  @Prop({ required: false })
  domain: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Channel' }], default: [] })
  channels: Types.ObjectId[];

  @Prop({ default: false })
  isDeleted: boolean;

}

export const CompanySchema = SchemaFactory.createForClass(Company);
