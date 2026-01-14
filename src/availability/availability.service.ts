import { Injectable } from '@nestjs/common';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Injectable()
export class AvailabilityService {
  constructor(private readonly prismaService: PrismaService) {}

  create(createAvailabilityDto: CreateAvailabilityDto) {
    return this.prismaService.availability.create({
      data: {
        ...createAvailabilityDto,
      },
    });
  }

  findAll() {
    return this.prismaService.availability.findMany();
  }

  findOne(id: number) {
    return this.prismaService.availability.findUnique({
      where: {
        id,
      },
    });
  }

  update(id: number, updateAvailabilityDto: UpdateAvailabilityDto) {
    return this.prismaService.availability.update({
      where: {
        id,
      },
      data: {
        ...updateAvailabilityDto,
        updatedAt: new Date(),
      },
    });
  }

  remove(id: number) {
    return this.prismaService.availability.delete({
      where: {
        id,
      },
    });
  }
}
