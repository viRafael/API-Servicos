import { Module, forwardRef } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { MailModule } from 'src/common/mail/mail.module';
import { StripeProvider } from './stripe.provider';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from 'src/auth/config/jwt.config';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => MailModule),
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),
  ],
  controllers: [PaymentController],
  providers: [PaymentService, StripeProvider],
  exports: [PaymentService, StripeProvider],
})
export class PaymentModule {}
