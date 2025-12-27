import { NestFactory } from "@nestjs/core";
import { UserMicroServiceModule } from "./user.ms.module";
import { Transport } from "@nestjs/microservices/enums/transport.enum";

async function bootstrap() {
    const app = await NestFactory.createMicroservice(UserMicroServiceModule, {
        transport: Transport.TCP,
        options: {
            host: '127.0.0.1',
            port: 8005
        }
    });
    await app.listen();
}
bootstrap();