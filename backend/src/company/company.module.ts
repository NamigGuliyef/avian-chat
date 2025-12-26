import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Company, CompanySchema } from './model/company.schema';
import { Channel, ChannelSchema } from '../channel/model/channel.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Company.name, schema: CompanySchema }, { name: Channel.name, schema: ChannelSchema }])],
  controllers: [CompanyController],
  providers: [CompanyService],
  exports: [MongooseModule]
})
export class CompanyModule {}
