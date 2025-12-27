import { CreateUserDto } from '@app/common/dto/create-user.dto';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { hashPassword } from 'src/helper/hashpass';

@Injectable()
export class AuthService {

    constructor(@Inject('USER_SERVICE') private readonly userClient: ClientProxy) { }



    async createUser(createUserDto: CreateUserDto): Promise<{ user: any, message: string }> {

        // hash password
        if (!createUserDto.password) {
            throw new NotFoundException('Parol daxil edilməyib');
        }
        const hashedPassword = await hashPassword(createUserDto.password);

        // user microservice-ə sorğu göndərilir
        const user = await lastValueFrom(
            this.userClient.send('create_user', {
                ...createUserDto,
                password: hashedPassword
            })
        );
        return { user, message: 'İstifadəçi uğurla yaradıldı' };
    }
}