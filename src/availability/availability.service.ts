import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

  findMyAvailability(idAuthenticated: number) {
    return this.prismaService.availability.findUnique({
      where: {
        id: idAuthenticated,
      },
    });
  }

  findOne(id: number) {
    return this.prismaService.availability.findUnique({
      where: {
        id,
      },
    });
  }

  async update(
    idAuthenticated: number,
    id: number,
    updateAvailabilityDto: UpdateAvailabilityDto,
  ) {
    const availability = await this.prismaService.availability.findUnique({
      where: {
        id,
      },
    });

    if (!availability) {
      throw new NotFoundException('Service not found');
    }

    if (availability.providerId !== idAuthenticated) {
      throw new ForbiddenException(
        'You are not allowed to update this service.',
      );
    }

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

  async remove(idAuthenticated: number, id: number) {
    const availability = await this.prismaService.availability.findUnique({
      where: {
        id,
      },
    });

    if (!availability) {
      throw new NotFoundException('Service not found');
    }

    if (availability.providerId !== idAuthenticated) {
      throw new ForbiddenException(
        'You are not allowed to update this service.',
      );
    }

    return this.prismaService.availability.delete({
      where: {
        id,
      },
    });
  }
}
