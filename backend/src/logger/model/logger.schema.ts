import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({ timestamps: true })
export class AuditLog {

    @Prop({ required: true })
    userId: string;

    @Prop({ required: true })
    userName: string;

    @Prop({ required: true })
    userSurname: string;

    @Prop({ required: true })
    field: string;

    @Prop()
    oldValue?: string;

    @Prop()
    newValue?: string;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
