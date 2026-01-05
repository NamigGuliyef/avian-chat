import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateAdminColumnDto } from "src/excel/dto/create-column.dto";
import { CreateExcelDto } from "src/excel/dto/create-excel.dto";
import { CreateSheetDto } from "src/excel/dto/create-sheet.dto";
import { UpdateExcelDto } from "src/excel/dto/update-excel.dto";
import { UpdateSheetDto } from "src/excel/dto/update-sheet.dto";
import { Column } from "src/excel/model/column.schema";
import { Excel } from "src/excel/model/excel.schema";
import { Sheet, SheetColumn } from "src/excel/model/sheet.schema";
import { Project } from "src/project/model/project.schema";
import { User } from "src/user/model/user.schema";


@Injectable()
export class SupervisorService {
  constructor(
    @InjectModel(Excel.name) private excelModel: Model<Excel>,
    @InjectModel(Project.name) private projectModel: Model<Project>,
    @InjectModel(Sheet.name) private sheetModel: Model<Sheet>,
    @InjectModel(Column.name) private columnModel: Model<Column>,
    @InjectModel(User.name) private userModel: Model<User>,

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
  async updateExcel(_id: string, updateExcelData: UpdateExcelDto) {

    /* 1. Excel yoxlanışı */
    const excel = await this.excelModel.findById(_id);
    if (!excel) {
      throw new NotFoundException('Excel tapılmadı');
    }

    /* 2. Agent silinməsi varsa yoxla */
    if (updateExcelData.agentIds) {

      // Mövcud agent-lər
      const currentAgentIds = excel.agentIds.map(id => id.toString());

      // Çıxarılmaq istənən agent-lər
      const removedAgentIds = currentAgentIds.filter(
        id => !updateExcelData.agentIds.map(aid => aid.toString()).includes(id),
      );

      if (removedAgentIds.length > 0) {

        /* 3. Sheet-lərdə istifadə olunan agent-ləri yoxla */
        const sheetsUsingAgents = await this.sheetModel.find({
          excelId: excel._id,
          agentIds: { $in: removedAgentIds },
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
      columns: [], // initially empty
    });

    /* 4. Sheet ID-lərin əlaqələndirilməsi */
    project.sheetIds.push(newSheet._id);
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
      });

      await sheet.save();
      return sheet;
    }
  }


  //Excel -ə aid sheetləri gətir
  async getSheetsOfExcel(excelId: string) {
    const sheets = await this.sheetModel.find({ excelId: excelId })
      .populate([{ path: 'agentIds', select: '-password' }, { path: 'columnIds' }]);
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
    const exists = sheet.columns.some(
      (c) => c.columnId.toString() === column._id.toString(),
    );

    if (exists) {
      throw new BadRequestException('Bu column artıq sheet-ə əlavə olunub');
    }

    sheet.columns.push({
      columnId: column._id,
      editable: createColumnData.editable ?? true,
      required: createColumnData.required ?? false,
      agentId: createColumnData.agentId ?? null,
      order: sheet.columns.length + 1,
    });

    await sheet.save();
    return sheet;
  }


  // Sheet-ə aid column-ları yenilə
  async updateColumnInSheet(
    sheetId: string,
    columnId: string,
    updateColumnData: SheetColumn,
  ) {
    const sheet = await this.sheetModel.findById(sheetId);
    if (!sheet) {
      throw new NotFoundException('Sheet tapılmadı');
    }

    const columnConfig = sheet.columns.find(
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
      .populate('columns.columnId');

    if (!sheet) {
      throw new NotFoundException('Sheet tapılmadı');
    }

    return sheet.columns;
  }

}
