import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Column } from 'src/excel/model/column.schema';
import { Excel } from 'src/excel/model/excel.schema';
import { Sheet } from 'src/excel/model/sheet.schema';

@Injectable()
export class UserService {
    constructor(
        @InjectModel(Excel.name) private readonly excelModel: Model<Excel>,
        @InjectModel(Sheet.name) private readonly sheetModel: Model<Sheet>,
        @InjectModel(Column.name) private readonly columnModel: Model<Column>,
    ) { }


    



}
