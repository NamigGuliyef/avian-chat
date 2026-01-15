import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

 app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    exceptionFactory: (errors) => {
      console.log('🔥 VALIDATION ERRORS:', errors);
      return new BadRequestException(errors);
    },
  }),
);

  // swagger setup
  const config = new DocumentBuilder()
    .setTitle('Avian Chatbot API')
    .setDescription('The Avian Chatbot API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);




  console.log(`Server is running on port ${process.env.PORT || 8004}`);
  await app.listen(process.env.PORT! || 8004);
}
bootstrap();
