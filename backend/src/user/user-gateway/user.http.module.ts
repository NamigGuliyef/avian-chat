import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { UserHttpController } from "./user.http.controller";


@Module({
    imports: [
        ClientsModule.register([
            {
                name: 'USER_SERVICE',
                transport: Transport.TCP,
                options: { host: '127.0.0.1', port: 8005 }
            },
        ])
    ],
    controllers: [UserHttpController],
    providers: [],
})

export class UserGatewayModule { }