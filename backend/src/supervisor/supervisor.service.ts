import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { InjectModel } from "@nestjs/mongoose";
import * as ExcelJS from 'exceljs';
import { Model, Types } from "mongoose";
import { userRequest } from "../auth/req-auth.type";
import { Company } from "../company/model/company.schema";
import { maskPhone } from "../helper/mask";
import { User } from "../user/model/user.schema";
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


@Injectable()
export class SupervisorService {
  constructor(
    @InjectModel(Excel.name) private excelModel: Model<Excel>,
    @InjectModel(Project.name) private projectModel: Model<Project>,
    @InjectModel(Sheet.name) private sheetModel: Model<Sheet>,
    @InjectModel(Column.name) private columnModel: Model<Column>,
    @InjectModel(SheetRow.name) private sheetRowModel: Model<SheetRow>,
    @InjectModel(Company.name) private companyModel: Model<Company>,
    @InjectModel(User.name) private userModel: Model<User>,
    @Inject(REQUEST) private readonly request: userRequest
  ) { }



  ///  ---------------------------  Project function --------------------------------//

  // Supervisor uyğun layihələri gətir
  async getSupervisorProjects() {
    return await this.projectModel.find({ supervisors: { $in: [this.request.user._id] } })
      .populate([
        { path: 'agents', select: '-password' },
        { path: "columnIds" },
        { path: 'excelIds', populate: { path: 'sheetIds' } }]);

  }


  // Proyektə aid agentləri gətir
  async getProjectAgents(projectId: Types.ObjectId) {
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
  async getExcels(projectId: Types.ObjectId) {
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
  async updateSheetInExcel(_id: Types.ObjectId, updateSheetData: UpdateSheetDto) {
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
  async addColumnToSheet(sheetId: Types.ObjectId, createColumnData: SheetColumn) {
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
      (c) => c.columnId === column._id,
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
    sheetId: Types.ObjectId,
    columnId: Types.ObjectId,
    updateColumnData: UpdateSheetColumnDto,
  ) {
    const sheet = await this.sheetModel.findById(sheetId);
    if (!sheet) {
      throw new NotFoundException('Sheet tapılmadı');
    }

    const columnConfig = sheet.columnIds.find(
      (c) => c.columnId === columnId,
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
  async getColumnsOfSheet(sheetId: Types.ObjectId) {
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

  async addRow(sheetId: Types.ObjectId, data: Record<string, any>) {
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

  // async importFromExcel(sheetId: Types.ObjectId, file: Express.Multer.File) {
  //   const sheet = await this.sheetModel.findById(sheetId);
  //   if (!sheet) throw new NotFoundException('Sheet tapılmadı');

  //   const workbook = XLSX.read(file.buffer, { type: 'buffer' });
  //   const worksheet = workbook.Sheets[workbook.SheetNames[0]];

  //   const rows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, {
  //     // defval: null,
  //     // todo ali
  //     // cellDates: true,
  //     // dateNF: "14"
  //     dateNF: "FMT 14"
  //     // cellDates: true, 
  //   });

  //   if (!rows.length) {
  //     throw new BadRequestException('Excel boşdur');
  //   }

  //   const lastRow = await this.sheetRowModel
  //     .findOne({ sheetId })
  //     .sort({ rowNumber: -1 });

  //   let rowNumber = lastRow ? lastRow.rowNumber + 1 : 1;

  //   const docs = rows.map((row) => ({
  //     sheetId,
  //     rowNumber: rowNumber++,
  //     data: row,
  //   }));
  //   console.log('docs', rows)
  //   // await this.sheetRowModel.insertMany(docs, { ordered: false });

  //   return {
  //     inserted: docs.length,
  //   };
  // }


  async importFromExcel(sheetId: Types.ObjectId, file: Express.Multer.File) {
    const sheet = await this.sheetModel.findById(sheetId);
    if (!sheet) throw new NotFoundException('Sheet tapılmadı');

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(file.buffer as unknown as ArrayBuffer);

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      throw new BadRequestException('Worksheet tapılmadı');
    }

    const rows: Record<string, any>[] = [];

    // Header-ları götürürük
    const headerRow = worksheet.getRow(1);
    const headers: string[] = [];

    headerRow.eachCell((cell, colNumber) => {
      headers[colNumber] = String(cell.value).trim();
    });

    // Data row-lar
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;

      const rowData: Record<string, any> = {};

      row.eachCell((cell, colNumber) => {
        const key = headers[colNumber];
        if (!key) return;

        let value: any = cell.value;

        // 🔥 Tarix handling
        if (value instanceof Date) {
          value = value; // artıq JS Date-dir
        }

        // Formula varsa
        if (typeof value === 'object' && value?.result) {
          value = value.result;
        }

        rowData[key] = value;
      });
      console.log('rowData', rowData)
      rows.push(rowData);
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
  async getRows(sheetId: Types.ObjectId, page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    const [rows, total] = await Promise.all([
      this.sheetRowModel
        .find({ sheetId })
        .sort({ rowNumber: 1 })
        .skip(skip)
        .limit(limit)
        .lean(), // IMPORTANT: plain objects
      this.sheetRowModel.countDocuments({ sheetId }),
    ]);

    const maskedRows = rows.map(row => ({
      ...row,
      data: {
        ...row.data,
        phone: maskPhone(row.data?.phone),
      },
    }));
    return { data: maskedRows, total, page, limit };
  }


  // ---------------- UPDATE ROW ----------------
  async updateRow(sheetId: Types.ObjectId, rowNumber: number, data: Record<string, any>) {
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
    sheetId: Types.ObjectId,
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
  async deleteRow(sheetId: Types.ObjectId, rowNumber: number) {
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


  async getSupervisorTableView(): Promise<any[]> {
    // 1. Supervisorun aid olduğu layihələri çəkirik
    const projects = await this.projectModel
      .find({
        isDeleted: false,
        supervisors: this.request.user._id  // yalnız bu supervisorun layihələri
      })
      .select('-agents -sheetIds -columnIds')
      .populate({ path: 'supervisors', select: 'name surname email' });

    const result = await Promise.all(
      projects.map(async (project) => {
        // 2. Company məlumatı
        const company = await this.companyModel.findById(project.companyId);

        // 3. Excel məlumatları
        const excelDocs = await this.excelModel.find({ _id: { $in: project.excelIds } });

        // 4. Hər Excel üçün sheet-ləri çəkirik
        const excelData = await Promise.all(
          excelDocs.map(async (excel) => {
            const sheets = await this.sheetModel.find({ excelId: excel._id });

            // 5. Hər sheet üçün agent və sütun məlumatları
            const sheetData = await Promise.all(
              sheets.map(async (sheet) => {
                const columnIds = sheet.columnIds.map(c => c.columnId);
                const columns = await this.columnModel.find({ _id: { $in: columnIds } });

                const agentIds = sheet.agentIds.map(a => a.agentId);
                const agents = await this.userModel.find({ _id: { $in: agentIds } });

                const sheetRows = await this.sheetRowModel.find({ sheetId: sheet._id });

                return {
                  sheetName: sheet.name,
                  columns: columns.map(c => c.dataKey),
                  agents: agents.map(a => ({
                    name: a.name,
                    surname: a.surname,
                    startRow: a.startRow,
                    endRow: a.endRow,
                  })),
                  sheetRows: sheetRows.map(r => r.data),
                };
              })
            );

            return {
              excelName: excel.name,
              sheets: sheetData,
            };
          })
        );

        return {
          supervisorProjects: project.name,
          company: company?.name,
          excels: excelData,
        };
      })
    );

    return result;
  }

}
