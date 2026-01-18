import { Inject, Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { MailService } from 'src/common/mail/mail.service';
import { BookingStatus } from '@prisma/client';
import Stripe from 'stripe';

@Injectable()
export class PaymentService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly mailService: MailService,
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

  async create(createPaymentDto: CreatePaymentDto) {
    const payment = await this.prismaService.payment.create({
      data: {
        ...createPaymentDto,
      },
    });

    const booking = await this.prismaService.booking.update({
      where: { id: createPaymentDto.bookingId },
      data: { status: BookingStatus.CONFIRMED },
      include: {
        client: true,
        provider: true,
        service: true,
        payment: true,
      },
    });

    await this.mailService.sendPaymentConfirmed(booking);
    await this.mailService.sendBookingConfirmation(booking);

    return payment;
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
