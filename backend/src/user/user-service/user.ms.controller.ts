import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { CreateUserDto } from '../../../libs/common/src/dto/create-user.dto';
import { UserMicroService } from './user.ms.service';

@Controller()
export class UserMicroServiceController {

    constructor(private readonly userService: UserMicroService) { }

    // istifadəçi yaradılması funksiyası

    @MessagePattern('create_user')
    async createUser(createUserDto: CreateUserDto) {
        return this.userService.create(createUserDto);
    }

}