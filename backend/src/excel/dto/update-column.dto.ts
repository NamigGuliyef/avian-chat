import { IsBoolean, IsOptional, IsString, IsEnum, IsNumber, IsArray, ValidateNested } from "class-validator";
import { Type } from 'class-transformer';
import { ColumnOption } from "src/excel/model/column-option.schema";
import { ColumnType } from "src/enum/enum";

export class UpdateColumnDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  dataKey?: string;

  @IsOptional()
  @IsEnum(ColumnType)
  type?: ColumnType;

  @IsOptional()
  @IsBoolean()
  visibleToUser?: boolean;

  @IsOptional()
  @IsBoolean()
  editableByUser?: boolean;

  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @IsOptional()
  @IsNumber()
  order?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ColumnOption)
  options?: ColumnOption[];

  @IsOptional()
  @IsArray()
  phoneNumbers?: string[];
}