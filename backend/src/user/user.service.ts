import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Column } from 'src/excel/model/column.schema';
import { Excel } from 'src/excel/model/excel.schema';
import { Sheet } from 'src/excel/model/sheet.schema';
import { User } from './model/user.schema';

@Injectable()
export class UserService {
    constructor(
        @InjectModel(Excel.name) private readonly excelModel: Model<Excel>,
        @InjectModel(Sheet.name) private readonly sheetModel: Model<Sheet>,
        @InjectModel(Column.name) private readonly columnModel: Model<Column>,
        @InjectModel(User.name) private readonly userModel: Model<User>,
    ) { }


    // -------------------------------------  Excel functions ----------------------------------- //

    // İstifadəçiyə aid Excelleri gətirən function
    async getUserExcels(): Promise<Excel[]> {
        // İstifadəçinin aid olduğu proyektlərin ID-lərini tap
        const projects = await this.userModel.findById("6951181444b1c022c540a5a0").select('projectIds').exec();

        // Proyektlərin ID-lərinə əsaslanaraq Excelleri tap
        if (projects && projects.projectIds.length > 0) {
            const excels = await this.excelModel.find({ projectId: { $in: projects.projectIds } }).exec();
            return excels;
        } else {
            return [];
        }
    }


    // -------------------------------------  Sheet functions ----------------------------------- //

    // İstifadəçiyə aid Excellerin Sheet-lərini gətirən function
    async getUserSheets(): Promise<Sheet[]> {
        // İstifadəçinin aid olduğu proyektlərin ID-lərini tap
        const projects = await this.userModel.findById("6951181444b1c022c540a5a0").select('projectIds').exec();

        // Proyektlərin ID-lərinə əsaslanaraq Excelleri tap
        if (projects && projects.projectIds.length > 0) {
            const excels = await this.excelModel.find({ projectId: { $in: projects.projectIds } }).exec();
            const excelIds = excels.map(excel => excel._id);

            // Excellerin ID-lərinə əsaslanaraq Sheet-ləri tap
            const sheets = await this.sheetModel.find({ excelId: { $in: excelIds } }).exec();
            return sheets;
        } else {
            return [];
        }
    }


    // Excel ID-sinə əsaslanaraq Sheet-ləri gətirən function
    async getSheetsByExcelId(excelId: string): Promise<Sheet[]> {
        const sheets = await this.sheetModel.find({ excelId: excelId }).exec();
        return sheets;
    }


    // -------------------------------------  Column functions  ----------------------------------- //

    // İstifadəçiyə aid Sheet-lərin Column-larını gətirən function
    async getUserColumns(): Promise<Column[]> {
        // İstifadəçinin aid olduğu proyektlərin ID-lərini tap
        const projects = await this.userModel.findById("6951181444b1c022c540a5a0").select('projectIds').exec();

        // Proyektlərin ID-lərinə əsaslanaraq Excelleri tap
        if (projects && projects.projectIds.length > 0) {
            const excels = await this.excelModel.find({ projectId: { $in: projects.projectIds } }).exec();
            const excelIds = excels.map(excel => excel._id);

            // Excellerin ID-lərinə əsaslanaraq Sheet-ləri tap
            const sheets = await this.sheetModel.find({ excelId: { $in: excelIds } }).exec();
            const sheetIds = sheets.map(sheet => sheet._id);

            // Sheet-lərin ID-lərinə əsaslanaraq Column-ları tap
            const columns = await this.columnModel.find({ sheetId: { $in: sheetIds } }).exec();
            return columns;
        } else {
            return [];
        }
    }


    async getColumnsBySheetId(sheetId: string): Promise<Column[]> {
        const columns = await this.columnModel.find({ sheetId: sheetId }).exec();
        return columns;
    }

}