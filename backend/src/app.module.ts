import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth-service/auth.module';
import { UserModule } from './user/user.module';
import { AdminModule } from './admin/admin.module';
import { SupervisorModule } from './supervisor/supervisor.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [ConfigModule.forRoot(
    { isGlobal: true }
  ),
  MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/avian-chatbot'),
    AuthModule, UserModule, AdminModule, SupervisorModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
