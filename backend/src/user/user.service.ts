import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from '../../libs/common/src/dto/create-user.dto';
import { User } from './model/user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) { }

  async create(createUserDto: CreateUserDto) {
    // user-in bazada yoxlanır
    const userexists = await this.userModel.findOne({ email: createUserDto.email });
    if (userexists) {
      throw new RpcException('İstifadəçi artıq mövcuddur');
    }

    // // Şifrə hash-lənir
    // const hashedPassword = await hashPassword(createUserDto.password);

    // Yeni istifadəçi yaradılır
    const newuser = await this.userModel.create({
      ...createUserDto
    });
    return newuser;
  }
}
