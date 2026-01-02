// leads/schema/lead.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';


@Schema({ timestamps: true })
export class SheetRow {
  @Prop({ type: Types.ObjectId, ref: 'Sheet', required: true })
  sheetId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  agentId: Types.ObjectId;
  
  @Prop({ type: Object, required: true })
  data: Record<string, any>;
}

export const SheetRowSchema = SchemaFactory.createForClass(SheetRow);
