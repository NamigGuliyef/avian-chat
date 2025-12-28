import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCompanyDto } from 'src/company/dto/create-company.dto';
import { Company } from 'src/company/model/company.schema';
import { Project } from 'src/crm/model/project.schema';
import { CreateProjectDto } from 'src/project/dto/create-project.dto';

@Injectable()
export class AdminService {

  constructor(@InjectModel(Company.name) private readonly companyModel: Model<Company>,
    @InjectModel(Project.name) private readonly projectModel: Model<Project>
  ) { }

  // Yeni şirkət yaratmaq funksiyası
  async createCompany(createCompanyData: CreateCompanyDto): Promise<{ message: string, company: Company }> {
    const newCompany = new this.companyModel({
      ...createCompanyData
    });

    return {
      message: "Yeni şirkət uğurla yaradıldı", company: await newCompany.save()
    }
  }



  // Şirkət yeniləmə funksiyası
  async updateCompany(_id: string, updateCompanyData: Partial<CreateCompanyDto>): Promise<{ message: string, company: Company | null }> {
    const updatedCompany = await this.companyModel.findByIdAndUpdate(_id, { $set: updateCompanyData }, { new: true });
    return {
      message: "Şirkət məlumatları uğurla yeniləndi", company: updatedCompany
    }
  }


  //Şirkət silmə funksiyası
  async deleteCompany(_id: string): Promise<{ message: string }> {
    const deletedCompany = await this.companyModel.findByIdAndDelete(_id);
    return {
      message: "Şirkət uğurla ləğv edildi",
    }
  }

  // Bütün şirkətləri gətirən funksiyası
  async getAllCompanies(): Promise<Company[]> {
    return this.companyModel.find().exec();
  }


  // Şirkəti id-ə görə gətirən funksiyası
  async getCompanyById(_id: string): Promise<Company | null> {
    return this.companyModel.findById(_id).exec();
  }


  // Yeni layihə yaratmaq funksiyası
  async createProject(createProjectData: CreateProjectDto): Promise<Company> {

    let agents: string[] = [];
    let supervisors: string[] = [];

    // supervisor və agent id-lərini ayrılıqda yığırıq
    for (let i = 0; i < createProjectData.agents.length; i++) {
      const agentId = createProjectData.agents[i];
      agents.push(agentId);
    }


    for (let j = 0; j < createProjectData.supervisors.length; j++) {
      const supervisorId = createProjectData.supervisors[j];
      supervisors.push(supervisorId);
    }

    const newCompany = new this.companyModel({
      ...createProjectData,
      supervisors: supervisors,
      agents: agents,
    });
    return await newCompany.save();
  }


  



}