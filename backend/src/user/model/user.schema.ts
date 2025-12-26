import { UserRole } from '@app/common/enum/user-role.enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;


@Schema({ versionKey: false, timestamps: true })
export class User {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: false })
    password?: string;

    @Prop({ type: String, required: true, enum: UserRole, default: UserRole.agent })
    role: UserRole;

    @Prop({ required: true })
    companyId: string; // ObjectId ref to Company

    @Prop({ type: [String], default: [] })
    channelIds: string[];

    @Prop({ required: false })
    avatar?: string;

    @Prop({ type: Boolean, default: false })
    isOnline: boolean;

    @Prop({ type: Boolean, default: false })
    chatbotEnabled?: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);