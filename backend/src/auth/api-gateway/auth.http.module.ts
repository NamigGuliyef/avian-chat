import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { AuthHttpController } from "./auth.http.controller";

@Module({
    imports: [
        ClientsModule.register([
            {
                name: 'AUTH_SERVICE',
                transport: Transport.TCP,
                options: { host: '127.0.0.1', port: 8004 }
            },
        ])
    ],
    controllers: [AuthHttpController],
    providers: [],
})

export class AuthGatewayModule { }