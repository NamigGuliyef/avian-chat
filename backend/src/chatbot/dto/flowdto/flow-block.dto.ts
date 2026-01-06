import {
    IsEnum,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BlockType, ActionType } from 'src/enum/enum';
import { ButtonDto } from './flow-button.dto';
import { ApiProperty } from '@nestjs/swagger';


export class BlockDto {
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
    @Type(() => ButtonDto)
    buttons?: ButtonDto[];

    // GOTO
    @ApiProperty()
    @IsOptional()
    @IsString()
    targetFlowId?: string;

    // ACTION
    @ApiProperty()
    @IsOptional()
    @IsEnum(ActionType)
    actionType?: ActionType;
}
