import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
import { CreateUserDto } from 'src/auth/dto/create-user.dto';
import { CreateChannelDto } from 'src/channel/dto/create-channel.dto';
import { Channel } from 'src/channel/model/channel.schema';
import { CreateCompanyDto } from 'src/company/dto/create-company.dto';
import { Company } from 'src/company/model/company.schema';
import { hashPassword } from 'src/helper/hashpass';
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
    await this.companyModel.findByIdAndUpdate(_id, { $set: { isDeleted: true } });
    return {
      message: "Şirkət uğurla ləğv edildi",
    }
  }

  // Bütün şirkətləri gətirən funksiyası
  async getAllCompanies(): Promise<Company[]> {
    return this.companyModel.find({ isDeleted: false }).exec();
  }


  // Şirkəti id-ə görə gətirən funksiyası
  async getCompanyById(_id: string): Promise<Company | null> {
    return this.companyModel.findById(_id).exec();
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



  // istədiyim user-in kanallarını silmək funksiyası
  async removeChannelsFromUser(userId: string, channels: Types.ObjectId[]): Promise<{ message: string }> {
    // user-in kanallarını silmək üçün tətbiq olunan məntiq
    // ilk öncə user-in mövcudluğunu yoxlayırıq
    const userExist = await this.userModel.findById(userId);
    if (!userExist) {
      return { message: "İstifadəçi tapılmadı" };
    }
    // user-in channels masssivinden hemin kanalın ObjectId-sini çıxarırıq
    for (let i = 0; i < channels.length; i++) {
      const channelId = channels[i];
      userExist.channelIds = userExist.channelIds.filter(chId => chId.toString() !== channelId.toString());
    }
    await userExist.save();
    return { message: "Kanal icazəsi uğurla götürüldü" };

  }



  //-------------------------------------------- Project Functions ---------------------------//

  // Yeni layihə yaratmaq funksiyası
  async createProject(createProjectData: CreateProjectDto): Promise<{ message: string, project: Project }> {
    const newProject = new this.projectModel(createProjectData);
    return { message: "Yeni layihə uğurla yaradıldı", project: await newProject.save() };
  }


  // proyektin id-sine görə supervisor ve agent elave etmek funksiyasi
  async addProjectMembers(projectId: string, userId: any, type: string): Promise<{ message: string; project: Project | null }> {

    const project = await this.projectModel.findById(projectId);

    if (!project) {
      return { message: "Layihə tapılmadı", project: null };
    }

    if (type === "A") {
      // artıq varsa, təkrar əlavə etməsin
      if (!project.agents.includes(userId)) {
        project.agents.push(userId);
        await this.userModel.findByIdAndUpdate(userId, { $push: { projectIds: projectId } });
      }
    }
    else if (type === "S") {
      if (!project.supervisors.includes(userId)) {
        project.supervisors.push(userId);
        await this.userModel.findByIdAndUpdate(userId, { $push: { projectIds: projectId } });
      }
    }
    await project.save();

    return {
      message: "Layihəyə üzvlər uğurla əlavə edildi",
      project,
    };
  }



  // proyektden agent və ya supervisor silme funksiyasi
  async deleteProjectMember(
    projectId: string,
    userId: string,
    type: string,
  ): Promise<{ message: string; project: Project | null }> {

    // project tapılır
    const project = await this.projectModel.findById(projectId);

    if (!project) {
      return { message: 'Layihə tapılmadı', project: null };
    }

    // type-a görə silmə
    if (type === 'A') {
      project.agents = project.agents.filter(
        id => id.toString() !== userId,
      );
    } else if (type === 'S') {
      project.supervisors = project.supervisors.filter(
        id => id.toString() !== userId,
      );
    }

    // user-dən projectId tam silinir
    await this.userModel.findByIdAndUpdate(
      userId,
      { $unset: { projectId: 1 } }
    );

    // project save
    await project.save();

    return {
      message: 'Layihə üzvü uğurla silindi',
      project,
    };
  }



  // Layihə yeniləmə funksiyası
  async updateProject(_id: string, updateProjectData: Partial<CreateProjectDto>): Promise<{ message: string, project: Project | null }> {
    const updatedProject = await this.projectModel.findByIdAndUpdate(_id, { $set: updateProjectData }, { new: true });
    return {
      message: "Layihə məlumatları uğurla yeniləndi", project: updatedProject
    }
  }


  // Layihə silmə funksiyası - isDeleted true edilir
  async deleteProject(_id: string): Promise<{ message: string }> {
    await this.projectModel.findByIdAndUpdate(_id, { $set: { isDeleted: true } });
    return { message: "Layihə uğurla ləğv edildi" };
  }


  // Bütün layihələri gətirən funksiyası
  // Layihəyə məxsus agent və supervisor-ları gətirən və saylarını qaytaran funksiyası
  async getAllProjects(companyId: string): Promise<any[]> {
    let filter = {};
    companyId ? filter = { companyId: companyId, isDeleted: false } : filter = { isDeleted: false };

    // Layihəyə məxsus agent və supervisor-ları gətirən və saylarını qaytaran funksiyası
    const projects = await this.projectModel.find(filter).
      populate({ path: 'agents', select: 'name surname email' }).populate({ path: 'supervisors', select: 'name surname email' }).lean();
    return projects.map(project => ({
      ...project,
      agentsCount: project.agents.length || 0,
      supervisorsCount: project.supervisors.length || 0
    }));
  }


  // Supervisor və agent-ları role və emaillərinə görə filterləyən funksiyası
  async filterProjectMembers(projectId: string, role: string, email: string): Promise<User[]> {

    // hansi company-e aiddirse o company-in user-larini filterleyir
    const filter: any = { projectId };

    role ? filter.role = { $regex: role, $options: 'i' } : null;
    email ? filter.email = { $regex: email, $options: 'i' } : null;
    filter.projectId = projectId;

    return this.userModel.find(filter).exec();
  }



  // Layihəni id-ə görə gətirən funksiyası
  async getProjectById(_id: string): Promise<Project | null> {
    return this.projectModel.findById(_id).populate({ path: 'agents supervisors', select: 'name surname email' }).exec();
  }



  // --------------------------------------- Supervisor functions -------------------------------// 


  // supervisor-lara aid olan agent-lari getirir
  // proyektlerden asagidaki kimi filterleyir
  async getAgentsBySupervisor(supervisorId: string): Promise<User[]> {
    // ilk once supervisor-a aid olan proyektleri tapiriq
    const projects = await this.projectModel.find({ supervisors: supervisorId }).exec();
    const agentIdsSet = new Set<string>();

    // sonra o proyektlere aid olan agentlerin id-lərini toplayiriq
    for (const project of projects) {
      project.agents.forEach(agentId => agentIdsSet.add(agentId.toString()));
    }
    const agentIds = Array.from(agentIdsSet);

    // toplanan agent id-lərinə əsasən user-ları gətiririk
    return this.userModel.find({ _id: { $in: agentIds } }).select("-password").exec();
  }





  // -------------------------------- User functions -------------------------------//

  // Bütün istifadəçiləri gətirən və rolara görə filterləyən funksiyası
  async getAllUsers(query: string, role: string, page = 1,
  ): Promise<{
    data: User[]; total: number; totalPages: number; currentPage: number;
  }> {
    const limit = 10;
    const skip = (page - 1) * limit;
    const filter: any = { isDeleted: false };

    if (role) {
      filter.role = role;
    }

    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { surname: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.userModel.find(filter).select('-password').skip(skip).limit(limit).sort({ createdAt: -1 })
        .populate({ path: 'projectIds', select: ' name createdAt' }).exec(),
      this.userModel.countDocuments(filter),
    ]);

    return {
      data, total, totalPages: Math.ceil(total / limit), currentPage: page,
    };
  }




  // İstifadəçinin məlumatlarını yeniləyən funksiyası
  async updateUserInfo(userId: string, updateData: Partial<CreateUserDto>): Promise<{ message: string, user: User | null }> {
    // əgər password yenilənirsə, onu hash edirik
    if (updateData.password) {
      const hashedPassword = await hashPassword(updateData.password);
      updateData.password = hashedPassword;
    }
    const updatedUser = await this.userModel.findByIdAndUpdate(userId, { $set: updateData }, { new: true });
    return {
      message: "İstifadəçi məlumatları uğurla yeniləndi", user: updatedUser
    }

  }



}