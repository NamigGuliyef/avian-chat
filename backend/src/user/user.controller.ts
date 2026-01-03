import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('user')
@Controller('user')
export class UserController {

    constructor(private readonly userService: UserService) { }

    // Agent aid olan proyketlerin excellerini gətirən endpoint olacaq burada
    @ApiOperation({ summary: 'İstifadəçiyə aid Excelleri gətir' })
    @Get('/excels/:userId')
    @HttpCode(HttpStatus.OK)
    async getUserExcels(@Param('userId') userId: string) {
        return await this.userService.getUserExcels(userId);
    }


    // Agent aid olan proyketlerin sheet-lərini gətirən endpoint olacaq burada
    @ApiOperation({ summary: 'İstifadəçiyə aid Sheet-ləri gətir' })
    @Get('/sheets/:userId')
    @HttpCode(HttpStatus.OK)
    async getUserSheets(@Param('userId') userId: string) {
        return await this.userService.getUserSheets(userId);
    }


    // Agent aid olan proyketlerin column-larını gətirən endpoint olacaq burada
    @ApiOperation({ summary: 'İstifadəçiyə aid Column-ları gətir' })
    @Get('/columns/:userId')
    @HttpCode(HttpStatus.OK)
    async getUserColumns(@Param('userId') userId: string) {
        return await this.userService.getUserColumns(userId);
    }
}


