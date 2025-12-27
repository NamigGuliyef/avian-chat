import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class AuthMicroserviceController  {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern('auth.create_user')
  async createUser(createUserDto: any) {
    return await this.authService.createUser(createUserDto);
  }
}
