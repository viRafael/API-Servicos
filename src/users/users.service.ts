import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { HashingService } from 'src/auth/hashing/hasing.service';
import { RegisterDto } from 'src/auth/dto/register.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly hashingService: HashingService,
  ) {}

  async register(registerDto: RegisterDto) {
    // Hasing de senha
    const hashedPassword = await this.hashingService.hash(registerDto.password);

    return this.prismaService.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        name: registerDto.name,
        phone: registerDto.phone.replace(/\D/g, ''),
      },
      omit: {
        password: true,
      },
    });
  }

  async create(createUserDto: CreateUserDto) {
    // Hasing de senha
    const hashedPassword = await this.hashingService.hash(
      createUserDto.password,
    );

    return this.prismaService.user.create({
      data: {
        email: createUserDto.email,
        password: hashedPassword,
        name: createUserDto.name,
        phone: createUserDto.phone.replace(/\D/g, ''),
        role: createUserDto.role
          ? UserRole[createUserDto.role]
          : UserRole.CLIENT,
      },
      omit: {
        password: true,
      },
    });
  }

  updateRoleToProvider(id: number) {
    return this.prismaService.user.update({
      where: {
        id,
      },
      data: {
        role: UserRole.PROVIDER,
      },
    });
  }

  findAll() {
    return this.prismaService.user.findMany();
  }

  findAllProviders() {
    return this.prismaService.user.findMany({
      where: {
        role: UserRole.PROVIDER,
      },
    });
  }

  async update(
    authenticatedId: number,
    id: number,
    updateUserDto: UpdateUserDto,
  ) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.id !== authenticatedId) {
      throw new ForbiddenException('You are not allowed to update this user.');
    }

    return this.prismaService.user.update({
      where: {
        id: authenticatedId,
      },
      data: {
        ...updateUserDto,
      },
    });
  }

  async updatePassword(email: string, newPassword: string) {
    return this.prismaService.user.update({
      where: {
        email: email,
      },
      data: {
        password: newPassword,
      },
    });
  }

  findOne(id: number) {
    return this.prismaService.user.findUnique({
      where: {
        id,
      },
      omit: {
        password: true,
      },
    });
  }

  findByEmail(email: string) {
    return this.prismaService.user.findUnique({
      where: {
        email,
      },
    });
  }

  async remove(authenticatedId: number, idToDelete: number) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: idToDelete,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.id !== authenticatedId) {
      throw new ForbiddenException('You are not allowed to remove this user.');
    }

    return this.prismaService.user.delete({
      where: {
        id: idToDelete,
      },
    });
  }
}
