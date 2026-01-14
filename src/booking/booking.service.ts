import { Injectable } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Injectable()
export class BookingService {
  constructor(private readonly prismaService: PrismaService) {}

  create(createBookingDto: CreateBookingDto) {
    return this.prismaService.booking.create({
      data: {
        ...createBookingDto,
      },
    });
  }

  findAll() {
    return this.prismaService.booking.findMany();
  }

  findOne(id: number) {
    return this.prismaService.booking.findUnique({
      where: {
        id,
      },
    });
  }

  update(id: number, updateBookingDto: UpdateBookingDto) {
    return this.prismaService.booking.update({
      where: {
        id,
      },
      data: {
        ...updateBookingDto,
      },
    });
  }

  remove(id: number) {
    return this.prismaService.booking.delete({
      where: {
        id,
      },
    });
  }
}
