import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminModule } from './admin/admin.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { LoggerMiddleware } from './auth/logger.middleware';
import { ChannelModule } from './channel/channel.module';
import { CompanyModule } from './company/company.module';
import { ConversationModule } from './conversation/conversation.module';
import { AuditLog, AuditLogSchema } from './logger/model/logger.schema';
import { MessageModule } from './message/message.module';
import { ProjectModule } from './project/project.module';
import { SupervisorModule } from './supervisor/supervisor.module';
import { VisitorModule } from './visitor/visitor.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/avian-chatbot',
    ),
    MongooseModule.forFeature([{ name: AuditLog.name, schema: AuditLogSchema }]),
    AuthModule,
    AdminModule,
    SupervisorModule,
    CompanyModule,
    ChannelModule,
    VisitorModule,
    ConversationModule,
    MessageModule,
    ProjectModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes(
        { path: '*', method: RequestMethod.POST },
        { path: '*', method: RequestMethod.PATCH },
        { path: '*', method: RequestMethod.DELETE },
      );
  }
}
