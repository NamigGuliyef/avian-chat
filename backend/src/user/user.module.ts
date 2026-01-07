import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Column, ColumnSchema } from '../excel/model/column.schema';
import { Excel, ExcelSchema } from '../excel/model/excel.schema';
import { SheetRow, SheetRowSchema } from '../excel/model/row-schema';
import { Sheet, SheetColumn, SheetColumnSchema, SheetSchema } from '../excel/model/sheet.schema';
import { User, UserSchema } from './model/user.schema';
import { UserController } from './user.controller';
import { UserService } from './user.service';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Excel.name, schema: ExcelSchema },
      { name: Sheet.name, schema: SheetSchema },
      { name: Column.name, schema: ColumnSchema },
      { name: SheetRow.name, schema: SheetRowSchema },
      { name: SheetColumn.name, schema: SheetColumnSchema },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule { }
