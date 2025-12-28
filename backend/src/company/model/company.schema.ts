import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Channel } from 'src/channel/model/channel.schema';

@Schema({ versionKey: false, timestamps: true })

export class Company {

  @Prop({ required: true })
  name: string;

  @Prop({ required: false })
  domain: string;

  @Prop({ default: false, ref: 'Channel', type: [mongoose.Schema.Types.ObjectId] })
  channels: Channel[];

}

export const CompanySchema = SchemaFactory.createForClass(Company);
