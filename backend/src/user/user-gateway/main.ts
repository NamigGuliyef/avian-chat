import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { UserGatewayModule } from './user.http.module';

async function bootstrap() {
    const app = await NestFactory.create(UserGatewayModule);
    const config = new DocumentBuilder()
        .setTitle('User Gateway')
        .setVersion('1.0')
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    await app.listen(3002);
}
bootstrap();
