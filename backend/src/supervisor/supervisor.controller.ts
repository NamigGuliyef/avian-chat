import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CreateExcelDto } from "src/excel/dto/create-excel.dto";
import { SupervisorService } from "./supervisor.service";
import { CreateSheetDto } from "src/excel/dto/create-sheet.dto";
import { UpdateExcelDto } from "src/excel/dto/update-excel.dto";
import { Types } from "mongoose";
import { UpdateSheetDto } from "src/excel/dto/update-sheet.dto";
import { SheetColumn } from "src/excel/model/sheet.schema";

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
  // @ApiBody(
  //   { type: SheetColumn }
  // )
  @Post('sheet/:sheetId/column/:columnId')
  @HttpCode(HttpStatus.CREATED)
  async addColumnToSheet(
    @Param('sheetId') sheetId: string,
    @Body() createColumnData: SheetColumn
  ) {
    return await this.supervisorService.addColumnToSheet(sheetId, createColumnData);
  }


  @ApiOperation({ summary: " Sheet-ə aid column-ları yenilə" })
  // @ApiBody(
  //   { type: UpdateColumnDto }
  // )
  @Patch('sheet/:sheetId/column/:columnId')
  @HttpCode(HttpStatus.OK)
  async updateColumnInSheet(
    @Param('sheetId') sheetId: string,
    @Param('columnId') columnId: string,
    @Body() updateColumnData: SheetColumn
  ) {
    return await this.supervisorService.updateColumnInSheet(sheetId, columnId, updateColumnData);
  }


  @ApiOperation({ summary: " Sheet-ə aid column-ları gətir" })
  @Get('sheet/:sheetId')
  @HttpCode(HttpStatus.OK)
  async getColumnsOfSheet(@Param('sheetId') sheetId: string) {
    return await this.supervisorService.getColumnsOfSheet(sheetId);
  }

}
