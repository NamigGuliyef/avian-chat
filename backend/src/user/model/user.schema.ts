import { UserRole } from '@app/common/enum/user-role.enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;


@Schema({ versionKey: false, timestamps: true })
export class User {
    @Prop({ required: true })
    fullName: string;
    @Prop({ required: true })
    email: string;
    @Prop({ required: true })
    password: string
    @Prop({ type: String, required: true, enum: UserRole, default: UserRole.Agent })
    role: UserRole;
    @Prop({ required: true })
    companyID: string; // ObjetctId 
}

export const UserSchema = SchemaFactory.createForClass(User);