// sheets/schema/agent-row-permission.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ _id: false })
export class AgentRowPermission {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  agentId: Types.ObjectId;

  @Prop({ default: 1 })
  startRow: number;

  @Prop({ default: 100 })
  endRow: number;
}
