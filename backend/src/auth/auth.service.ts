import { CreateUserDto } from '../auth/dto/create-user.dto';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { hashPassword, comparePassword } from '../helper/hashpass';
import { User } from '../user/model/user.schema';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

  constructor(@InjectModel(User.name) private readonly userModel: Model<User>, private readonly jwtService: JwtService) { }


  // User registration logic
  async registerUser(createUserData: CreateUserDto): Promise<User> {
    const { email, password } = createUserData;
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new Error('İstifadeçi artıq mövcuddur');
    }

    // Yeni istifadəçi yaradılması
    // Şifrənin hash edilməsi və digər lazımi əməliyyatlar

    if (!password) {
      throw new Error('Şifrə tələb olunur');
    }

    const hashedPassword = await hashPassword(password);
    const newUser = await this.userModel.create({
      ...createUserData, password: hashedPassword
    });
    return newUser;
  }


  // User login logic

  async loginUser(loginData: LoginUserDto): Promise<{ token: string, user: any }> {
    const { email, password } = loginData;
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new NotFoundException('İstifadeçi tapılmadı');
    }
    if (!user.isActive) {
      throw new BadRequestException('İstifadəçi deaktiv edilib!');
    }

    // Şifrənin yoxlanılması və digər lazımi əməliyyatlar
    if (!password) {
      throw new BadRequestException('Şifrə tələb olunur');
    }

    const comparePass = await comparePassword(password, user.password);
    if (!comparePass) {
      throw new BadRequestException('Yanlış şifrə');
    }
    const token = this.jwtService.sign({ id: user._id, name: user.name, surname: user.surname, email: user.email, role: user.role });
    const notPasswordUser = {
      _id: user._id,
      name: user.name,
      surname: user.surname,
      email: user.email,
      role: user.role,
      onlineStatus: user.onlineStatus,
      chatbotEnabled: user.chatbotEnabled
    }
    return { token, user: notPasswordUser };
  }
}
