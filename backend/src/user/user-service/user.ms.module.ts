import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../model/user.schema';
import { UserMicroServiceController } from './user.ms.controller';
import { UserMicroService } from './user.ms.service';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  controllers: [UserMicroServiceController],
  providers: [UserMicroService],
})
export class UserMicroServiceModule { }
