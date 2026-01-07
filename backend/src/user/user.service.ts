import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Column } from 'src/excel/model/column.schema';
import { Excel } from 'src/excel/model/excel.schema';
import { Sheet, SheetColumn } from 'src/excel/model/sheet.schema';
import { User } from './model/user.schema';
import { SheetRow } from 'src/excel/model/row-schema';

const supId = "695e0b4690d5dca3abdd31ae"
@Injectable()
export class UserService {
    constructor(
        @InjectModel(Excel.name) private readonly excelModel: Model<Excel>,
        @InjectModel(Sheet.name) private readonly sheetModel: Model<Sheet>,
        @InjectModel(Column.name) private readonly columnModel: Model<Column>,
        @InjectModel(User.name) private readonly userModel: Model<User>,
        @InjectModel(SheetRow.name) private readonly rowModel: Model<SheetRow>,
        @InjectModel(SheetColumn.name) private readonly sheetColumnModel: Model<SheetColumn>,
    ) { }


    // -------------------------------------  Excel functions ----------------------------------- //

    // İstifadəçiyə aid Excelleri gətirən function
    async getUserExcels(): Promise<Excel[]> {
        // İstifadəçinin aid olduğu proyektlərin ID-lərini tap
        const projects = await this.userModel.findById(supId).select('projectIds').exec();

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
        const projects = await this.userModel.findById(supId).select('projectIds').exec();

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
        const projects = await this.userModel.findById(supId).select('projectIds').exec();

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


    async getColumnsBySheetId(sheetId: string): Promise<any> {
        const userId = "695e0b4690d5dca3abdd31ae";
        const sheet = await this.sheetModel.findById(sheetId).populate({ path: "columnIds.columnId", model: "Column" }).exec();
        console.log(sheet?.columnIds)
        if (!sheet) throw new Error("Sheet not found");

        const agent = sheet.agentIds.find(ag => ag.agentId.toString() === userId);
        if (!agent) throw new Error("Agent not assigned to this sheet");

        const rows = await this.rowModel.find({
            sheetId: sheetId,
            rowNumber: {
                $gte: Number(agent.startRow),
                $lte: Number(agent.endRow)
            }
        });

        return {
            columns: sheet.columnIds,
            rows
        };
    }


    // User-in təyin olunduğu sheet-e uyğun column-ları gətirən function - startRow və endRow ilə filterlənmiş
    async getUserColumnsBySheetWithRowFilter(sheetId: string, startRow: number, endRow: number): Promise<Column[]> {
        const user = await this.userModel.findById(supId).exec();
        if (!user) {
            throw new NotFoundException('İstifadəçi tapılmadı');
        }
        // İstifadəçinin təyin olunduğu column-ları sheet modelində olan agentIds den tap
        const sheet = await this.sheetModel.find({
            _id: sheetId,
            "agentRowPermissions.agentId": user._id
        }).exec();

        // Tapılan column-ları startRow və endRow ilə filterləyərək qaytar
        const filteredColumns = await this.columnModel.find({
            sheetId: sheetId,

        }).exec();

        return filteredColumns;

    }
}

