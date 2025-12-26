import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProjectDocument = Project & Document;

@Schema({ versionKey: false, timestamps: true })
export class Project {
  @Prop({ required: true })
  name: string;

  @Prop({ required: false })
  description?: string;

  @Prop({ type: [String], default: [] })
  supervisorIds: string[];
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
