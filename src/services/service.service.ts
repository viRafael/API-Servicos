import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class ServiceService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async create(authenticatedId: number, createServiceDto: CreateServiceDto) {
    const user = await this.usersService.findOne(authenticatedId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const service = await this.prismaService.service.create({
      data: {
        providerId: authenticatedId,
        ...createServiceDto,
      },
    });

    if (user.role !== UserRole.PROVIDER) {
      await this.usersService.updateRoleToProvider(authenticatedId);
    }

    return service;
  }

  findAll() {
    return this.prismaService.service.findMany();
  }

  findAllMyService(authenticatedId: number) {
    return this.prismaService.service.findMany({
      where: {
        providerId: authenticatedId,
      },
    });
  }

  findOne(id: number) {
    return this.prismaService.service.findUnique({
      where: {
        id,
      },
    });
  }

  async update(id: number, userId: number, updateServiceDto: UpdateServiceDto) {
    const service = await this.prismaService.service.findUnique({
      where: {
        id,
      },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    if (service.providerId !== userId) {
      throw new ForbiddenException(
        'You are not allowed to update this service.',
      );
    }

    return this.prismaService.service.update({
      where: {
        id,
      },
      data: {
        ...updateServiceDto,
        updatedAt: new Date(),
      },
    });
  }

  async remove(id: number, idAuthenticated: number) {
    const service = await this.prismaService.service.findUnique({
      where: {
        id,
      },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    if (service.providerId !== idAuthenticated) {
      throw new ForbiddenException(
        'You are not allowed to update this service.',
      );
    }

    return this.prismaService.service.delete({
      where: {
        id,
      },
    });
  }

  async toggleIsActive(id: number, idAuthenticated: number) {
    const service = await this.prismaService.service.findUnique({
      where: {
        id,
      },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    if (service.providerId !== idAuthenticated) {
      throw new ForbiddenException(
        'You are not allowed to update this service.',
      );
    }

    return this.prismaService.service.update({
      where: {
        id,
      },
      data: {
        isActive: !service.isActive,
      },
    });
  }
}
