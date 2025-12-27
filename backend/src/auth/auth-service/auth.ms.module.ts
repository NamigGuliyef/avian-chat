import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthMicroserviceController } from './auth.ms.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'USER_SERVICE',
        transport: Transport.TCP,
        options: {
          host: '127.0.0.1',
          port: 8005,
        },
      },
    ]),
  ],
  controllers: [AuthMicroserviceController],
  providers: [AuthService],
})
export class AuthMicroServiceModule {}
