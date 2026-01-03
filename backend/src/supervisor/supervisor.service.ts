import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { ApiOperation } from "@nestjs/swagger";
import { Model, Types } from "mongoose";
import { CreateExcelDto } from "src/excel/dto/create-excel.dto";
import { CreateSheetDto } from "src/excel/dto/create-sheet.dto";
import { UpdateExcelDto } from "src/excel/dto/update-excel.dto";
import { UpdateSheetDto } from "src/excel/dto/update-sheet.dto";
import { Excel } from "src/excel/model/excel.schema";
import { Sheet } from "src/excel/model/sheet.schema";
import { Project } from "src/project/model/project.schema";


@Injectable()
export class SupervisorService {
  constructor(
    @InjectModel(Excel.name) private excelModel: Model<Excel>,
    @InjectModel(Project.name) private projectModel: Model<Project>,
    @InjectModel(Sheet.name) private sheetModel: Model<Sheet>,

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
    return await this.excelModel.findByIdAndUpdate(_id, { $set: updateExcelData }, { new: true }).exec();
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

    /* 3. Agent row aralıqlarının yoxlanması */
    const agents = createSheetData.agentRowPermissions;

    for (let i = 0; i < agents.length; i++) {
      const a = agents[i];

      if (a.startRow >= a.endRow) {
        throw new BadRequestException(
          `Agent (${a.agentId}) üçün startRow endRow-dan kiçik olmalıdır`,
        );
      }

      for (let j = i + 1; j < agents.length; j++) {
        const b = agents[j];

        const isOverlap = a.startRow <= b.endRow && b.startRow <= a.endRow;

        if (isOverlap) {
          throw new BadRequestException(
            `Row aralığı konflikti:
        Agent ${a.agentId} (${a.startRow}-${a.endRow})
        Agent ${b.agentId} (${b.startRow}-${b.endRow})`,
          );
        }
      }
    }

    /* 4. Yeni sheet yaradılması */
    const newSheet = new this.sheetModel({ ...createSheetData, projectId: project._id });

    /* 5. Sheet ID-lərinin push edilməsi */
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

      /* 2. Agent row icazələrinin silinməsi (əgər gəlibsə) */
      if (
        updateSheetData.agentRowPermissions &&
        updateSheetData.agentRowPermissions.length > 0
      ) {
        const agentsToRemove = updateSheetData.agentRowPermissions.map(
          (a) => a.agentId,
        );

        // 3. agentIds massivindən çıxar
        sheet.agentIds = sheet.agentIds.filter(
          (agentId) => !agentsToRemove.includes(agentId),
        );

        // 4. agentRowPermissions massivindən çıxar
        sheet.agentRowPermissions = sheet.agentRowPermissions.filter(
          (permission) => !agentsToRemove.includes(permission.agentId),
        );
      }

      /* 5. Sheet-in digər datalarının update edilməsi */
      return await this.sheetModel.findByIdAndUpdate(
        _id,
        { $set: updateSheetData },
        { new: true },
      ).exec();
    }
  }


  //Excel -ə aid sheetləri gətir
  async getSheetsOfExcel(excelId: string) {
    const sheets = await this.sheetModel.find({ excelId: excelId })
      .populate([{ path: 'agentIds', select: '-password' }, { path: 'agentRowPermissions' }, { path: 'columnIds' }]);
    return sheets;
  }


}

