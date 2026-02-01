import {
  Body,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
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
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { TokenPayloadDto } from './dto/token-payload.dto';
import { RequestPasswordReset } from './dto/request-password-resert.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RESET_PASSWORD_KEY } from './auth.constants';
import { MailQueue } from 'src/common/mail/mail.queue';
import { env } from 'src/utils/env-validator';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly hashsingService: HashingService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
    private readonly mailQueue: MailQueue,
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

    const expiresAt = new Date();
    expiresAt.setSeconds(
      expiresAt.getSeconds() + this.jwtConfiguration.jwtRefreshTtl,
    );

    await this.prismaService.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt,
      },
    });

    return {
      accesToken,
      refreshToken,
    };
  }

  async logout(userId: number) {
    await this.prismaService.refreshToken.deleteMany({
      where: { userId },
    });

    return {
      message: 'User logged out successfully',
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
      throw new ForbiddenException('Phone already in use');
    }

    registerDto.phone = registerDto.phone.replace(/\D/g, '');

    // Cria a instancia
    return this.userService.register(registerDto);
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    try {
      const payload = await this.jwtService.verifyAsync<TokenPayloadDto>(
        refreshTokenDto.refreshToken,
        this.jwtConfiguration,
      );

      const user = await this.prismaService.user.findUnique({
        where: {
          id: payload.sub,
        },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const storedToken = await this.prismaService.refreshToken.findUnique({
        where: {
          token: refreshTokenDto.refreshToken,
        },
      });

      if (!storedToken) {
        throw new UnauthorizedException('Refresh token not found');
      }

      if (storedToken.expiresAt < new Date()) {
        await this.prismaService.refreshToken.delete({
          where: {
            id: storedToken.id,
          },
        });
        throw new UnauthorizedException('Refresh token has expired');
      }

      await this.prismaService.refreshToken.delete({
        where: {
          id: storedToken.id,
        },
      });

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

      const expiresAt = new Date();
      expiresAt.setSeconds(
        expiresAt.getSeconds() + this.jwtConfiguration.jwtRefreshTtl,
      );

      await this.prismaService.refreshToken.create({
        data: {
          userId: user.id,
          token: refreshToken,
          expiresAt,
        },
      });

      return {
        accesToken,
        refreshToken,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async sendForgetPasswordEmail(requestPasswordReset: RequestPasswordReset) {
    // Verifica o email
    const user = await this.prismaService.user.findUnique({
      where: {
        email: requestPasswordReset.email,
      },
    });

    if (!user) {
      throw new NotFoundException('Email not found');
    }

    // Cria o token
    const emailToken = this.jwtService.sign(
      { sub: requestPasswordReset.email, iss: RESET_PASSWORD_KEY },
      { expiresIn: '10m' },
    );

    // Envia o email
    await this.mailQueue.sendPasswordReset(
      requestPasswordReset.email,
      emailToken,
    );

    return {
      message: 'Password reset email was send sucessfully',
    };
  }

  async resetPassword(token: string, resetPasswordDto: ResetPasswordDto) {
    try {
      const tokenPayload = this.jwtService.verify<{ sub: string }>(token, {
        secret: env.JWT_SECRET,
        issuer: RESET_PASSWORD_KEY,
        ignoreExpiration: false,
      });

      const hashedPassword = await this.hashsingService.hash(
        resetPasswordDto.password,
      );

      await this.userService.updatePassword(tokenPayload.sub, hashedPassword);
    } catch {
      throw new ForbiddenException('Invalid or expired reset password token');
    }
  }
}
