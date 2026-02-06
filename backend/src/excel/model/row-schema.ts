import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';



@Schema({ timestamps: true, versionKey: false })
export class SheetRow {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Sheet', required: true, index: true })
    sheetId: Types.ObjectId;

    @Prop({ required: true })
    rowNumber: number;

    @Prop({ type: Object, default: {} })
    data: Record<string, any>;

    @Prop({ type: Boolean, default: false })
    remindMe: boolean;
}

export const SheetRowSchema = SchemaFactory.createForClass(SheetRow);
SheetRowSchema.index({ sheetId: 1, rowNumber: 1 }, { unique: true });
SheetRowSchema.index({ sheetId: 1, 'data.phone': 1 }); // Specific index for phone filtering
SheetRowSchema.index({ 'data.$**': 1 }); // Wildcard index for all other dynamic fields
