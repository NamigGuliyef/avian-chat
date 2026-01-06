import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

@Schema({ timestamps: true, versionKey: false })
export class ChatSession {
  @Prop({ required: true })
  userId: string;

  @Prop({ type: Types.ObjectId, ref: 'Flow' })
  flowId: Types.ObjectId;

  @Prop({ required: true })
  currentBlockId: string;

  @Prop({ default: false })
  isFinished: boolean;
}

export const ChatSessionSchema =
  SchemaFactory.createForClass(ChatSession);
