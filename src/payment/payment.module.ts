import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { MailModule } from 'src/common/mail/mail.module';
import { StripeProvider } from './stripe.provider';

@Module({
  imports: [PrismaModule, MailModule],
  controllers: [PaymentController],
  providers: [PaymentService, StripeProvider],
  exports: [PaymentService, StripeProvider],
})
export class PaymentModule {}
