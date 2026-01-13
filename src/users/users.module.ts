import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Module({
  imports: [PrismaService],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
