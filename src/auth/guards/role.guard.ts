import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { REQUEST_TOKEN_PAYLOAD_KEY, REQUIRE_ROLE_KEY } from '../auth.constants';
import { Roles } from '../enum/roles.enum';
import { TokenPayloadDto } from '../dto/token-payload.dto';

export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const UserRoleLevel = {
      ADMIN: 99,
      PROVIDER: 70,
      CLIENT: 50,
    } as const;

    const isPublic = this.reflector.get<boolean>(
      'isPublic',
      context.getHandler(),
    );

    if (isPublic) {
      return true;
    }

    let rolesRequireds = this.reflector.getAllAndOverride<Roles[]>(
      REQUIRE_ROLE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!rolesRequireds) {
      rolesRequireds = [Roles.ADMIN];
    }

    const request: Request = context.switchToHttp().getRequest();
    const tokenPayload = request[REQUEST_TOKEN_PAYLOAD_KEY] as TokenPayloadDto;

    if (!tokenPayload) {
      throw new UnauthorizedException('User not log in.');
    }

    const requiredLevel = Math.min(
      ...rolesRequireds.map((role) => UserRoleLevel[role]),
    );

    const userLevel = UserRoleLevel[tokenPayload.role];

    if (userLevel < requiredLevel) {
      throw new ForbiddenException('Unauthorized access');
    }

    return true;
  }
}
