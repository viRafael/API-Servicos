import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { MailService } from './mail.service';
import { BookingService } from 'src/booking/booking.service';

@Processor('mail')
export class MailProcessor extends WorkerHost {
  constructor(
    private readonly mailService: MailService,
    private readonly bookingService: BookingService,
  ) {
    super();
  }

  async process(job: Job) {
    const { bookingId, reason } = job.data;

    const booking = await this.bookingService.getFullBooking(bookingId);

    switch (job.name) {
      case 'send-booking-confirmation':
        await this.mailService.sendBookingConfirmation(booking);
        break;

      case 'send-cancellation': {
        await this.mailService.sendCancellationNotice(booking, reason);
        break;
      }

      case 'send-payment-confirmed':
        await this.mailService.sendPaymentConfirmed(booking);
        break;
    }
  }
}
