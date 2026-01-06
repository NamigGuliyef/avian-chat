import { Prop, Schema } from '@nestjs/mongoose';
import { FlowButton } from './flow-button.schema';
import { Types } from 'mongoose';
import { BlockType, ActionType } from 'src/enum/enum';

@Schema({ _id: true })
export class FlowBlock {
    @Prop({ enum: BlockType, required: true })
    type: BlockType;

    // MESSAGE
    @Prop()
    content?: string;

    @Prop({ type: [FlowButton], default: [] })
    buttons?: FlowButton[];

    // GOTO
    @Prop({ type: Types.ObjectId, ref: 'Flow' })
    targetFlowId?: Types.ObjectId;

    // ACTION
    @Prop({ enum: ActionType })
    actionType?: ActionType;
}
