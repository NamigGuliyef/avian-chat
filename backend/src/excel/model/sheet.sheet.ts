
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { AgentRowPermission } from './agent-row-permission.schema';
import { Column } from './column.schema';


@Schema({ timestamps: true })
export class Sheet {
  @Prop({ type: Types.ObjectId, ref: 'Project', required: true })
  projectId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Excel', required: true })
  excelId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ type: [Types.ObjectId], ref: 'User' })
  agentIds: Types.ObjectId[];

  @Prop({ type: [AgentRowPermission], default: [] })
  agentRowPermissions: AgentRowPermission[];

  // embedded columns for easier access (frontend expects sheet.columns)
  @Prop({ type: [Column], default: [] })
  columns: Column[];
}

export const SheetSchema = SchemaFactory.createForClass(Sheet);
