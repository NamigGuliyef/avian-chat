import {
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Query,
    UseGuards
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { AuthGuard } from '../auth/auth.guard';
import { PartnerService } from './partner.service';

@UseGuards(AuthGuard)
@ApiTags("partner")
@ApiBearerAuth()
@Controller('partner')
export class PartnerController {
    constructor(private readonly partnerService: PartnerService) { }

    @ApiOperation({ summary: "Partnerin layihələrini göstər" })
    @Get('/projects')
    @HttpCode(HttpStatus.OK)
    async getPartnerProjects() {
        return await this.partnerService.getPartnerProjects()
    }

    @ApiOperation({ summary: 'Proyektə aid bütün Excelleri gətir' })
    @Get('excel/:projectId')
    @HttpCode(HttpStatus.OK)
    async getExcels(@Param('projectId') projectId: Types.ObjectId) {
        return await this.partnerService.getExcels(projectId);
    }

    @ApiOperation({ summary: "Excel-ə aid sheetləri gətir" })
    @Get('sheets/:excelId')
    @HttpCode(HttpStatus.OK)
    async getSheetsOfExcel(@Param('excelId') excelId: Types.ObjectId) {
        return await this.partnerService.getSheetsOfExcel(excelId);
    }

    @ApiOperation({ summary: "Sheet-ə aid column-ları gətir" })
    @Get('sheet/:sheetId')
    @HttpCode(HttpStatus.OK)
    async getColumnsOfSheet(@Param('sheetId') sheetId: Types.ObjectId) {
        return await this.partnerService.getColumnsOfSheet(sheetId);
    }

    @ApiOperation({ summary: 'Sheet-ə aid row-ları gətir (pagination)' })
    @Get('sheet/:sheetId/rows')
    @HttpCode(HttpStatus.OK)
    getRows(
        @Param('sheetId') sheetId: Types.ObjectId,
        @Query('page') page = '1',
        @Query('limit') limit = '50',
        @Query('skip') skip = '0',
    ) {
        return this.partnerService.getRows(
            sheetId,
            Number(page),
            Number(limit),
            Number(skip),
        );
    }

    @ApiOperation({ summary: "Partnerin table view məlumatlarını gətir" })
    @Get('/table-view')
    @HttpCode(HttpStatus.OK)
    getPartnerTableView(
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string
    ) {
        return this.partnerService.getPartnerTableView(startDate, endDate)
    }
}
