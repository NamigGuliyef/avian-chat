// sheets/schema/agent-row-permission.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';

@Schema({ _id: false })
export class RowRange {
  @Prop({ type: String })
  startRow: string;

  @Prop({ type: String })
  endRow: string;
}

@Schema({ _id: false })
export class AgentRowPermission {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  agentId: Types.ObjectId;

  @Prop({ type: String })
  name?: string;

  @Prop({ type: String })
  surname?: string;

  @Prop({ type: [RowRange], default: [] })
  ranges?: RowRange[];
}
