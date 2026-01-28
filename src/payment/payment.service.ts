import { Inject, Injectable } from '@nestjs/common';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import Stripe from 'stripe';

@Injectable()
export class PaymentService {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject('STRIPE_CLIENT')
    private readonly stripe: Stripe,
  ) {}

  async createPaymentIntent(bookingId: number, amount: number) {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: amount * 100, // centavos
      currency: 'brl',
      metadata: {
        bookingId: bookingId,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    await this.prismaService.booking.update({
      where: { id: bookingId },
      data: { paymentIntentId: paymentIntent.id },
    });

    return {
      clientSecret: paymentIntent.client_secret,
    };
  }

  findAll() {
    return this.prismaService.payment.findMany();
  }

  findOne(id: number) {
    return this.prismaService.payment.findUnique({
      where: {
        id,
      },
    });
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
