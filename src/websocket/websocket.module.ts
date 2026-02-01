import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { BookingGateway } from './gateways/booking.gateway';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { WsJwtGuard } from './guards/ws-jwt.guard';
import { ConfigModule } from '@nestjs/config';
import jwtConfig from 'src/auth/config/jwt.config';

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),
  ],
  providers: [BookingGateway, WsJwtGuard],
  exports: [BookingGateway],
})
export class WebsocketModule {}
