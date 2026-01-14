import {
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';
import { HashingService } from './hashing/hasing.service';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from './config/jwt.config';
import type { ConfigType } from '@nestjs/config';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly hashsingService: HashingService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
  ) {}

  private async generateToken<T>(
    sub: number,
    expiresIn: number,
    role: string,
    payload?: T,
  ) {
    return await this.jwtService.signAsync(
      {
        sub,
        role,
        ...payload,
      },
      {
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
        secret: this.jwtConfiguration.secret,
        expiresIn: expiresIn,
      },
    );
  }

  async login(loginDto: LoginDto) {
    let passwordIsValid = false;

    // Verifico se há um usuario com esse email
    const user = await this.userService.findByEmail(loginDto.email);

    // Verifico se a senha bate
    if (user) {
      passwordIsValid = await this.hashsingService.compare(
        loginDto.password,
        user.password,
      );
    }

    if (!passwordIsValid || !user) {
      throw new UnauthorizedException('Email or password invalid');
    }

    const accesToken = await this.generateToken<Partial<User>>(
      user.id,
      this.jwtConfiguration.jwtTtl,
      user.role,
    );

    const refreshToken = await this.generateToken<Partial<User>>(
      user.id,
      this.jwtConfiguration.jwtRefreshTtl,
      user.role,
    );

    return {
      accesToken,
      refreshToken,
    };
  }

  async register(registerDto: RegisterDto) {
    // Verifico se já existe um User com esse email
    const existUser = await this.prismaService.user.findUnique({
      where: {
        email: registerDto.email,
      },
    });

    if (existUser) {
      throw new ForbiddenException('Email already in use');
    }

    // Validar se já existe um User com esse telefone
    const existPhone = await this.prismaService.user.findUnique({
      where: {
        phone: registerDto.phone.replace(/\D/g, ''),
      },
    });

    if (existPhone) {
      throw new ForbiddenException('Phpne already in use');
    }

    registerDto.phone = registerDto.phone.replace(/\D/g, '');

    // Cria a instancia
    return this.userService.create(registerDto);
  }
}
