import { CreateUserDto } from "@app/common/dto/create-user.dto";
import { Body, Controller, HttpCode, HttpStatus, Inject, Post } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";

@Controller('auth')
export class AuthController {
    constructor( @Inject('AUTH_SERVICE') private readonly authClient:ClientProxy) { }

    @Post('signup')
    @HttpCode(HttpStatus.CREATED)
    
    async signup(@Body() createUserDto: CreateUserDto) {
        return await this.authClient.send('auth.create_user', createUserDto);
    }

}