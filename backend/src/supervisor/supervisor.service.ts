import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { CreateExcelDto } from "../excel/dto/create-excel.dto";
import { CreateSheetDto } from "../excel/dto/create-sheet.dto";
import { SheetCellDto } from "../excel/dto/sheet-cell.dto";
import { UpdateExcelDto } from "../excel/dto/update-excel.dto";
import { UpdateSheetColumnDto, UpdateSheetDto } from "../excel/dto/update-sheet.dto";
import { Column } from "../excel/model/column.schema";
import { Excel } from "../excel/model/excel.schema";
import { SheetRow } from "../excel/model/row-schema";
import { Sheet, SheetColumn } from "../excel/model/sheet.schema";
import { Project } from "../project/model/project.schema";
import { User } from "../user/model/user.schema";
import * as XLSX from 'xlsx';


const supId = "695bdaeff2405115af596e24"

@Injectable()
export class SupervisorService {
  constructor(
    @InjectModel(Excel.name) private excelModel: Model<Excel>,
    @InjectModel(Project.name) private projectModel: Model<Project>,
    @InjectModel(Sheet.name) private sheetModel: Model<Sheet>,
    @InjectModel(Column.name) private columnModel: Model<Column>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(SheetRow.name) private sheetRowModel: Model<SheetRow>,

  ) { }


  ///  ---------------------------  Project function --------------------------------//

  // Supervisor uyğun layihələri gətir
  async getSupervisorProjects(supervisorId: string) {
    return await this.projectModel.find({ supervisors: { $in: [supervisorId] } })
      .populate([
        { path: 'agents', select: '-password' },
        { path: "columnIds" },
        { path: 'excelIds' },
        { path: 'sheetIds' },
      ])
  }


  // Proyektə aid agentləri gətir
  async getProjectAgents(projectId: string) {
    const project = await this.projectModel.findById(projectId).populate('agents', '-password')
    if (!project) {
      throw new Error('Layihə tapılmadı');
    }
    return project.agents;
  }


  // --------------------------------------------------- Excel functions ------------------//

  // Excel yaratmaq üçün
  async createExcel(createExcelData: CreateExcelDto) {
    const project = await this.projectModel.findById(createExcelData.projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    // Proyektin ID - sini excelmodelde projectId -yə yazdır
    const createdExcel = new this.excelModel({ ...createExcelData, projectId: project._id });

    // proyektin excelIds massivinə yeni yaradılan excelin ID - sini əlavə et
    project.excelIds.push(createdExcel._id);
    await project.save();
    return createdExcel.save();
  }


  // Proyektə aid bütün Excelleri gətir
  async getExcels(projectId: string) {
    const data = await this.excelModel.find({ projectId }).populate([{ path: 'sheetIds' }, { path: 'agentIds', select: '-password' }]);
    return data;
  }


  // Excel yeniləmək üçün
  async updateExcel(_id: Types.ObjectId, updateExcelData: UpdateExcelDto) {

    /* 1. Excel yoxlanışı */
    const excel = await this.excelModel.findById(_id);
    if (!excel) {
      throw new NotFoundException('Excel tapılmadı');
    }

    /* 2. Agent silinməsi varsa yoxla */
    if (updateExcelData.agentIds) {

      // Mövcud agent-lər
      const currentAgentIds = excel.agentIds

      // Çıxarılmaq istənən agent-lər
      const removedAgentIds = currentAgentIds.filter(
        id => !updateExcelData.agentIds.map(aid => aid._id).includes(id._id),
      );

      if (removedAgentIds.length > 0) {
        /* 3. Sheet-lərdə istifadə olunan agent-ləri yoxla */
        const sheetsUsingAgents = await this.sheetModel.find({
          excelId: excel._id,
          "agentIds.agentId": { $in: removedAgentIds },
        });

        if (sheetsUsingAgents.length > 0) {
          throw new BadRequestException(
            'Bu agent Excel-in sheet-lərində istifadə olunur, silinə bilməz',
          );
        }
      }

      /* 4. İcazə varsa agentIds-i yenilə */
      excel.agentIds = updateExcelData.agentIds;
    }

    /* 5. Digər sahələrin update edilməsi */
    excel.set({
      ...updateExcelData, agentIds: excel.agentIds,
    });

    await excel.save();
    return excel;
  }




  // ----------------------------------------------Sheet functions ------------------//


  // Excel-ə yeni Sheet əlavə etmək üçün
  async addSheetToExcel(createSheetData: CreateSheetDto) {

    /* 1. Project yoxlanışı */
    const project = await this.projectModel.findById(createSheetData.projectId);
    if (!project) {
      throw new NotFoundException('Project tapılmadı');
    }

    /* 2. Excel yoxlanışı */
    const excel = await this.excelModel.findById(createSheetData.excelId);
    if (!excel) {
      throw new NotFoundException('Excel tapılmadı');
    }
    /* 3. Yeni Sheet yaradılması */
    const newSheet = new this.sheetModel({
      projectId: project._id,
      excelId: excel._id,
      name: createSheetData.name,
      description: createSheetData.description,
      agentIds: createSheetData.agentIds ?? [],
      columnIds: createSheetData.columnIds ?? []
    });

    /* 4. Sheet ID-lərin əlaqələndirilməsi */
    // project.sheetIds.push(newSheet._id);
    excel.sheetIds.push(newSheet._id);

    await Promise.all([
      project.save(),
      excel.save(),
      newSheet.save(),
    ]);

    return newSheet;
  }



  // Excel-də mövcud olan Sheeti yeniləmək üçün
  async updateSheetInExcel(_id: string, updateSheetData: UpdateSheetDto) {
    {
      /* 1. Sheet yoxlanışı */
      const sheet = await this.sheetModel.findById(_id);
      if (!sheet) {
        throw new NotFoundException('Sheet tapılmadı');
      }


      sheet.set({
        name: updateSheetData.name ?? sheet.name,
        description: updateSheetData.description ?? sheet.description,
        agentIds: updateSheetData.agentIds ?? sheet.agentIds,
        columnIds: updateSheetData.columnIds ?? sheet.columnIds
      });

      await sheet.save();
      return sheet;
    }
  }


  //Excel -ə aid sheetləri gətir
  async getSheetsOfExcel(excelId: Types.ObjectId) {
    const sheets = await this.sheetModel.find({ excelId: excelId })
    // .populate([{ path: 'agentIds', select: '-password' }, { path: 'columnIds' }]);
    return sheets;
  }



  //  -------------------------------------- Column functions --------------------------------------//


  // Sheet-ə column əlavə et
  async addColumnToSheet(sheetId: string, createColumnData: SheetColumn) {
    const sheet = await this.sheetModel.findById(sheetId);
    if (!sheet) {
      throw new NotFoundException('Sheet tapılmadı');
    }

    const column = await this.columnModel.findById(createColumnData.columnId);
    if (!column) {
      throw new NotFoundException('Column tapılmadı');
    }

    // Sheet-də eyni column varsa, blokla
    const exists = sheet.columnIds.some(
      (c) => c.columnId.toString() === column._id.toString(),
    );

    if (exists) {
      throw new BadRequestException('Bu column artıq sheet-ə əlavə olunub');
    }

    sheet.columnIds.push({
      columnId: column._id,
      editable: createColumnData.editable ?? true,
      required: createColumnData.required ?? false,
      agentId: createColumnData.agentId ?? null,
      order: sheet.columnIds.length + 1,
    });

    await sheet.save();
    return sheet;
  }


  // Sheet-ə aid column-ları yenilə
  async updateColumnInSheet(
    sheetId: string,
    columnId: string,
    updateColumnData: UpdateSheetColumnDto,
  ) {
    const sheet = await this.sheetModel.findById(sheetId);
    if (!sheet) {
      throw new NotFoundException('Sheet tapılmadı');
    }

    const columnConfig = sheet.columnIds.find(
      (c) => c.columnId.toString() === columnId,
    );

    if (!columnConfig) {
      throw new NotFoundException('Column sheet-də tapılmadı');
    }

    columnConfig.editable = updateColumnData.editable ?? columnConfig.editable;
    columnConfig.required = updateColumnData.required ?? columnConfig.required;
    columnConfig.agentId = updateColumnData.agentId ?? columnConfig.agentId;
    columnConfig.order = updateColumnData.order ?? columnConfig.order;

    await sheet.save();
    return sheet;
  }



  // Sheet-ə aid column-ları gətir
  async getColumnsOfSheet(sheetId: string) {
    const sheet = await this.sheetModel
      .findById(sheetId)
      .populate({
        path: 'columnIds.columnId', // nested path
        model: 'Column', // optional, amma tövsiyə olunur
        select: 'name dataKey options type'
      });

    if (!sheet) {
      throw new NotFoundException('Sheet tapılmadı');
    }

    return sheet.columnIds;
  }
  // row-lara aid isler

  async addRow(sheetId: string, data: Record<string, any>) {
    const sheet = await this.sheetModel.findById(sheetId);
    if (!sheet) throw new NotFoundException('Sheet tapılmadı');

    const lastRow = await this.sheetRowModel
      .findOne({ sheetId })
      .sort({ rowNumber: -1 });

    const rowNumber = lastRow ? lastRow.rowNumber + 1 : 1;

    return await this.sheetRowModel.create({
      sheetId,
      rowNumber,
      data,
    });
  }

  async importFromExcel(sheetId: string, file: Express.Multer.File) {
    const sheet = await this.sheetModel.findById(sheetId);
    if (!sheet) throw new NotFoundException('Sheet tapılmadı');

    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];

    const rows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, {
      defval: null,
    });

    if (!rows.length) {
      throw new BadRequestException('Excel boşdur');
    }

    const lastRow = await this.sheetRowModel
      .findOne({ sheetId })
      .sort({ rowNumber: -1 });

    let rowNumber = lastRow ? lastRow.rowNumber + 1 : 1;

    const docs = rows.map((row) => ({
      sheetId,
      rowNumber: rowNumber++,
      data: row,
    }));

    await this.sheetRowModel.insertMany(docs, { ordered: false });

    return {
      inserted: docs.length,
    };
  }

  // ---------------- GET ROWS ----------------
  async getRows(sheetId: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    const [rows, total] = await Promise.all([
      this.sheetRowModel
        .find({ sheetId })
        .sort({ rowNumber: 1 })
        .skip(skip)
        .limit(limit),
      this.sheetRowModel.countDocuments({ sheetId }),
    ]);

    return { data: rows, total, page, limit };
  }

  // ---------------- UPDATE ROW ----------------
  async updateRow(sheetId: string, rowNumber: number, data: Record<string, any>) {
    const row = await this.sheetRowModel.findOneAndUpdate(
      { sheetId, rowNumber },
      { $set: { data } },
      { new: true },
    );

    if (!row) throw new NotFoundException('Row tapılmadı');
    return row;
  }


  // ---------------- UPDATE CELL ----------------
  async updateCell(
    sheetId: string,
    rowNumber: number,
    sheetCellData: SheetCellDto
  ) {
    const row = await this.sheetRowModel.findOneAndUpdate(
      { sheetId, rowNumber }, // mövcud row axtarır
      { $set: { [`data.${sheetCellData.key}`]: sheetCellData.value } },
      { new: true } 
    );

    if (!row) {
      throw new NotFoundException('Row tapılmadı'); // mövcud deyilsə xətanı qaytar
    }

    return row;
  }




  // ---------------- DELETE ROW ----------------
  async deleteRow(sheetId: string, rowNumber: number) {
    const deleted = await this.sheetRowModel.findOneAndDelete({
      sheetId,
      rowNumber,
    });

    if (!deleted) throw new NotFoundException('Row tapılmadı');

    await this.sheetRowModel.updateMany(
      { sheetId, rowNumber: { $gt: rowNumber } },
      { $inc: { rowNumber: -1 } },
    );

    return { success: true };
  }
}
