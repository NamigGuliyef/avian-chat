import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { CreateExcelDto } from "src/excel/dto/create-excel.dto";
import { Excel } from "src/excel/model/excel.schema";
import { Project } from "src/project/model/project.schema";


@Injectable()
export class SupervisorService {
  constructor(
    @InjectModel(Excel.name) private excelModel: Model<Excel>,
    @InjectModel(Project.name) private projectModel: Model<Project>
  ) { }


  ///  ---------------------------  Project function --------------------------------//

  // Supervisor uyğun layihələri gətir
  async getSupervisorProjects(supervisorId: string) {
    return await this.projectModel.find({ supervisors: { $in: [supervisorId] } })
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
    const data = await this.excelModel.find({ projectId })
    return data;
  }


  // Excel yeniləmək üçün
  async updateExcel(_id: string, updateExcelData: Partial<CreateExcelDto>) {
    return await this.excelModel.findByIdAndUpdate(_id, { $set: updateExcelData }, { new: true }).exec();
  }



}
