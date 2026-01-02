import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CreateExcelDto } from "src/excel/dto/create-excel.dto";
import { SupervisorService } from "./supervisor.service";

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
  @Post('excel/:_id')
  @HttpCode(HttpStatus.OK)
  async updateExcel(@Param('_id') _id: string, @Body() updateExcelData: Partial<CreateExcelDto>) {
    return await this.supervisorService.updateExcel(_id, updateExcelData);
  }

}
