import { Injectable } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Injectable()
export class ReviewService {
  constructor(private readonly prismaService: PrismaService) {}

  create(createReviewDto: CreateReviewDto) {
    return this.prismaService.review.create({
      data: {
        ...createReviewDto,
      },
    });
  }

  findAll() {
    return this.prismaService.review.findMany();
  }

  findOne(id: number) {
    return this.prismaService.review.findUnique({
      where: {
        id,
      },
    });
  }

  update(id: number, updateReviewDto: UpdateReviewDto) {
    return this.prismaService.review.update({
      where: {
        id,
      },
      data: {
        ...updateReviewDto,
      },
    });
  }

  remove(id: number) {
    return this.prismaService.review.delete({
      where: {
        id,
      },
    });
  }
}
