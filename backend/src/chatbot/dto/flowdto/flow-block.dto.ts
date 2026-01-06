import {
    IsEnum,
    IsNotEmpty,
    isNotEmpty,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BlockType, ActionType } from 'src/enum/enum';
import { FlowButtonDto } from './flow-button.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';


export class FlowBlockDto {
    @ApiProperty()
    @IsEnum(BlockType)
    type: BlockType;

    // MESSAGE
    @ApiProperty()
    @IsOptional()
    @IsString()
    content?: string;

    @ApiProperty()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => FlowButtonDto)
    buttons?: FlowButtonDto[];

    // GOTO
    @ApiProperty()
    @IsNotEmpty()
    targetFlowId?: Types.ObjectId;

    // ACTION
    @ApiProperty()
    @IsOptional()
    @IsEnum(ActionType)
    actionType?: ActionType;
}
