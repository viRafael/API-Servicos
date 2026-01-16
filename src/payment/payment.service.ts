import { Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { BookingService } from 'src/booking/booking.service';
import { MailService } from 'src/common/mail/mail.service';
import { BookingStatus } from '@prisma/client';

@Injectable()
export class PaymentService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly bookingService: BookingService,
    private readonly mailQueue: MailService,
  ) {}

  async create(createPaymentDto: CreatePaymentDto) {
    const payment = await this.prismaService.payment.create({
      data: {
        ...createPaymentDto,
      },
    });

    const booking = await this.bookingService.changeBookingStatus(
      createPaymentDto.bookingId,
      BookingStatus.CONFIRMED,
    );

    await this.mailQueue.sendPaymentConfirmed(booking);
    await this.mailQueue.sendBookingConfirmation(booking);

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
