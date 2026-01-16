import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailQueue {
  constructor(
    @InjectQueue('mail')
    private readonly mailQueue: Queue,
  ) {}

  async sendBookingConfirmation(bookingId: number) {
    await this.mailQueue.add('send-booking-confirmation', {
      bookingId,
    });
  }

  async sendCancellation(bookingId: number, reason?: string) {
    await this.mailQueue.add('send-cancellation', {
      bookingId,
      reason,
    });
  }

  async sendPaymentConfirmed(bookingId: number) {
    await this.mailQueue.add('send-payment-confirmed', {
      bookingId,
    });
  }
}
