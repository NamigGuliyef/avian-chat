import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';
import { Channel } from 'src/channel/model/channel.schema';
import { Company } from 'src/company/model/company.schema';
import { ProjectDirection, ProjectName, ProjectType } from 'src/enum/enum';

@Schema({ versionKey: false, timestamps: true })

export class Project {

    @Prop({ required: true, ref: 'Company', type: mongoose.Schema.Types.ObjectId })
    companyId: Company;

    @Prop({ type: String, enum: ProjectType, default: ProjectType.inbound, required: false })
    projectType: ProjectType;

    @Prop({ type: String, enum: ProjectDirection, default: ProjectDirection.call, required: false })
    projectDirection: ProjectDirection;

    @Prop({ type: String, enum: ProjectName, default: ProjectName.survey, required: false })
    projectName: ProjectName

    @Prop({ required: false, type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] })
    supervisors: [mongoose.Schema.Types.ObjectId];

    @Prop({ required: false, type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] })
    agents: [mongoose.Schema.Types.ObjectId];

}

export const CompanySchema = SchemaFactory.createForClass(Company);
