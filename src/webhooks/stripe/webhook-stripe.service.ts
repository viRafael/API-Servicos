import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import { env } from 'src/utils/env-validator';
import { BookingService } from '../../booking/booking.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { BookingGateway } from 'src/websocket/gateways/booking.gateway';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { BookingStatus } from '@prisma/client';

@Injectable()
export class StripeWebhookService {
  private readonly logger = new Logger(StripeWebhookService.name);
  private stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-12-15.clover',
  });

  constructor(
    private readonly bookingService: BookingService,
    private readonly bookingGateway: BookingGateway,
    private readonly prisma: PrismaService,
    @InjectQueue('mail')
    private readonly mailQueue: Queue,
  ) {}

  private async handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    const booking = await this.bookingService.confirmByPaymentIntent(
      paymentIntent.id,
    );

    // A notificação de sucesso já é enviada de dentro do confirmByPaymentIntent no BookingService

    await this.mailQueue.add('send-payment-confirmed', {
      bookingId: booking.id,
    });
  }

  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
    this.logger.warn(
      `Payment failed for intent ${paymentIntent.id}: ${paymentIntent.last_payment_error?.message}`,
    );

    const booking = await this.prisma.booking.findUnique({
      where: { paymentIntentId: paymentIntent.id },
      include: { service: true, client: true, provider: true },
    });

    if (booking) {
      await this.prisma.booking.update({
        where: { id: booking.id },
        data: { status: BookingStatus.PENDING_PAYMENT },
      });

      this.bookingGateway.notifyPaymentFailed(
        booking.clientId,
        booking,
        paymentIntent.last_payment_error?.message,
      );
    }
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
        await this.handlePaymentFailed(event.data.object);
        break;

      case 'charge.refunded':
        this.handleRefund(event.data.object);
        break;

      default:
        this.logger.warn(`Unhandled event: ${event.type}`);
    }
  }
}
