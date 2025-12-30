import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateCompanyDto } from 'src/company/dto/create-company.dto';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateProjectDto } from 'src/project/dto/create-project.dto';
import { CreateChannelDto } from 'src/channel/dto/create-channel.dto';
import { Types } from 'mongoose';

@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) { }

  // ------------------------------- Company Functions ---------------------------//

  @ApiOperation({ summary: 'Yeni şirkət yarat' })
  @ApiBody({
    type: CreateCompanyDto,
    description: 'Yeni şirkət yaratmaq üçün məlumatlar',
  })
  @Post('create-company')
  @HttpCode(HttpStatus.CREATED)
  async createCompany(@Body() createCompanyData: CreateCompanyDto) {
    return await this.adminService.createCompany(createCompanyData);
  }


  @ApiOperation({ summary: 'Şirkəti yenilə' })
  @ApiBody({
    type: CreateCompanyDto,
    description: 'Şirkət yeniləmək üçün məlumatlar',
  })
  @Patch('update-company/:_id')
  @HttpCode(HttpStatus.OK)
  async updateCompany(@Param('_id') _id: string, @Body() updateCompanyData: Partial<CreateCompanyDto>) {
    return await this.adminService.updateCompany(_id, updateCompanyData);
  }


  @ApiOperation({ summary: "Şirkət ləğv edilməsi" })
  @Delete('delete-company/:_id')
  @HttpCode(HttpStatus.OK)
  async deleteCompany(@Param("_id") _id: string) {
    return await this.adminService.deleteCompany(_id)

  }


  @ApiOperation({ summary: "Bütün şirkətləri gətir" })
  @Get('company')
  @HttpCode(HttpStatus.OK)
  async getAllCompanies() {
    return await this.adminService.getAllCompanies()
  }


  @ApiOperation({ summary: 'Şirkətləri İD görə gətir' })
  @Get('company/:_id')
  @HttpCode(HttpStatus.OK)
  async getCompanyById(@Param('_id') _id: string) {
    return await this.adminService.getCompanyById(_id)
  }


  @ApiOperation({ summary: 'Şirkətə məxsus layihənin agent və supervisor-larını gətir' })
  @Get('company-project-members/:companyId')
  @HttpCode(HttpStatus.OK)
  async getCompanyProjectMembers(@Param('companyId') companyId: string) {
    return await this.adminService.getCompanyProjectMembers(companyId);
  }



  // -----------------------------------------Channel Functions ---------------------------//

  @ApiOperation({ summary: 'Yeni kanal yarat' })
  @ApiBody({
    type: CreateChannelDto,
    description: 'Yeni kanal yaratmaq üçün məlumatlar',
  })
  @Post('create-channel')
  @HttpCode(HttpStatus.CREATED)
  async createChannel(@Body() createChannelData: CreateChannelDto) {
    return await this.adminService.createChannel(createChannelData);
  }


  @ApiOperation({ summary: 'Kanalı yenilə' })
  @ApiBody({
    type: CreateChannelDto,
    description: 'Kanal yeniləmək üçün məlumatlar',
  })
  @Patch('update-channel/:_id')
  @HttpCode(HttpStatus.OK)
  async updateChannel(@Param('_id') _id: string, @Body() updateChannelData: Partial<CreateChannelDto>) {
    return await this.adminService.updateChannel(_id, updateChannelData);
  }


  // @ApiOperation({ summary: "Kanal ləğv edilməsi" })
  // @Delete('delete-channel/:_id')
  // @HttpCode(HttpStatus.OK)
  // async deleteChannel(@Param("_id") _id: string) {
  //   return await this.adminService.deleteChannel(_id)
  // }


  @ApiOperation({ summary: "Bütün kanalları gətir" })
  @Get('channel/company/:companyId')
  @HttpCode(HttpStatus.OK)
  async getAllChannels(@Param('companyId') companyId: string) {
    return await this.adminService.getAllChannels(companyId)
  }


  @ApiOperation({ summary: 'Kanalları İD görə gətir' })
  @Get('channel/:_id')
  @HttpCode(HttpStatus.OK)
  async getChannelById(@Param('_id') _id: string) {
    return await this.adminService.getChannelById(_id)
  }



  @ApiOperation({ summary: 'İstifadəçiyə kanal icazəsi ver' })
  @ApiBody({
    type: [String],
    description: 'Kanal ID-lərinin siyahısı',
  })
  @Post('assign-channel-to-user/:userId')
  @HttpCode(HttpStatus.CREATED)
  async assignChannelToUser(
    @Param('userId') userId: string, @Body() channels: Types.ObjectId[]) {
    return await this.adminService.assignChannelToUser(userId, channels);
  }


  // ------------------------------- Project Functions ---------------------------//

  @ApiOperation({ summary: 'Yeni layihə yarat' })
  @ApiBody({
    type: CreateProjectDto,
    description: 'Yeni layihə yaratmaq üçün məlumatlar',
  })
  @Post('create-project')
  @HttpCode(HttpStatus.CREATED)
  async createProject(@Body() createProjectData: CreateProjectDto) {
    return await this.adminService.createProject(createProjectData);
  }


  @ApiOperation({ summary: 'Layihəni yenilə' })
  @ApiBody({
    type: CreateProjectDto,
    description: 'Layihə yeniləmək üçün məlumatlar',
  })
  @Patch('update-project/:_id')
  @HttpCode(HttpStatus.OK)
  async updateProject(@Param('_id') _id: string, @Body() updateProjectData: Partial<CreateProjectDto>) {
    return await this.adminService.updateProject(_id, updateProjectData);
  }


  // @ApiOperation({ summary: "Layihə ləğv edilməsi" })
  // @Delete('delete-project/:_id')
  // @HttpCode(HttpStatus.OK)
  // async deleteProject(@Param("_id") _id: string) {
  //   return await this.adminService.deleteProject(_id)
  // }


  @ApiOperation({ summary: "Bütün layihələri gətir" })
  @Get('project/company/:companyId')
  @HttpCode(HttpStatus.OK)
  async getAllProjects(@Param('companyId') companyId: string) {
    return await this.adminService.getAllProjects(companyId)
  }


  @ApiOperation({ summary: 'Layihələri İD görə gətir' })
  @Get('project/:_id')
  @HttpCode(HttpStatus.OK)
  async getProjectById(@Param('_id') _id: string) {
    return await this.adminService.getProjectById(_id)
  }


}