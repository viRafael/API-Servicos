import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { BookingModule } from 'src/booking/booking.module';
import { MailModule } from 'src/common/mail/mail.module';

@Module({
  imports: [PrismaModule, BookingModule, MailModule],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
