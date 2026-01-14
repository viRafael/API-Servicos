import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { HashingService } from 'src/auth/hashing/hasing.service';
import { RegisterDto } from 'src/auth/dto/register.dto';

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
        role: createUserDto.role,
      },
      omit: {
        password: true,
      },
    });
  }

  findAll() {
    return this.prismaService.user.findMany();
  }

  findOne(id: number) {
    return this.prismaService.user.findUnique({
      where: {
        id,
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

  update(id: number, updateUserDto: UpdateUserDto) {
    return this.prismaService.user.update({
      where: {
        id,
      },
      data: {
        ...updateUserDto,
      },
    });
  }

  remove(id: number) {
    return this.prismaService.user.delete({
      where: {
        id,
      },
    });
  }
}
