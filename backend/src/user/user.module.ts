import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './model/user.schema';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { Excel, ExcelSchema } from 'src/excel/model/excel.schema';
import { Sheet, SheetSchema } from 'src/excel/model/sheet.schema';
import { Column, ColumnSchema } from 'src/excel/model/column.schema';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Excel.name, schema: ExcelSchema },
      { name: Sheet.name, schema: SheetSchema },
      { name: Column.name, schema: ColumnSchema }
    ]), 
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule { }
