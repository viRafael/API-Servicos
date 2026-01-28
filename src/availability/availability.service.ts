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

  create(providerId: number, createAvailabilityDto: CreateAvailabilityDto) {
    return this.prismaService.availability.create({
      data: {
        providerId,
        ...createAvailabilityDto,
      },
    });
  }

  findMyAvailabilities(idAuthenticated: number) {
    return this.prismaService.availability.findMany({
      where: {
        providerId: idAuthenticated,
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
      throw new NotFoundException('Availability not found');
    }

    if (availability.providerId !== idAuthenticated) {
      throw new ForbiddenException(
        'You are not allowed to update this availability.',
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
      throw new NotFoundException('Availability not found');
    }

    if (availability.providerId !== idAuthenticated) {
      throw new ForbiddenException(
        'You are not allowed to remove this availability.',
      );
    }

    return this.prismaService.availability.delete({
      where: {
        id,
      },
    });
  }
}
