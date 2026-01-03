import { IsBoolean, IsOptional, IsString, IsEnum, IsNumber, IsArray, ValidateNested } from "class-validator";
import { Type } from 'class-transformer';
import { ColumnType } from "src/enum/enum";
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';


export class ColumnOptionDto {
  @ApiPropertyOptional({ description: 'Dəyər' })
  value?: string;

  @ApiProperty({ description: 'Etiket' })
  label: string;
}


export class CreateColumnDto {
  @ApiProperty({ description: 'Sütunun görünən adı' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Məlumat xəritələşdirilməsi üçün istifadə olunan açar' })
  @IsString()
  dataKey: string;

  @ApiProperty({ enum: ColumnType, description: 'Sütun növü' })
  @IsEnum(ColumnType)
  type: ColumnType;

  @ApiProperty({ type: Boolean, description: 'Sütunun istifadəçilərə görünən olub-olmaması' })
  @IsBoolean()
  visibleToUser: boolean;

  @ApiProperty({ type: Boolean, description: 'Sütunun istifadəçilər tərəfindən redaktə edilə bilməsi' })
  @IsBoolean()
  editableByUser: boolean;

  @ApiProperty({ type: Boolean, description: 'Sütunun məcburi olub-olmaması' })
  @IsBoolean()
  isRequired: boolean;

  @ApiPropertyOptional({ type: Number, description: 'Sütunun sırası' })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiProperty({ description: 'Bu sütunun aid olduğu səhifənin ID-si' })
  @IsString()
  sheetId: string;

  @ApiPropertyOptional({ type: ColumnOptionDto, isArray: true, description: 'Seçim tipli sütunlar üçün variantlar' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ColumnOptionDto)
  options?: ColumnOptionDto[];

  @ApiPropertyOptional({ type: String, isArray: true, description: 'Telefon nömrələrinin siyahısı (əgər tətbiq olunursa)' })
  @IsOptional()
  @IsArray()
  phoneNumbers?: string[];
}
