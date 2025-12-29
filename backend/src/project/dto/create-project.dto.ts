import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { Company } from 'src/company/model/company.schema';
import { ProjectDirection, ProjectName, ProjectType } from 'src/enum/enum';

export class CreateProjectDto {

    @ApiProperty({ example: '64f3b2e...', required: true, type: Types.ObjectId })
    @IsMongoId()
    @IsNotEmpty()
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


}
