import { Module } from '@nestjs/common';
import { BookingModule } from 'src/booking/booking.module';
import { MailModule } from 'src/common/mail/mail.module';
import { PaymentModule } from 'src/payment/payment.module';
import { StripeWebhookController } from './stripe/webhook-stripe.controller';
import { StripeWebhookService } from './stripe/webhook-stripe.service';
import { WebsocketModule } from 'src/websocket/websocket.module';
import { PrismaModule } from 'src/common/prisma/prisma.module';

@Module({
  imports: [
    PaymentModule,
    BookingModule,
    MailModule,
    WebsocketModule,
    PrismaModule,
  ],
  controllers: [StripeWebhookController],
  providers: [StripeWebhookService],
})
export class WebhooksModule {}
