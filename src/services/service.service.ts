import { Injectable } from '@nestjs/common';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Injectable()
export class ServiceService {
  constructor(private readonly prismaService: PrismaService) {}

  create(createServiceDto: CreateServiceDto) {
    return this.prismaService.service.create({
      data: {
        ...createServiceDto,
      },
    });
  }

  findAll() {
    return this.prismaService.service.findMany();
  }

  findOne(id: number) {
    return this.prismaService.service.findUnique({
      where: {
        id,
      },
    });
  }

  update(id: number, updateServiceDto: UpdateServiceDto) {
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

  remove(id: number) {
    return this.prismaService.service.delete({
      where: {
        id,
      },
    });
  }
}
