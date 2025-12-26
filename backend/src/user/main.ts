import { NestFactory } from "@nestjs/core";
import { UserModule } from "./user.module";
import { Transport } from "@nestjs/microservices/enums/transport.enum";

async function bootstrap() {
    const app = await NestFactory.createMicroservice(UserModule, {
        transport: Transport.TCP,
        options: {
            host: 'localhost',
            port: 8005
        }
    });
    await app.listen();
}
bootstrap();