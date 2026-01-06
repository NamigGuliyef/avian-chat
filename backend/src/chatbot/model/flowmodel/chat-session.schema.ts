import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Types } from "mongoose";

@Schema({ timestamps: true, versionKey: false })
export class ChatSession {
  @Prop({ required: true })
  visitorId: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Flow' })
  flowId: Types.ObjectId;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'FlowBlock' })
  currentBlockId: Types.ObjectId;

  @Prop({ default: false })
  isFinished: boolean;
}

export const ChatSessionSchema =
  SchemaFactory.createForClass(ChatSession);
