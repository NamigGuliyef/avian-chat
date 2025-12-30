import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateChannelDto } from 'src/channel/dto/create-channel.dto';
import { Channel } from 'src/channel/model/channel.schema';
import { CreateCompanyDto } from 'src/company/dto/create-company.dto';
import { Company } from 'src/company/model/company.schema';
import { CreateProjectDto } from 'src/project/dto/create-project.dto';
import { Project } from 'src/project/model/project.schema';
import { User } from 'src/user/model/user.schema';

@Injectable()
export class AdminService {

  constructor(
    @InjectModel(Company.name) private readonly companyModel: Model<Company>,
    @InjectModel(Project.name) private readonly projectModel: Model<Project>,
    @InjectModel(Channel.name) private readonly channelModel: Model<Channel>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) { }


  //------------------------------------------- -- Company Functions ---------------------------//

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


  // Şirkətə məxsus layihənin agent və supervisor-larını gətirən funksiya
  async getCompanyProjectMembers(companyId: string): Promise<{ count: number, agents: Types.ObjectId[], supervisors: Types.ObjectId[] }> {

    // Şirkətə məxsus layihələri tapırıq və onların agent və supervisor-larını yükləyirik
    const projects = await this.projectModel.find({ companyId: companyId })
      .populate({ path: 'agents', select: 'name surname email' }).populate({ path: 'supervisors', select: 'name surname email' }).exec();

    // Bütün agent və supervisor-lar üçün boş massivlər yaradırıq
    let agents: Types.ObjectId[] = [];
    let supervisors: Types.ObjectId[] = [];

    // Hər bir layihənin agent və supervisor-larını ayrıca yığırıq

    projects.forEach(project => {
      project.agents.forEach(agentId => {
        if (!agents.includes(agentId)) {
          agents.push(agentId);
        }
      });

      project.supervisors.forEach(supervisorId => {
        if (!supervisors.includes(supervisorId)) {
          supervisors.push(supervisorId);
        }
      });
    });

    // agents və supervisors massivlərinin uzunluğunu və özlərini qaytarırıq  
    return {
      count: agents.length + supervisors.length,
      supervisors: supervisors,
      agents: agents,
    };
  }



  // ----------------------------------Channel Funtions -------------------------------//

  // Kanal funksiyaları
  // Kanal yaratmaq funksiyası
  async createChannel(createChannelData: CreateChannelDto): Promise<{ message: string, channel: Channel | null }> {
    // Kanal yaratmaq üçün tətbiq olunan məntiq
    // İlk öncə şirkətin mövcudluğunu yoxlayırıq
    const company = await this.companyModel.findById(createChannelData.companyId);
    if (!company) {
      return { message: "Verilən şirkət tapılmadı", channel: null };
    }
    // Şirkət mövcuddursa, yeni kanalı yaradırıq
    const newChannel = new this.channelModel({
      ...createChannelData, companyId: company._id
    });
    const savedChannel = await newChannel.save();

    // Kanalı həmin şirkətin channel-lərinə əlavə edirik
    company.channels.push(savedChannel._id)
    await company.save();

    return { message: "Kanal uğurla yaradıldı", channel: savedChannel };
  }



  // Kanal yeniləmə funksiyası
  async updateChannel(_id: string, updateChannelData: Partial<CreateChannelDto>): Promise<{ message: string, channel: Channel | null }> {
    // Kanal yeniləmək üçün tətbiq olunan məntiq
    const updatedChannel = await this.channelModel.findByIdAndUpdate(_id, { $set: updateChannelData }, { new: true });
    return { message: "Kanal məlumatları uğurla yeniləndi", channel: updatedChannel };
  }


  // Kanal silmə funksiyası

  // async deleteChannel(_id: string): Promise<{ message: string }> {
  //   // Kanal silmək üçün tətbiq olunan məntiq
  //   // İlk öncə sildiyimiz kanal hansı şirkətə aid olduğunu tapırıq
  //   const channel = await this.channelModel.findById(_id);
  //   // Kanal mövcuddursa, 
  //   if (channel) {
  //     // Şirkəti tapırıq
  //     const company = await this.companyModel.findById({ _id: channel.companyId });
  //     // Şirkət mövcuddursa,
  //     if (company) {
  //       // Şirkətin channel-lərindən silinən kanalı çıxarırıq
  //       company.channels = company.channels.filter(chId => chId.toString() !== _id);
  //       await company.save();
  //     }
  //   }
  //   await this.channelModel.findByIdAndDelete(_id);
  //   return { message: "Kanal uğurla ləğv edildi" };
  // }


  // Bütün kanalları gətirən funksiyası
  async getAllChannels(companyId: string): Promise<Channel[]> {
    // Kanal gətirmək üçün tətbiq olunan məntiq
    return this.channelModel.find({ companyId: companyId }).exec();
  }


  // Kanalı id-ə görə gətirən funksiyası
  async getChannelById(_id: string): Promise<Channel | null> {
    // Kanalı id-ə görə gətirmək üçün tətbiq olunan məntiq
    return this.channelModel.findById(_id).exec();
  }


  // istədiyim user-e birdən çox kanal icazəsi vermək funksiyası
  async assignChannelToUser(userId: string, channels: Types.ObjectId[]): Promise<{ message: string }> {
    // user-e kanal icazəsi vermək üçün tətbiq olunan məntiq
    // ilk öncə user-in mövcudluğunu yoxlayırıq
    const userExist = await this.userModel.findById(userId);
    if (!userExist) {
      return { message: "İstifadəçi tapılmadı" };
    }

    // user-in channels massivinə kanalId-ni əlavə edirik
    // Birdən çox seçilmiş kanalların id-sini dongu ile tapib user-in channels massivinə əlavə edirik
    for (let i = 0; i < channels.length; i++) {
      const channelId = channels[i];
      const channelExist = await this.channelModel.findById(channelId);
      if (channelExist) {
        // Əgər kanal mövcuddursa, user-in channels massivinə əlavə edirik
        if (!userExist.channelIds.includes(channelId)) {
          userExist.channelIds.push(channelId);
          channels.push(channelId);
        }
      }
    }
    await userExist.save();
    // kanalın mövcudluğunu yoxlayırıq
    const channelExist = await this.channelModel.findById(channels[0]);
    if (!channelExist) {
      return { message: "Kanal tapılmadı" };
    }
    return { message: "Kanal icazəsi uğurla verildi" };
  }



  //-------------------------------------------- Project Functions ---------------------------//

  // Yeni layihə yaratmaq funksiyası
  async createProject(createProjectData: CreateProjectDto): Promise<{ message: string, project: Project }> {

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

    const newProject = new this.projectModel({
      ...createProjectData,
      supervisors: supervisors,
      agents: agents,
    });
    return { message: "Yeni layihə uğurla yaradıldı", project: await newProject.save() };
  }


  // Layihə yeniləmə funksiyası
  async updateProject(_id: string, updateProjectData: Partial<CreateProjectDto>): Promise<{ message: string, project: Project | null }> {
    const updatedProject = await this.projectModel.findByIdAndUpdate(_id, { $set: updateProjectData }, { new: true });
    return {
      message: "Layihə məlumatları uğurla yeniləndi", project: updatedProject
    }
  }


  // Layihə silmə funksiyası
  async deleteProject(_id: string): Promise<{ message: string }> {
    const deletedProject = await this.projectModel.findByIdAndDelete(_id);
    return {
      message: "Layihə uğurla ləğv edildi",
    }
  }


  // Bütün layihələri gətirən funksiyası
  async getAllProjects(companyId: string): Promise<Project[]> {
    return this.projectModel.find({ companyId: companyId }).exec();
  }


  // Layihəni id-ə görə gətirən funksiyası
  async getProjectById(_id: string): Promise<Project | null> {
    return this.projectModel.findById(_id).exec();
  }


}

