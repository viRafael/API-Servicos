import { Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Injectable()
export class PaymentService {
  constructor(private readonly prismaService: PrismaService) {}

  create(createPaymentDto: CreatePaymentDto) {
    return this.prismaService.payment.create({
      data: {
        ...createPaymentDto,
      },
    });
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
