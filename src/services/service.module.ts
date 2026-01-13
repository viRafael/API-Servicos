import { Module } from '@nestjs/common';
import { ServiceService } from './service.service';
import { ServiceController } from './service.controller';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Module({
  imports: [PrismaService],
  controllers: [ServiceController],
  providers: [ServiceService],
})
export class ServiceModule {}
