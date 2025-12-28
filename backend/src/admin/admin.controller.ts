import { Body, Controller, Delete, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateCompanyDto } from 'src/company/dto/create-company.dto';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateProjectDto } from 'src/project/dto/create-project.dto';

@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) { }


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



  @ApiOperation({ summary: 'Yeni layihə yarat' })
  @ApiBody({
    type: CreateProjectDto,
    description: 'Yeni layihə yaratmaq üçün məlumatlar',
  })
  @Post('create-project')
  async createProject(@Body() createProjectData: CreateProjectDto) {
    return await this.adminService.createProject(createProjectData);
  }

}