import { Controller } from '@nestjs/common';
import { UserService } from './user.service';
import { MessagePattern } from '@nestjs/microservices';
import { CreateUserDto } from '../../libs/common/src/dto/create-user.dto';

@Controller()
export class UserController {

    constructor(private readonly userService: UserService) { }

    // istifadəçi yaradılması funksiyası

    @MessagePattern('create_user')
    async createUser(createUserDto: CreateUserDto) {
        return this.userService.create(createUserDto);
    }

}