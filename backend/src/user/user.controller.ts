import { Controller, Get, HttpCode, HttpStatus, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@ApiTags('user')
@ApiBearerAuth()

@Controller('user')
export class UserController {

    constructor(private readonly userService: UserService) { }

    // Agent aid olan proyketlerin excellerini gətirən endpoint olacaq burada
    @ApiOperation({ summary: 'İstifadəçiyə aid Excelleri gətir' })
    @Get('/excels')
    @HttpCode(HttpStatus.OK)
    async getUserExcels() {
        return await this.userService.getUserExcels();
    }


    @ApiOperation({ summary: 'Excel ID-sinə əsasən Sheet-ləri gətir' })
    @Get('/sheets/excel/:excelId')
    @HttpCode(HttpStatus.OK)
    async getSheetsByExcelId(@Param('excelId') excelId: string) {
        return await this.userService.getSheetsByExcelId(excelId);
    }


    // Agent aid olan proyketlerin sheet-lərini gətirən endpoint olacaq burada
    @ApiOperation({ summary: 'İstifadəçiyə aid Sheet-ləri gətir' })
    @Get('/sheets')
    @HttpCode(HttpStatus.OK)
    async getUserSheets() {
        return await this.userService.getUserSheets();
    }


    @ApiOperation({ summary: 'Sheet ID-sinə əsasən Column-ları gətir' })
    @Get('/columns/sheet/:sheetId')
    @HttpCode(HttpStatus.OK)
    async getColumnsBySheetId(
        @Param('sheetId') sheetId: string,
        @Query('page') page = '1',
        @Query('limit') limit = '50',
        @Query('search') search = '',
        @Query('skip') skip = '0'
    ) {
        const result = await this.userService.getColumnsBySheetId(
            sheetId,
            Number(page),
            Number(limit),
            search,
            Number(skip)
        );
        return { data: result };
    }



    // Agent aid olan proyketlerin column-larını gətirən endpoint olacaq burada
    @ApiOperation({ summary: 'İstifadəçiyə aid Column-ları gətir' })
    @Get('/columns')
    @HttpCode(HttpStatus.OK)
    async getUserColumns() {
        return await this.userService.getUserColumns();
    }

    @ApiOperation({ summary: 'Xatırlatmaları gətir' })
    @Get('/reminders')
    @HttpCode(HttpStatus.OK)
    async getReminders() {
        return await this.userService.getReminders();
    }
}


