import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Company, CompanySchema } from 'src/company/model/company.schema';
import { Project, ProjectSchema } from 'src/crm/model/project.schema';

@Module({
  imports: [MongooseModule.forFeature([
    { name: Company.name, schema: CompanySchema },
    { name: Project.name, schema: ProjectSchema }
  ])],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule { }
