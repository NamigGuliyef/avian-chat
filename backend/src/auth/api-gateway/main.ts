import { NestFactory } from '@nestjs/core';
import { AuthGatewayModule } from './auth.http.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
    const app = await NestFactory.create(AuthGatewayModule);
    const config = new DocumentBuilder()
        .setTitle('Auth Gateway')
        .setVersion('1.0')
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    await app.listen(3001);
}
bootstrap();
