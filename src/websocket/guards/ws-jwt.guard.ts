import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { SocketWithUser } from '../interfaces/socket-with-user.interface';
import { PrismaService } from 'src/common/prisma/prisma.service';
import type { ConfigType } from '@nestjs/config';
import jwtConfig from 'src/auth/config/jwt.config';
import { TokenPayloadDto } from 'src/auth/dto/token-payload.dto';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  private extractTokenFromHandshake(
    client: SocketWithUser,
  ): string | undefined {
    const authHeader = client.handshake?.headers?.authorization;

    if (!authHeader || typeof authHeader !== 'string') {
      return undefined;
    }

    return authHeader.split(' ')[1];
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: SocketWithUser = context.switchToWs().getClient();

      // Pega token do handshake (conexão inicial)
      const token = this.extractTokenFromHandshake(client);

      if (!token) {
        throw new WsException('Unauthorized - No token provided');
      }

      // Valida JWT
      const payload = await this.jwtService.verifyAsync<TokenPayloadDto>(
        token,
        this.jwtConfiguration,
      );

      // Busca usuário no banco
      const user = await this.prisma.user.findUnique({
        where: {
          id: payload.sub,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      });

      if (!user) {
        throw new WsException('Unauthorized - User not found');
      }

      // Anexa usuário ao socket
      client.user = user;

      return true;
    } catch (error) {
      throw new WsException(`Unauthorized - Invalid token, ${error}`);
    }
  }
}
