import { CreateUserDto } from '../auth/dto/create-user.dto';
import {
  Body, Controller, HttpCode, HttpStatus, Post
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';


@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  // swagger signup endpoint
  @ApiOperation({ summary: 'İstifadəçi qeydiyyatı' })
  @ApiBody({
    type: CreateUserDto,
    description: 'İstifadəçi qeydiyyatı üçün məlumatlar',
  })
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() createUserDto: CreateUserDto) {
    return await this.authService.registerUser(createUserDto);
  }

  
  // swagger login endpoint
  @ApiOperation({ summary: 'İstifadəçi girişi' })
  @ApiBody({
    type: LoginUserDto,
    description: 'İstifadəçi girişi üçün məlumatlar',
  })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginUserDto: LoginUserDto) {
    return await this.authService.loginUser(loginUserDto);
  }
}
