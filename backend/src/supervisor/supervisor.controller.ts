import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateExcelDto } from "src/excel/dto/create-excel.dto";
import { CreateSheetColumnDto, CreateSheetDto } from "src/excel/dto/create-sheet.dto";
import { UpdateExcelDto } from "src/excel/dto/update-excel.dto";
import { UpdateSheetColumnDto, UpdateSheetDto } from "src/excel/dto/update-sheet.dto";
import { SupervisorService } from './supervisor.service';

@ApiTags("supervisor")
@Controller('supervisor')
export class SupervisorController {
  constructor(private readonly supervisorService: SupervisorService) { }


  // -------------------------- Project function ---------------------------------//

  @ApiOperation({ summary: "Supervayzerin layihələrini göstər" })
  @Get('/projects/:supervisorId')
  @HttpCode(HttpStatus.OK)
  async getSupervisorProjects(@Param("supervisorId") supervisorId: string) {
    return await this.supervisorService.getSupervisorProjects(supervisorId)
  }


  @ApiOperation({ summary: "Proyektə aid agentləri gətir" })
  @Get('/project/:projectId')
  @HttpCode(HttpStatus.OK)
  async getProjectAgents(@Param("projectId") projectId: string) {
    return await this.supervisorService.getProjectAgents(projectId);
  }



  // Yeni Excel yaratmaq üçün endpoint
  @ApiOperation({ summary: 'Proyket üçün yeni Excel yaradın' })
  @ApiBody(
    { type: CreateExcelDto }
  )
  @Post('excel')
  @HttpCode(HttpStatus.CREATED)
  createExcel(@Body() createExcelData: CreateExcelDto) {
    return this.supervisorService.createExcel(createExcelData);
  }


  @ApiOperation({ summary: 'Proyektə aid bütün Excelleri gətir' })
  @Get('excel/:projectId')
  @HttpCode(HttpStatus.OK)
  async getExcels(@Param('projectId') projectId: string) {
    return await this.supervisorService.getExcels(projectId);
  }



  @ApiOperation({ summary: 'Excel yenilə' })
  @ApiBody(
    { type: CreateExcelDto }
  )
  @Patch('excel/:_id')
  @HttpCode(HttpStatus.OK)
  async updateExcel(@Param('_id') _id: string, @Body() updateExcelData: UpdateExcelDto) {
    return await this.supervisorService.updateExcel(_id, updateExcelData);
  }


  @ApiOperation({ summary: " Excelə sheet əlavə et" })
  @ApiBody(
    { type: CreateSheetDto }
  )
  @Post('sheet')
  @HttpCode(HttpStatus.CREATED)
  async addSheetToExcel(@Body() createSheetData: CreateSheetDto) {
    return await this.supervisorService.addSheetToExcel(createSheetData);
  }



  @ApiOperation({ summary: " Excelə aid sheet yenilə" })
  @ApiBody(
    { type: UpdateSheetDto }
  )
  @Patch('sheet/:_id')
  @HttpCode(HttpStatus.OK)
  async updateSheetInExcel(@Param('_id') _id: string, @Body() updateSheetData: UpdateSheetDto) {
    return await this.supervisorService.updateSheetInExcel(_id, updateSheetData);
  }


  @ApiOperation({ summary: "Excel-ə aid sheetləri gətir" })
  @Get('sheets/:excelId')
  @HttpCode(HttpStatus.OK)
  async getSheetsOfExcel(@Param('excelId') excelId: string) {
    return await this.supervisorService.getSheetsOfExcel(excelId);
  }


  @ApiOperation({ summary: " Sheet-ə column əlavə et" })
  // Todo: Nam, bura bax z.o, comment-i aca bilmedim. 
  @ApiBody(
    { type: CreateSheetColumnDto }
  )
  @Post('sheet/:sheetId/column/:columnId')
  @HttpCode(HttpStatus.CREATED)
  async addColumnToSheet(
    @Param('sheetId') sheetId: string,
    @Body() createColumnData: CreateSheetColumnDto
  ) {
    return await this.supervisorService.addColumnToSheet(sheetId, createColumnData);
  }


  @ApiOperation({ summary: " Sheet-ə aid column-ları yenilə" })
  @Patch('sheet/:sheetId/column/:columnId')
  @HttpCode(HttpStatus.OK)
  async updateColumnInSheet(
    @Param('sheetId') sheetId: string,
    @Param('columnId') columnId: string,
    @Body() updateColumnData: UpdateSheetColumnDto
  ) {
    return await this.supervisorService.updateColumnInSheet(sheetId, columnId, updateColumnData);
  }


  @ApiOperation({ summary: " Sheet-ə aid column-ları gətir" })
  @Get('sheet/:sheetId')
  @HttpCode(HttpStatus.OK)
  async getColumnsOfSheet(@Param('sheetId') sheetId: string) {
    return await this.supervisorService.getColumnsOfSheet(sheetId);
  }

  // row

  @ApiOperation({ summary: 'Sheet-ə yeni row əlavə et' })
  @Post('sheet/:sheetId/rows')
  @HttpCode(HttpStatus.CREATED)
  addRow(
    @Param('sheetId') sheetId: string,
    @Body() data: Record<string, any>,
  ) {
    return this.supervisorService.addRow(sheetId, data);
  }

  // -----------------------------------------------------

  @ApiOperation({ summary: 'Excel-dən row-ları import et' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  @Post('sheet/:sheetId/rows/import')
  @HttpCode(HttpStatus.CREATED)
  importFromExcel(
    @Param('sheetId') sheetId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.supervisorService.importFromExcel(sheetId, file);
  }

  // -----------------------------------------------------

  @ApiOperation({ summary: 'Sheet-ə aid row-ları gətir (pagination)' })
  @Get('sheet/:sheetId/rows')
  @HttpCode(HttpStatus.OK)
  getRows(
    @Param('sheetId') sheetId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '50',
  ) {
    return this.supervisorService.getRows(
      sheetId,
      Number(page),
      Number(limit),
    );
  }

  // -----------------------------------------------------

  @ApiOperation({ summary: 'Row-u tam update et' })
  @Patch('sheet/:sheetId/rows/:rowNumber')
  @HttpCode(HttpStatus.OK)
  updateRow(
    @Param('sheetId') sheetId: string,
    @Param('rowNumber') rowNumber: string,
    @Body() data: Record<string, any>,
  ) {
    return this.supervisorService.updateRow(
      sheetId,
      Number(rowNumber),
      data,
    );
  }

  // -----------------------------------------------------

  @ApiOperation({ summary: 'Row-un tək bir cell-ni update et' })
  @Patch('sheet/:sheetId/rows/:rowNumber/cell')
  @HttpCode(HttpStatus.OK)
  updateCell(
    @Param('sheetId') sheetId: string,
    @Param('rowNumber') rowNumber: string,
    @Body()
    body: {
      key: string;
      value: any;
    },
  ) {
    return this.supervisorService.updateCell(
      sheetId,
      Number(rowNumber),
      body.key,
      body.value,
    );
  }

  // -----------------------------------------------------

  @ApiOperation({ summary: 'Row sil (rowNumber reindex edilir)' })
  @Delete('sheet/:sheetId/rows/:rowNumber')
  @HttpCode(HttpStatus.OK)
  deleteRow(
    @Param('sheetId') sheetId: string,
    @Param('rowNumber') rowNumber: string,
  ) {
    return this.supervisorService.deleteRow(
      sheetId,
      Number(rowNumber),
    );
  }

}
