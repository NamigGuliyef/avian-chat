import { PartialType } from '@nestjs/swagger';
import { CreateAdminColumnDto } from './create-column.dto';

export class UpdateAdminColumnDto extends PartialType(CreateAdminColumnDto) { }
