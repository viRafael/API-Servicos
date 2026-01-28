import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { BookingStatus } from '@prisma/client';

@Injectable()
export class ReviewService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(clientId: number, createReviewDto: CreateReviewDto) {
    const booking = await this.prismaService.booking.findUnique({
      where: { id: createReviewDto.bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.clientId !== clientId) {
      throw new ForbiddenException(
        'You are not allowed to review this booking.',
      );
    }

    if (booking.status !== BookingStatus.COMPLETED) {
      throw new BadRequestException('You can only review completed bookings.');
    }

    const existingReview = await this.prismaService.review.findUnique({
      where: { bookingId: createReviewDto.bookingId },
    });

    if (existingReview) {
      throw new BadRequestException('This booking already has a review.');
    }

    return this.prismaService.review.create({
      data: {
        bookingId: createReviewDto.bookingId,
        clientId,
        providerId: booking.providerId,
        rating: createReviewDto.rating,
        comment: createReviewDto.comment,
      },
    });
  }

  findAllAsProvider(idProvider: number) {
    return this.prismaService.review.findMany({
      where: {
        providerId: idProvider,
      },
    });
  }

  findOne(id: number) {
    return this.prismaService.review.findUnique({
      where: {
        id,
      },
    });
  }

  async update(
    idAuthenticated: number,
    id: number,
    updateReviewDto: UpdateReviewDto,
  ) {
    const review = await this.prismaService.review.findUnique({
      where: {
        id,
      },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.clientId !== idAuthenticated) {
      throw new ForbiddenException(
        'You are not allowed to update this review.',
      );
    }

    return this.prismaService.review.update({
      where: {
        id,
      },
      data: {
        ...updateReviewDto,
      },
    });
  }

  async remove(idAuthenticated: number, id: number) {
    const review = await this.prismaService.review.findUnique({
      where: {
        id,
      },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.clientId !== idAuthenticated) {
      throw new ForbiddenException(
        'You are not allowed to remove this review.',
      );
    }

    return this.prismaService.review.delete({
      where: {
        id,
      },
    });
  }
}
