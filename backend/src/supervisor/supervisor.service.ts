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
import { CreateAdminColumnDto } from "src/excel/dto/create-column.dto";
import { UpdateAdminColumnDto } from "src/excel/dto/update-column.dto";


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

  // Column
  // ---------------- Column ---------------- //

  async createColumn(data: CreateAdminColumnDto) {
    return await this.columnModel.create(data);
  }

  async getColumns(projectId: Types.ObjectId) {
    return await this.columnModel.find({ projectId }).sort({ order: 1, createdAt: -1 });
  }

  async updateColumn(columnId: string, data: UpdateAdminColumnDto) {
    return await this.columnModel.findByIdAndUpdate(
      columnId,
      data,
      { new: true }
    );
  }

  async deleteColumn(columnId: string) {
    return await this.columnModel.findByIdAndDelete(columnId);
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
  // Agent sıra aralıqlarının düzgünlüyünü yoxla
  private validateAgentRowRanges(agentIds: any[]): void {
    const ranges: Array<{ agentId: string; startRow: number; endRow: number; rangeIndex?: number }> = [];

    // Bütün agent-lərin bütün aralıqlarını toplayırıq
    agentIds.forEach((agent) => {
      // Köhnə format: startRow və endRow
      if (agent.startRow && agent.endRow) {
        const start = Number(agent.startRow);
        const end = Number(agent.endRow);

        if (start > end) {
          throw new BadRequestException(
            `Agent ${agent.name} ${agent.surname}: Başlama sətri bitirmə sətrinə qədər olmalıdır`
          );
        }

        ranges.push({
          agentId: agent.agentId.toString(),
          startRow: start,
          endRow: end,
        });
      }

      // Yeni format: ranges massiви
      if (agent.ranges && Array.isArray(agent.ranges)) {
        agent.ranges.forEach((range, rangeIndex) => {
          const start = Number(range.startRow);
          const end = Number(range.endRow);

          if (start > end) {
            throw new BadRequestException(
              `Agent ${agent.name} ${agent.surname} (Aralıq ${rangeIndex + 1}): Başlama sətri bitirmə sətrinə qədər olmalıdır`
            );
          }

          ranges.push({
            agentId: agent.agentId.toString(),
            startRow: start,
            endRow: end,
            rangeIndex,
          });
        });
      }
    });

    // Aralıqlar arasında üst-üstə düşmə yoxlanışı
    for (let i = 0; i < ranges.length; i++) {
      for (let j = i + 1; j < ranges.length; j++) {
        const range1 = ranges[i];
        const range2 = ranges[j];

        // Eyni agent ise, keçdik
        if (range1.agentId === range2.agentId) continue;

        // Üst-üstə düşmə yoxlanışı
        if (
          (range1.startRow <= range2.endRow && range1.endRow >= range2.startRow) ||
          (range2.startRow <= range1.endRow && range2.endRow >= range1.startRow)
        ) {
          const agent1 = agentIds.find(a => a.agentId.toString() === range1.agentId);
          const agent2 = agentIds.find(a => a.agentId.toString() === range2.agentId);

          throw new BadRequestException(
            `Agent ${agent1.name} ${agent1.surname} (${range1.startRow}-${range1.endRow}) və Agent ${agent2.name} ${agent2.surname} (${range2.startRow}-${range2.endRow}) arasında sətir aralığında üst-üstə düşmə var`
          );
        }
      }
    }
  }


  async updateSheetInExcel(_id: Types.ObjectId, updateSheetData: UpdateSheetDto) {
    /* 1. Sheet yoxlanışı */
    const sheet = await this.sheetModel.findById(_id);
    if (!sheet) {
      throw new NotFoundException('Sheet tapılmadı');
    }

    /* 2. Agent sıra aralıqlarının yoxlanışı */
    if (updateSheetData.agentIds && updateSheetData.agentIds.length > 0) {
      this.validateAgentRowRanges(updateSheetData.agentIds);
    }

    /* 3. Sheet məlumatlarının update edilməsi */
    sheet.set({
      name: updateSheetData.name ?? sheet.name,
      description: updateSheetData.description ?? sheet.description,
      agentIds: updateSheetData.agentIds ?? sheet.agentIds,
      columnIds: updateSheetData.columnIds ?? sheet.columnIds
    });

    await sheet.save();
    return sheet;
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

    // Optimized Duplicate handling logic 
    const skipStatuses = ['Successful', 'Wrong Number'];

    // 1. Get phones that already have a result status in the DB
    const phonesWithResultArray = await this.sheetRowModel.distinct('data.phone', {
      sheetId,
      'data.callstatus': { $in: skipStatuses }
    });
    const existingPhoneWithResultSet = new Set(phonesWithResultArray.filter(Boolean).map(p => String(p).trim()));

    // 2. Get ALL phones currently in the DB for this sheet
    const allExistingPhonesArray = await this.sheetRowModel.distinct('data.phone', { sheetId });
    const allExistingPhoneSet = new Set(allExistingPhonesArray.filter(Boolean).map(p => String(p).trim()));

    const processedPhonesInBatch = new Set<string>();

    const docs: any[] = [];
    for (const rowData of rows) {
      const phone = String(rowData.phone || '').trim();
      const status = String(rowData.callstatus || '').trim();

      if (!phone) continue;

      // Condition 1: If phone already has a result in the DB, skip.
      if (existingPhoneWithResultSet.has(phone)) continue;

      // Condition 2: If phone exists in DB with ANY status AND incoming row IS a result, skip.
      if (skipStatuses.includes(status) && allExistingPhoneSet.has(phone)) continue;

      // Condition 3: Batch deduplication - skip if we've already seen this phone in this Excel file.
      if (processedPhonesInBatch.has(phone)) continue;

      processedPhonesInBatch.add(phone);

      // Ensure phone-like fields are stored as strings to avoid regex search issues
      const cleanedRowData = { ...rowData };
      Object.keys(cleanedRowData).forEach(key => {
        if (key.toLowerCase().includes('phone') || key.toLowerCase().includes('nömrə') || key.toLowerCase() === 'mobil') {
          if (cleanedRowData[key] !== null && cleanedRowData[key] !== undefined) {
            cleanedRowData[key] = String(cleanedRowData[key]).trim();
          }
        }
      });

      docs.push({
        sheetId,
        rowNumber: rowNumber++,
        data: cleanedRowData,
      });
    }

    if (docs.length > 0) {
      await this.sheetRowModel.insertMany(docs, { ordered: false });
    }

    return {
      inserted: docs.length,
      skipped: rows.length - docs.length
    };
  }

  // ---------------- GET ROWS ----------------
  async getRows(
    sheetId: Types.ObjectId,
    page = 1,
    limit = 50,
    skipRows = 0,
    search?: string,
    filters?: string,
  ) {
    const skipOffset = (page - 1) * limit + skipRows;
    const objSheetId = (typeof sheetId === 'string') ? new Types.ObjectId(sheetId) : sheetId;
    console.log(`[getRows] ID: ${objSheetId}, Type: ${typeof sheetId}, Page: ${page}`);
    const query: any = { sheetId: objSheetId };

    // Fetch column keys AND all existing keys in data objects for this sheet
    let dataKeys: string[] = [];
    if (search) {
      const [sheet, keysInData, sampleCount] = await Promise.all([
        this.sheetModel.findById(objSheetId).populate('columnIds.columnId').lean(),
        this.sheetRowModel.aggregate([
          { $match: { sheetId: objSheetId } },
          // { $limit: 100 }, // Search ALL keys in the sheet for reliability
          { $project: { keys: { $objectToArray: "$data" } } },
          { $unwind: "$keys" },
          { $group: { _id: null, allKeys: { $addToSet: "$keys.k" } } }
        ]),
        this.sheetRowModel.countDocuments({ sheetId: objSheetId })
      ]);

      const columnKeys = sheet?.columnIds
        ?.map((c: any) => c.columnId?.dataKey)
        .filter((k: string) => k) || [];

      const foundKeysInData = keysInData[0]?.allKeys || [];
      const fallbacks = ['phone', 'Phone', 'Mobil', 'mobil', 'nömrə', 'Nömrə', 'number', 'Number', '№', 'status', 'Status', 'Zəng nömrəsi', 'Əlaqə nömrəsi'];
      dataKeys = Array.from(new Set([...columnKeys, ...foundKeysInData, ...fallbacks]));

      console.log(`[getRows] Search: "${search}" | Total rows in sheet: ${sampleCount} | Gathered Keys:`, dataKeys.length);
    }

    // Apply filters logic FIRST to use indexes efficiently
    if (filters) {
      try {
        const parsedFilters = JSON.parse(filters);
        Object.keys(parsedFilters).forEach((key) => {
          const values = parsedFilters[key];
          if (Array.isArray(values) && values.length > 0) {
            // Use specific index for phone if key is phone
            if (key === 'phone') {
              query['data.phone'] = { $in: values };
            } else {
              query[`data.${key}`] = { $in: values };
            }
          }
        });
      } catch (e) {
        console.error('Error parsing filters:', e);
      }
    }

    // Apply search logic
    if (search) {
      // Create a flexible regex that allows for spaces, dashes, or dots between characters
      // e.g. "551000009" will match "551 000 009" or "551-000-009"
      const flexibleSearch = search.split('').join('[\\s\\-\\.\\(\\)]*');
      const searchRegex = { $regex: flexibleSearch, $options: 'i' };
      const searchNumber = Number(search);
      const orConditions: any[] = [{ rowNumber: searchNumber || -1 }];

      // Search across all identified data keys
      dataKeys.forEach(key => {
        orConditions.push({ [`data.${key}`]: searchRegex });

        // If search is numeric, try searching for the number as well
        if (!isNaN(searchNumber)) {
          orConditions.push({ [`data.${key}`]: searchNumber });
          // Also try matching the number within a string if possible
          // (regex already handles this for strings)
        }
      });

      query.$or = orConditions;
    }

    const [rows, total] = await Promise.all([
      this.sheetRowModel
        .find(query)
        .sort({ rowNumber: 1 })
        .skip(skipOffset)
        .limit(limit)
        .lean(),
      this.sheetRowModel.countDocuments(query),
    ]);

    const maskedRows = rows.map((row) => ({
      ...row,
      data: {
        ...row.data,
        phone: maskPhone(row.data?.phone),
      },
    }));
    return { data: maskedRows, total, page, limit };
  }

  async getFilterOptions(sheetId: Types.ObjectId) {
    // Optimization: Consider using a more targeted aggregation or even caching
    // For now, refining the pipeline to be slightly cleaner
    const filterOptions = await this.sheetRowModel.aggregate([
      { $match: { sheetId: new Types.ObjectId(sheetId) } },
      { $limit: 10000 }, // Safety limit for aggregation on very large sheets
      { $project: { data: 1 } },
      { $project: { dataKeys: { $objectToArray: '$data' } } },
      { $unwind: '$dataKeys' },
      { $match: { 'dataKeys.k': { $nin: ['phone', 'number', '№', 'No'] } } }, // Exclude phone and number fields from filter choices
      {
        $group: {
          _id: '$dataKeys.k',
          values: { $addToSet: '$dataKeys.v' },
        },
      },
    ]);

    return filterOptions.reduce((acc, curr) => {
      acc[curr._id] = curr.values
        .filter((v) => v !== null && v !== undefined && v !== '')
        .map((v) => String(v))
        .sort();
      return acc;
    }, {});
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
    sheetId: string,
    rowNumber: number,
    sheetCellData: SheetCellDto
  ) {
    const isRemindMe = sheetCellData.key === 'remindMe';
    const updateQuery: any = isRemindMe
      ? { remindMe: !!sheetCellData.value }
      : { [`data.${sheetCellData.key}`]: sheetCellData.value };

    // Status dəyişdirildikdə tarix avtomatik yenilənsin
    if (!isRemindMe && sheetCellData.key?.toLowerCase().includes('status')) {
      const sheet = await this.sheetModel
        .findById(sheetId)
        .populate({ path: 'columnIds', select: 'columnId' });

      const dateColumn: any = sheet?.columnIds?.find((c: any) =>
        c?.columnId?.dataKey?.toLowerCase().includes('date') ||
        c?.columnId?.name?.toLowerCase().includes('tarix')
      );

      if (dateColumn?.columnId?.dataKey) {
        const now = new Date();
        const dateStr = now.toLocaleString('az-AZ', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
        updateQuery[`data.${dateColumn.columnId.dataKey}`] = dateStr;
      }
    }

    const row = await this.sheetRowModel.findOneAndUpdate(
      { sheetId, rowNumber },
      { $set: updateQuery },
      { new: true }
    );

    if (!row) {
      throw new NotFoundException('Row tapılmadı');
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


  async getSupervisorTableView(
    startDate?: string,
    endDate?: string
  ): Promise<any[]> {
    const start = startDate
      ? new Date(startDate)
      : new Date(new Date().setHours(0, 0, 0, 0));

    const end = endDate
      ? new Date(endDate)
      : new Date(new Date().setHours(23, 59, 59, 999));

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

                // Filter rows by date
                const sheetRows = await this.sheetRowModel.find({
                  sheetId: sheet._id,
                  'data.date': {
                    $gte: start,
                    $lte: end,
                  },
                });

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
