import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { Company } from '../company/model/company.schema';
import { ProjectDirection, ProjectName, ProjectType } from 'src/enum/enum';

export class CreateProjectDto {

    @ApiProperty()
    @IsOptional()
    @IsString()
    name: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    description: string;

    @ApiProperty({ example: '64f3b2e...', required: true, type: Types.ObjectId })
    @IsMongoId()
    @IsOptional()
    companyId: Company;

    @ApiProperty({ example: 'inbound', required: false })
    @IsString()
    @IsOptional()
    projectType: ProjectType;

    @ApiProperty({ example: 'call', required: false })
    @IsString()
    @IsOptional()
    projectDirection: ProjectDirection;

    @ApiProperty({ example: 'survey', required: false })
    @IsString()
    @IsOptional()
    projectName: ProjectName;

    @ApiProperty({ type: [String], description: 'Supervisor user ids', required: false, example: ['64f3b2e...'] })
    @IsArray()
    @IsOptional()
    supervisors: string[];

    @ApiProperty({ type: [String], description: 'Agent user ids', required: false, example: ['64f3b2e...'] })
    @IsArray()
    @IsOptional()
    agents: string[];

    @ApiProperty({ example: false, required: false })
    @IsOptional()
    isDeleted: boolean;

    @ApiProperty({ type: [String], description: 'Excel ids', required: false, example: ['64f3b2e...'] })
    @IsArray()
    @IsOptional()
    excelIds: Types.ObjectId[];

    @ApiProperty({ type: [String], description: 'Sheet ids', required: false, example: ['64f3b2e...'] })
    @IsArray()
    @IsOptional()
    sheetIds: Types.ObjectId[];

    @ApiProperty({ type: [String], description: 'Column ids', required: false, example: ['64f3b2e...'] })
    @IsArray()
    @IsOptional()
    columnIds: Types.ObjectId[];

}
