import { CreateUserDto } from "@app/common/dto/create-user.dto";
import { Body, Controller, HttpCode, HttpStatus, Inject, Post } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
import { firstValueFrom } from "rxjs";

@ApiTags('auth')
@Controller('auth')
export class AuthHttpController {
    constructor(@Inject('AUTH_SERVICE') private readonly authClient: ClientProxy) { }


    // swagger signup endpoint
    @ApiOperation({ summary: 'User Signup' })
    @ApiBody(
        {
            schema: {
                type: 'object',
                properties: {
                    name: { type: 'string', example: 'john_doe' },
                    email: { type: 'string', example: 'john@example.com' },
                    password: { type: 'string', example: 'password123' },
                    role: { type: 'string', example: 'agent' },
                    companyId: { type: 'string', example: 'company_id' },
                    channelIds: { type: 'array', items: { type: 'string' }, example: ['channel1'] },
                    avatar: { type: 'string', example: '/path/to/avatar.jpg' },
                    isOnline: { type: 'boolean', example: false },
                    chatbotEnabled: { type: 'boolean', example: false }
                }
            }
        }
    )

    @Post('signup')
    @HttpCode(HttpStatus.CREATED)

    async signup(@Body() createUserDto: CreateUserDto) {
        return await firstValueFrom(this.authClient.send('auth.create_user', createUserDto));
    }
}