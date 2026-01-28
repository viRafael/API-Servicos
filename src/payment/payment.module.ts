import { Module, forwardRef } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { MailModule } from 'src/common/mail/mail.module';
import { StripeProvider } from './stripe.provider';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from 'src/auth/config/jwt.config';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => MailModule),
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync({
      imports: [ConfigModule.forFeature(jwtConfig)],
      useFactory: async (config: ConfigService) => {
        return {
          secret: config.get('jwt.secret'),
          audience: config.get('jwt.audience'),
          issuer: config.get('jwt.issuer'),
          ttl: config.get('jwt.ttl'),
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [PaymentController],
  providers: [PaymentService, StripeProvider],
  exports: [PaymentService, StripeProvider],
})
export class PaymentModule {}
