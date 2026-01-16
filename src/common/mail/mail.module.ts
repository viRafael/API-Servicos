import { Module, forwardRef } from '@nestjs/common';
import { MailService } from './mail.service';
import { BullModule } from '@nestjs/bullmq';
import { MailProcessor } from './mail.processor';
import { MailQueue } from './mail.queue';
import { BookingModule } from 'src/booking/booking.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'mail',
    }),
    forwardRef(() => BookingModule),
  ],
  providers: [MailService, MailProcessor, MailQueue],
  exports: [MailQueue, MailService],
})
export class MailModule {}
