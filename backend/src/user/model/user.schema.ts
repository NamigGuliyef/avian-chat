import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';
import { OnlineStatus, UserRole } from 'src/enum/enum';

export type UserDocument = User & Document;

@Schema({ versionKey: false, timestamps: true })
export class User {

  _id: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  surname: string;

  @Prop({ required: true })
  status: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;


  // @ApiProperty()
  // @Prop({ required:false, type: [String], default: [] })
  // assignedChannels: Channel[]; // company-ye bagli channel-lerin id-lerinin massivi


  @Prop({
    type: String, required: true, enum: UserRole, default: UserRole.agent,
  })
  role: UserRole;


  @Prop({ type: String, enum: OnlineStatus, default: OnlineStatus.offline })
  onlineStatus: OnlineStatus;


  @Prop({ type: Boolean, default: false })
  chatbotEnabled?: boolean;


  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Channel', default: [] })
  channelIds: Types.ObjectId[]; // user-e aid channel-lerin id-lerinin massivi


  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Project', required: false })
  projectIds: Types.ObjectId[];

  @Prop({ type: Boolean, default: true })
  isActive: boolean;


  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;

  @Prop({ type: Number, default: 0 })
  startRow: number;

  @Prop({ type: Number, default: 0 })
  endRow: number;

}

export const UserSchema = SchemaFactory.createForClass(User);

