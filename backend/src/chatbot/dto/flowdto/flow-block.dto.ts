import {
    IsEnum,
    IsNotEmpty,
    isNotEmpty,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BlockType, ActionType } from '../../../enum/enum';
import { FlowButtonDto } from './flow-button.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';


export class FlowBlockDto {
    @ApiProperty()
    @IsEnum(BlockType)
    @IsNotEmpty()
    type: string;

    // MESSAGE
    @ApiProperty()
    @IsOptional()
    @IsString()
    content?: string;

    @ApiProperty({ type: [FlowButtonDto] })
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => FlowButtonDto)
    buttons?: FlowButtonDto[];

    // GOTO
    @ApiProperty()
    @IsNotEmpty()
    targetFlowId?: string;

    // ACTION
    @ApiProperty()
    @IsOptional()
    @IsEnum(ActionType)
    actionType?: string;
}
