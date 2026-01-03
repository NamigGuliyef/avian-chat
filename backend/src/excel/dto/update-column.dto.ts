import { IsBoolean, IsOptional, IsString, IsEnum, IsNumber, IsArray, ValidateNested } from "class-validator";
import { Type } from 'class-transformer';
import { ColumnOption } from "src/excel/model/column-option.schema";
import { ColumnType } from "src/enum/enum";
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateColumnOptionDto {
  @ApiPropertyOptional({ description: 'Dəyər' })
  value?: string;

  @ApiProperty({ description: 'Etiket' })
  label: string;
}


export class UpdateColumnDto {
  @ApiPropertyOptional({ description: 'Sütunun görünən adı' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Məlumat xəritələşdirilməsi üçün istifadə olunan açar' })
  @IsOptional()
  @IsString()
  dataKey?: string;

  @ApiPropertyOptional({ enum: ColumnType, description: 'Sütun növü' })
  @IsOptional()
  @IsEnum(ColumnType)
  type?: ColumnType;

  @ApiPropertyOptional({ type: Boolean, description: 'Sütunun istifadəçilərə görünən olub-olmaması' })
  @IsOptional()
  @IsBoolean()
  visibleToUser?: boolean;

  @ApiPropertyOptional({ type: Boolean, description: 'Sütunun istifadəçilər tərəfindən redaktə edilə bilməsi' })
  @IsOptional()
  @IsBoolean()
  editableByUser?: boolean;

  @ApiPropertyOptional({ type: Boolean, description: 'Sütunun məcburi olub-olmaması' })
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @ApiPropertyOptional({ type: Number, description: 'Sütunun sırası' })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiPropertyOptional({ type: UpdateColumnOptionDto, isArray: true, description: 'Seçim tipli sütunlar üçün variantlar' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateColumnOptionDto)
  options?: UpdateColumnOptionDto[];

  @ApiPropertyOptional({ type: String, isArray: true, description: 'Telefon nömrələrinin siyahısı (əgər tətbiq olunursa)' })
  @IsOptional()
  @IsArray()
  phoneNumbers?: string[];
}