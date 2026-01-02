import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';
import { ProjectDirection, ProjectName, ProjectType } from 'src/enum/enum';

@Schema({ versionKey: false, timestamps: true })

export class Project {

    @Prop({ required: false })
    name: string;

    @Prop({ required: false })
    description: string;

    @Prop({ required: false, ref: 'Company', type: mongoose.Schema.Types.ObjectId })
    companyId: Types.ObjectId;

    @Prop({ type: String, enum: ProjectType, default: ProjectType.inbound, required: false })
    projectType: ProjectType;

    @Prop({ type: String, enum: ProjectDirection, default: ProjectDirection.call, required: false })
    projectDirection: ProjectDirection;

    @Prop({ type: String, enum: ProjectName, default: ProjectName.survey, required: false })
    projectName: ProjectName

    @Prop({ required: false, type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] })
    supervisors: Types.ObjectId[]

    @Prop({ required: false, type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] })
    agents: Types.ObjectId[]

    @Prop({ default: false })
    isDeleted: boolean;

    @Prop({ required: false, type: [mongoose.Schema.Types.ObjectId], ref: 'Excel', default: [] })
    excelIds: Types.ObjectId[];

    @Prop({ required: false, type: [mongoose.Schema.Types.ObjectId], ref: 'Sheet', default: [] })
    sheetIds: Types.ObjectId[];

    @Prop({ required: false, type: [mongoose.Schema.Types.ObjectId], ref: 'Column', default: [] })
    columnIds: Types.ObjectId[];
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
