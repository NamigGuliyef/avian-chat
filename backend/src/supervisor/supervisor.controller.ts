import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CreateExcelDto } from "src/excel/dto/create-excel.dto";
import { SupervisorService } from "./supervisor.service";

@ApiTags("supervisor")
@Controller('supervisor')
export class SupervisorController {
  constructor(private readonly supervisorService: SupervisorService) { }

  
  // Yeni Excel yaratmaq üçün endpoint
  @ApiOperation({ summary: 'Proyket üçün yeni Excel yaradın' })
  @ApiBody(
    { type: CreateExcelDto }
  )
  @Post('excel')
  createExcel(@Body() createExcelData: CreateExcelDto) {
    return this.supervisorService.createExcel(createExcelData);
  }

  
  @ApiOperation({ summary: 'Proyektə aid bütün Excelleri gətir' })
  @Get('excel/:projectId')
  getExcels(@Param('projectId') projectId: string) {
    return this.supervisorService.getExcels(projectId);
  }

 
}
