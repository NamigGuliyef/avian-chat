import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Company, CompanySchema } from '../company/model/company.schema';
import { Project, ProjectSchema } from '../project/model/project.schema';
import { Channel } from 'diagnostics_channel';
import { ChannelSchema } from '../channel/model/channel.schema';
import { User, UserSchema } from '../user/model/user.schema';
import { Column, ColumnSchema } from '../excel/model/column.schema';
import { Sheet, SheetSchema } from '../excel/model/sheet.schema';
import { SheetRow, SheetRowSchema } from '../excel/model/row-schema';
import { Excel, ExcelSchema } from '../excel/model/excel.schema';
import { JwtService } from '@nestjs/jwt';
import { AuditLog, AuditLogSchema } from '../logger/model/logger.schema';

@Module({
  imports: [MongooseModule.forFeature([
    { name: Company.name, schema: CompanySchema },
    { name: Project.name, schema: ProjectSchema },
    { name: Channel.name, schema: ChannelSchema },
    { name: User.name, schema: UserSchema },
    { name: Column.name, schema: ColumnSchema },
    { name: Sheet.name, schema: SheetSchema },
    { name: SheetRow.name, schema: SheetRowSchema },
    { name: Excel.name, schema: ExcelSchema },
    { name: User.name, schema: UserSchema },
    { name: AuditLog.name, schema: AuditLogSchema },

  ])],
  controllers: [AdminController],
  providers: [AdminService, JwtService],
})
export class AdminModule { }
