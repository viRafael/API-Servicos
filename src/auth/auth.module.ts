import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { HashingService } from './hashing/hasing.service';
import { BcryptHashingService } from './hashing/bcrypt.service';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from './config/jwt.config';
import { UsersService } from 'src/users/users.service';

@Module({
  imports: [
    PrismaModule,
    UsersService,
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: HashingService,
      useClass: BcryptHashingService,
    },
    AuthService,
  ],
  exports: [HashingService],
})
export class AuthModule {}
