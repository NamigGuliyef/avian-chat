import {
    IsEnum,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BlockType, ActionType } from 'src/enum/enum';
import { ButtonDto } from './flow-button.dto';


export class BlockDto {
    @IsEnum(BlockType)
    type: BlockType;

    // MESSAGE
    @IsOptional()
    @IsString()
    content?: string;

    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => ButtonDto)
    buttons?: ButtonDto[];

    // GOTO
    @IsOptional()
    @IsString()
    targetFlowId?: string;

    // ACTION
    @IsOptional()
    @IsEnum(ActionType)
    actionType?: ActionType;
}
