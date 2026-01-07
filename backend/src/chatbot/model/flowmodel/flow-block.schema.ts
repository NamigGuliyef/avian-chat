import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { FlowButton } from './flow-button.schema';
import mongoose, { Types } from 'mongoose';
import { ActionType, BlockType } from '../../../enum/enum';


@Schema()
export class FlowBlock {
    @Prop({ type: String, enum: BlockType, required: true, default: BlockType.MESSAGE })
    type: BlockType;

    // MESSAGE
    @Prop()
    content?: string;

    @Prop({ type: [FlowButton], default: [] })
    buttons?: FlowButton[];

    // GOTO
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Flow' })
    targetFlowId?: Types.ObjectId;

    // ACTION
    @Prop({ type: String, enum: ActionType, default: ActionType.OPEN })
    actionType?: ActionType;
}

export const FlowBlockSchema = SchemaFactory.createForClass(FlowBlock);
