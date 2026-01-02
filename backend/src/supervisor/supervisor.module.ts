import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SupervisorController } from './supervisor.controller';
import { SupervisorService } from './supervisor.service';
import { Excel, ExcelSchema } from 'src/excel/model/excel.schema';
import { Sheet, SheetSchema } from 'src/excel/model/sheet.sheet';
import { Column, ColumnSchema } from 'src/excel/model/column.schema';
import { Project, ProjectSchema } from 'src/project/model/project.schema';
import { User, UserSchema } from 'src/user/model/user.schema';

@Module({
  imports: [MongooseModule.forFeature([
    { name: Excel.name, schema: ExcelSchema },
    { name: Sheet.name, schema: SheetSchema },
    { name: Column.name, schema: ColumnSchema },
    { name: Project.name, schema: ProjectSchema },
    { name: User.name, schema: UserSchema },
  ])],
  controllers: [SupervisorController],
  providers: [SupervisorService],
})
export class SupervisorModule { }
