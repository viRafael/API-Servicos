import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import { env } from 'src/utils/env-validator';
import { BookingService } from '../../booking/booking.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class StripeWebhookService {
  private readonly logger = new Logger(StripeWebhookService.name);
  private stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-12-15.clover',
  });

  constructor(
    private readonly bookingService: BookingService,
    @InjectQueue('mail')
    private readonly mailQueue: Queue,
  ) {}

  private async handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    const booking = await this.bookingService.confirmByPaymentIntent(
      paymentIntent.id,
    );

    await this.mailQueue.add('send-payment-confirmed', {
      bookingId: booking.id,
    });
  }

  private handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
    this.logger.warn(`Payment failed: ${paymentIntent.id}`);
  }

  private handleRefund(charge: Stripe.Charge) {
    this.logger.log(`Refund processed: ${charge.id}`);
  }

  async handleEvent(payload: Buffer, signature: string) {
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (err) {
      this.logger.error('Invalid Stripe signature', err);
      return;
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSucceeded(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        this.handlePaymentFailed(event.data.object);
        break;

      case 'charge.refunded':
        this.handleRefund(event.data.object);
        break;

      default:
        this.logger.warn(`Unhandled event: ${event.type}`);
    }
  }
}
