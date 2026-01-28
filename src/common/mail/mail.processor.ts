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
    switch (job.name) {
      case 'send-booking-confirmation':
        await this.sendBookingConfirmation(job);
        break;

      case 'send-cancellation': {
        await this.sendCancellation(job);
        break;
      }

      case 'send-payment-confirmed':
        await this.sendPaymentConfirmed(job);
        break;

      case 'send-password-reset':
        await this.sendPasswordReset(job);
        break;
    }
  }

  async sendBookingConfirmation(job: Job) {
    const { bookingId } = job.data;
    const booking = await this.bookingService.getFullBooking(bookingId);
    await this.mailService.sendBookingConfirmation(booking);
  }

  async sendCancellation(job: Job) {
    const { bookingId, reason } = job.data;
    const booking = await this.bookingService.getFullBooking(bookingId);
    await this.mailService.sendCancellationNotice(booking, reason);
  }

  async sendPaymentConfirmed(job: Job) {
    const { bookingId } = job.data;
    const booking = await this.bookingService.getFullBooking(bookingId);
    await this.mailService.sendPaymentConfirmed(booking);
  }

  async sendPasswordReset(job: Job) {
    const { email, emailToken } = job.data;
    await this.mailService.sendPasswordReset(email, emailToken);
  }
}
