import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';



@Schema({ timestamps: true, versionKey: false })
export class SheetRow {
    @Prop({ type: Types.ObjectId, ref: 'Sheet', required: true, index: true })
    sheetId: Types.ObjectId;

    @Prop({ required: true })
    rowNumber: number;

    @Prop({ type: Object, default: {} })
    data: Record<string, any>;
}

export const SheetRowSchema = SchemaFactory.createForClass(SheetRow);
SheetRowSchema.index({ sheetId: 1, rowNumber: 1 }, { unique: true });
