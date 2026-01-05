import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Company, CompanySchema } from 'src/company/model/company.schema';
import { Project, ProjectSchema } from 'src/project/model/project.schema';
import { Channel } from 'diagnostics_channel';
import { ChannelSchema } from 'src/channel/model/channel.schema';
import { User, UserSchema } from 'src/user/model/user.schema';
import { Column, ColumnSchema } from 'src/excel/model/column.schema';

@Module({
  imports: [MongooseModule.forFeature([
    { name: Company.name, schema: CompanySchema },
    { name: Project.name, schema: ProjectSchema },
    { name: Channel.name, schema: ChannelSchema },
    { name: User.name, schema: UserSchema },
    { name: Column.name, schema: ColumnSchema }
  ])],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule { }
