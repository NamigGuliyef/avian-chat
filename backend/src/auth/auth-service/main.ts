import { NestFactory } from "@nestjs/core";
import { AuthMicroServiceModule } from "./auth.ms.module";
import { Transport } from "@nestjs/microservices";

async function bootstrap() {
    const app = await NestFactory.createMicroservice(AuthMicroServiceModule, {
        transport: Transport.TCP,
        options: {
            host: '127.0.0.1',
            port: 8004
        }
    });
    await app.listen();
}
bootstrap();
