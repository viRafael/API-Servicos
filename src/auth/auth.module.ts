import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { HashingService } from './hashing/hasing.service';
import { BcryptHashingService } from './hashing/bcrypt.service';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from './config/jwt.config';
import { UsersModule } from 'src/users/users.module';
import { MailModule } from 'src/common/mail/mail.module';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => UsersModule),
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    MailModule,
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: HashingService,
      useClass: BcryptHashingService,
    },
    AuthService,
  ],
  exports: [HashingService, JwtModule, ConfigModule],
})
export class AuthModule {}
