import { Inject, Injectable } from '@nestjs/common';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import Stripe from 'stripe';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';

@Injectable()
export class PaymentService {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject('STRIPE_CLIENT')
    private readonly stripe: Stripe,
  ) {}

  async createPaymentIntent(
    clientId: number,
    createPaymentIntentDto: CreatePaymentIntentDto,
  ) {
    const booking = await this.prismaService.booking.findUnique({
      where: { id: createPaymentIntentDto.bookingId },
      include: { service: true },
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.clientId !== clientId) {
      throw new Error('You are not the owner of this booking');
    }

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: booking.service.price * 100, // centavos
      currency: 'brl',
      metadata: {
        bookingId: booking.id,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    await this.prismaService.payment.create({
      data: {
        bookingId: booking.id,
        userId: clientId,
        amount: booking.service.price,
        paymentIntentId: paymentIntent.id,
      },
    });

    await this.prismaService.booking.update({
      where: { id: booking.id },
      data: { paymentIntentId: paymentIntent.id },
    });

    return {
      clientSecret: paymentIntent.client_secret,
    };
  }

  findAll() {
    return this.prismaService.payment.findMany();
  }

  async findOne(userId: number, id: number) {
    const payment = await this.prismaService.payment.findUnique({
      where: {
        id,
      },
      include: {
        booking: {
          include: {
            provider: true,
          },
        },
      },
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.userId !== userId && payment.booking.provider.id !== userId) {
      throw new Error('You are not allowed to view this payment');
    }

    return payment;
  }

  update(id: number, updatePaymentDto: UpdatePaymentDto) {
    return this.prismaService.payment.update({
      where: {
        id,
      },
      data: {
        ...updatePaymentDto,
      },
    });
  }

  remove(id: number) {
    return this.prismaService.payment.delete({
      where: {
        id,
      },
    });
  }
}
