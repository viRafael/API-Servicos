import {
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { REQUEST_TOKEN_PAYLOAD_KEY, REQUIRE_ROLE_KEY } from '../auth.constants';
import { Roles } from '../enum/roles.enum';
import { TokenPayloadDto } from '../dto/token-payload.dto';

export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const rolesRequireds = this.reflector.get<Roles[] | undefined>(
      REQUIRE_ROLE_KEY,
      context.getHandler(),
    );

    // Rota é publicas, pode passar
    if (!rolesRequireds) {
      return true;
    }

    // Precisamos do tokenPayload vindo do AuthTokenGuards
    const request: Request = context.switchToHttp().getRequest();
    const tokenPayload = request[REQUEST_TOKEN_PAYLOAD_KEY] as TokenPayloadDto;

    if (!tokenPayload) {
      throw new UnauthorizedException('User not log in.');
    }

    const actualRole = tokenPayload.role;

    // Se é ADMIN pode passar
    if (actualRole === Roles.ADMIN) {
      return true;
    }

    const hasPermission = rolesRequireds.includes(actualRole);

    if (!hasPermission) {
      throw new UnauthorizedException(`User não tem permissão requerida`);
    }

    return true;
  }
}
