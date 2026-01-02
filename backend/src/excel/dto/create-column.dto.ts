import { IsBoolean, IsOptional, IsString, IsEnum, IsNumber, IsArray, ValidateNested } from "class-validator";
import { Type } from 'class-transformer';
import { ColumnOption } from "src/excel/model/column-option.schema";
import { ColumnType } from "src/enum/enum";

export class CreateColumnDto {
  @IsString()
  name: string;

  @IsString()
  dataKey: string;

  @IsEnum(ColumnType)
  type: ColumnType;

  @IsBoolean()
  visibleToUser: boolean;

  @IsBoolean()
  editableByUser: boolean;

  @IsBoolean()
  isRequired: boolean;

  @IsOptional()
  @IsNumber()
  order?: number;

  @IsString()
  sheetId: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ColumnOption)
  options?: ColumnOption[];

  @IsOptional()
  @IsArray()
  phoneNumbers?: string[];
}
