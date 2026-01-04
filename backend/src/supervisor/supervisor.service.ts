import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ColumnType } from "src/enum/enum";
import { CreateColumnDto } from "src/excel/dto/create-column.dto";
import { CreateExcelDto } from "src/excel/dto/create-excel.dto";
import { CreateSheetDto } from "src/excel/dto/create-sheet.dto";
import { UpdateColumnDto } from "src/excel/dto/update-column.dto";
import { UpdateExcelDto } from "src/excel/dto/update-excel.dto";
import { UpdateSheetDto } from "src/excel/dto/update-sheet.dto";
import { Column } from "src/excel/model/column.schema";
import { Excel } from "src/excel/model/excel.schema";
import { Sheet } from "src/excel/model/sheet.schema";
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

    // AgnetRowPermissions -a yazılan agentİd-leri tapib uyğun user-lerin id-lerin startRow və endRow sahələrini dəyişmək
    for (const permission of createSheetData.agentRowPermissions) {
      if (!createSheetData.agentIds.includes(permission.agentId)) {
        await this.userModel.findByIdAndUpdate(permission.agentId, {
          $set: {
            startRow: permission.startRow,
            endRow: permission.endRow,
          }
        });
      }
    }


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

        // AgnetRowPermissions -a yazılan agentİd-leri tapib uyğun user-lerin id-lerin startRow və endRow sahələrini 0 etmək
        for (const permission of updateSheetData.agentRowPermissions) {
          await this.userModel.findByIdAndUpdate(permission.agentId, {
            $set: {
              startRow: 0,
              endRow: 0,
            }
          });
        }
      }


      /* 5. Sheet-in digər datalarının update edilməsi */
      // AgnetRowPermissions -a yazılan agentİd-leri tapib uyğun user-lerin id-lerin startRow və endRow sahələrini yeniləmək
      for (const permission of updateSheetData.agentRowPermissions) {
        if (!updateSheetData.agentIds.includes(permission.agentId)) {
          await this.userModel.findByIdAndUpdate(permission.agentId, {
            $set: {
              startRow: permission.startRow,
              endRow: permission.endRow,
            }
          });
        }
      }
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



  //  -------------------------------------- Column functions --------------------------------------//


  // Sheet-ə column əlavə et
  async addColumnToSheet(sheetId: string, createColumnData: CreateColumnDto) {

    const sheet = await this.sheetModel.findById(sheetId)
    if (!sheet) {
      throw new NotFoundException('Sheet tapılmadı');
    }

    const project = await this.projectModel.findById(sheet.projectId);
    if (!project) {
      throw new NotFoundException('Project tapılmadı');
    }

    // Yeni column yaradılması
    const newColumn = new this.columnModel({ ...createColumnData, sheetId: sheet._id });

    // Select type column üçün options əlavə et
    if (createColumnData.type === ColumnType.Select) {
      throw new BadRequestException('Select tipli sütunlar üçün variantlar əlavə edilməlidir');
    }

    
    // Type phone olan column eyni sheet-də artıq mövcuddursa, xəta at
    if (createColumnData.type === ColumnType.Phone) {
      const existingPhoneColumn = await this.columnModel.findOne({  
        sheetId: sheet._id,
        type: ColumnType.Phone,
      });
      if (existingPhoneColumn) {
        throw new BadRequestException('Hər bir sheet üçün yalnız bir Phone tipli sütun ola bilər');
      }
    }


    // Proyektdə ColumnIds-də columnId əlavə et
    project.columnIds.push(newColumn._id);

    // Column ID-ni sheet-in columnIds massivinə əlavə et
    sheet.columnIds.push(newColumn._id);
    await Promise.all([project.save(), sheet.save()]);
    return await newColumn.save();
  }


  // Sheet-ə aid column-ları yenilə
  async updateColumnInSheet(columnId: string, updateColumnData: UpdateColumnDto) {
    const column = await this.columnModel.findById(columnId);
    if (!column) {
      throw new NotFoundException('Column tapılmadı');
    }

      // Type phone olan column eyni sheet-də artıq mövcuddursa, xəta at
    if (updateColumnData.type === ColumnType.Phone) {
      const existingPhoneColumn = await this.columnModel.findOne({  
        sheetId: column.sheetId,
        type: ColumnType.Phone,
      });
      if (existingPhoneColumn) {
        throw new BadRequestException('Hər bir sheet üçün yalnız bir Phone tipli sütun ola bilər');
      }
    }


    column.set({ ...updateColumnData });
    await column.save();
    return column;
  }


  // Sheet-ə aid column-ları gətir
  async getColumnsOfSheet(sheetId: string) {
    const columns = await this.columnModel.find({ sheetId: sheetId });
    return columns;
  }

}
