import { NestFactory } from "@nestjs/core";
import { AuthModule } from "./auth.module";
import { Transport } from "@nestjs/microservices";

async function bootstrap() {
    const app = await NestFactory.createMicroservice(AuthModule, {
        transport: Transport.TCP,
        options: {
            host: 'localhost',
            port: 8004
        }
    });
    await app.listen();
}
bootstrap();
