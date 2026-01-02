import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateExcelDto } from "src/excel/dto/create-excel.dto";
import { Excel } from "src/excel/model/excel.schema";
import { Project } from "src/project/model/project.schema";


@Injectable()
export class SupervisorService {
  constructor(
    @InjectModel(Excel.name) private excelModel: Model<Excel>,
    @InjectModel(Project.name) private projectModel: Model<Project>
  ) { }


  // --------------------------------------------------- Excel functions ------------------//

  // Excel yaratmaq üçün
  async createExcel(createExcelData: CreateExcelDto){
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
    return await this.excelModel.find({ projectId }).lean();
  }

}
