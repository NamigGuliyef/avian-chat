import { ApiProperty } from "@nestjs/swagger"
import { IsOptional, IsString } from "class-validator"

export class SheetCellDto {
    @ApiProperty({ example: 'A1', description: 'Cell-in açarı' })
    @IsString()
    key: string
    @ApiProperty({ example: 'Some Value', description: 'Cell-in dəyəri', required: true })
    @IsOptional()
    value: any
}