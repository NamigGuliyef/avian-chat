import { OnlineStatus, UserRole } from 'src/enum/enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import mongoose, { Document } from 'mongoose';
import { Channel } from 'src/channel/model/channel.schema';

export type UserDocument = User & Document;

@Schema({ versionKey: false, timestamps: true })
export class User {
  @ApiProperty()
  @Prop({ required: true })
  name: string;

  @ApiProperty()
  @Prop({ required: true })
  surname: string;

  @ApiProperty()
  @Prop({ required: true })
  status: string;

  @ApiProperty()
  @Prop({ required: true, unique: true })
  email: string;

  @ApiProperty()
  @Prop({ required: true })
  password: string;


  // @ApiProperty()
  // @Prop({ required:false, type: [String], default: [] })
  // assignedChannels: Channel[]; // company-ye bagli channel-lerin id-lerinin massivi


  @ApiProperty()
  @Prop({
    type: String, required: true, enum: UserRole, default: UserRole.agent,
  })
  role: UserRole;


  @ApiProperty()
  @Prop({ type: String, enum: OnlineStatus, default: OnlineStatus.offline })
  onlineStatus: OnlineStatus;


  @ApiProperty()
  @Prop({ type: Boolean, default: false })
  chatbotEnabled?: boolean;

}

export const UserSchema = SchemaFactory.createForClass(User);

