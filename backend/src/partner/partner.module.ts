import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Column, ColumnSchema } from '../excel/model/column.schema';
import { Excel, ExcelSchema } from '../excel/model/excel.schema';
import { Sheet, SheetSchema } from '../excel/model/sheet.schema';
import { Project, ProjectSchema } from '../project/model/project.schema';
import { User, UserSchema } from '../user/model/user.schema';
import { PartnerController } from './partner.controller';
import { PartnerService } from './partner.service';
import { SheetRow, SheetRowSchema } from '../excel/model/row-schema';
import { JwtService } from '@nestjs/jwt';
import { Company, CompanySchema } from '../company/model/company.schema';

@Module({
    imports: [MongooseModule.forFeature([
        { name: Excel.name, schema: ExcelSchema },
        { name: Sheet.name, schema: SheetSchema },
        { name: Column.name, schema: ColumnSchema },
        { name: Project.name, schema: ProjectSchema },
        { name: User.name, schema: UserSchema },
        { name: SheetRow.name, schema: SheetRowSchema },
        { name: Company.name, schema: CompanySchema },
    ])],
    controllers: [PartnerController],
    providers: [PartnerService, JwtService],
})
export class PartnerModule { }
