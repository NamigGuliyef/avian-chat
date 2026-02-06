import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { userRequest } from '../auth/req-auth.type';
import { Column } from '../excel/model/column.schema';
import { Excel } from '../excel/model/excel.schema';
import { SheetRow } from '../excel/model/row-schema';
import { Sheet } from '../excel/model/sheet.schema';
import { User } from './model/user.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(Excel.name) private readonly excelModel: Model<Excel>,
    @InjectModel(Sheet.name) private readonly sheetModel: Model<Sheet>,
    @InjectModel(Column.name) private readonly columnModel: Model<Column>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(SheetRow.name) private readonly rowModel: Model<SheetRow>,
    @Inject(REQUEST) private readonly request: userRequest,
  ) { }

  // -------------------------------------  Excel functions ----------------------------------- //

  // İstifadəçiyə aid Excelleri gətirən function
  async getUserExcels(): Promise<Excel[]> {
    // İstifadəçinin aid olduğu proyektlərin ID-lərini tap
    const projects = await this.userModel
      .findById(this.request.user._id)
      .select('projectIds')
      .exec();

    // Proyektlərin ID-lərinə əsaslanaraq Excelleri tap
    if (projects && projects.projectIds.length > 0) {
      const excels = await this.excelModel
        .find({ projectId: { $in: projects.projectIds } })
        .exec();
      return excels;
    } else {
      return [];
    }
  }

  // -------------------------------------  Sheet functions ----------------------------------- //

  // İstifadəçiyə aid Excellerin Sheet-lərini gətirən function
  async getUserSheets(): Promise<Sheet[]> {
    // İstifadəçinin aid olduğu proyektlərin ID-lərini tap
    const projects = await this.userModel
      .findById(this.request.user._id)
      .select('projectIds')
      .exec();

    // Proyektlərin ID-lərinə əsaslanaraq Excelleri tap
    if (projects && projects.projectIds.length > 0) {
      const excels = await this.excelModel
        .find({ projectId: { $in: projects.projectIds } })
        .exec();
      const excelIds = excels.map((excel) => excel._id);

      // Excellerin ID-lərinə əsaslanaraq Sheet-ləri tap
      const sheets = await this.sheetModel
        .find({ excelId: { $in: excelIds } })
        .exec();
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
    const projects = await this.userModel
      .findById(this.request.user._id)
      .select('projectIds')
      .exec();

    // Proyektlərin ID-lərinə əsaslanaraq Excelleri tap
    if (projects && projects.projectIds.length > 0) {
      const excels = await this.excelModel
        .find({ projectId: { $in: projects.projectIds } })
        .exec();
      const excelIds = excels.map((excel) => excel._id);

      // Excellerin ID-lərinə əsaslanaraq Sheet-ləri tap
      const sheets = await this.sheetModel
        .find({ excelId: { $in: excelIds } })
        .exec();
      const sheetIds = sheets.map((sheet) => sheet._id);

      // Sheet-lərin ID-lərinə əsaslanaraq Column-ları tap
      const columns = await this.columnModel
        .find({ sheetId: { $in: sheetIds } })
        .exec();
      return columns;
    } else {
      return [];
    }
  }


  async getColumnsBySheetId(sheetId: string, page = 1, limit = 50, search = ''): Promise<any> {
    const skip = (page - 1) * limit;
    const sheet = await this.sheetModel.findById(sheetId).populate({ path: 'columnIds.columnId', model: 'Column' }).exec();
    console.log(sheet?.columnIds);
    if (!sheet) throw new Error('Sheet not found');

    const agent = sheet.agentIds.find(
      (ag) => ag.agentId.toString() === this.request.user._id.toString(),
    );
    if (!agent) throw new Error('Agent not assigned to this sheet');

    // Build match conditions for multiple ranges
    const rangeConditions = (agent.ranges || []).map(range => ({
      rowNumber: {
        $gte: Number(range.startRow),
        $lte: Number(range.endRow),
      },
    }));

    // If no ranges, throw error
    if (rangeConditions.length === 0) {
      throw new Error('No row ranges assigned to this agent');
    }

    // Base match conditions with $or for multiple ranges
    const matchStage = {
      sheetId: sheetId,
      $or: rangeConditions,
    };

    let rows;

    // If search term exists, search within data object
    if (search && search.trim()) {
      // Get all rows first, then filter in memory
      const allRows = await this.rowModel.find(matchStage).sort({ rowNumber: 1 }).exec();

      // Filter rows where any value in data object matches search term
      const searchRegex = new RegExp(search, 'i');
      const filteredRows = allRows.filter((row) => {
        const dataValues = Object.values(row.data);
        return dataValues.some((value) => {
          return searchRegex.test(String(value));
        });
      });

      // Apply pagination
      rows = filteredRows.slice(skip, skip + limit);
    } else {
      // No search - simple find with pagination
      rows = await this.rowModel.find(matchStage).sort({ rowNumber: 1 }).skip(skip).limit(limit).exec();
    }

    return {
      columns: sheet.columnIds,
      rows,
    };
  }

  // User-in təyin olunduğu sheet-e uyğun column-ları gətirən function - startRow və endRow ilə filterlənmiş
  async getUserColumnsBySheetWithRowFilter(sheetId: string): Promise<Column[]> {
    const user = await this.userModel.findById(this.request.user._id).exec();
    if (!user) {
      throw new NotFoundException('İstifadəçi tapılmadı');
    }
    // İstifadəçinin təyin olunduğu column-ları sheet modelində olan agentIds den tap
    await this.sheetModel
      .find({
        _id: sheetId,
        'agentRowPermissions.agentId': user._id,
      })
      .exec();

    // Tapılan column-ları startRow və endRow ilə filterləyərək qaytar
    const filteredColumns = await this.columnModel
      .find({
        sheetId: sheetId,
      })
      .exec();
    return filteredColumns;
  }

  async getReminders(): Promise<any[]> {
    const projects = await this.userModel
      .findById(this.request.user._id)
      .select('projectIds')
      .exec();

    if (!projects || projects.projectIds.length === 0) return [];

    const excels = await this.excelModel
      .find({ projectId: { $in: projects.projectIds } })
      .exec();
    const excelIds = excels.map((excel) => excel._id);

    const sheets = await this.sheetModel
      .find({ excelId: { $in: excelIds } })
      .populate({ path: 'columnIds.columnId', model: 'Column' })
      .exec();

    const allReminders: any[] = [];

    for (const sheet of sheets) {
      const agent = sheet.agentIds.find(
        (ag) => ag.agentId.toString() === this.request.user._id.toString(),
      );
      if (!agent) continue;

      const rangeConditions = (agent.ranges || []).map((range) => ({
        rowNumber: {
          $gte: Number(range.startRow),
          $lte: Number(range.endRow),
        },
      }));

      if (rangeConditions.length === 0) continue;

      const rows = await this.rowModel
        .find({
          sheetId: sheet._id,
          remindMe: true,
          $or: rangeConditions,
        })
        .lean()
        .exec();

      if (rows.length > 0) {
        allReminders.push({
          sheetId: sheet._id,
          sheetName: sheet.name,
          columns: sheet.columnIds,
          rows: rows,
        });
      }
    }

    return allReminders;
  }
}
