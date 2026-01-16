import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { REQUEST_TOKEN_PAYLOAD_KEY } from '../auth.constants';
import { Request } from 'express';
import { TokenPayloadDto } from '../dto/token-payload.dto';

export const TokenPayloadParam = createParamDecorator(
  (ctx: ExecutionContext) => {
    const context = ctx.switchToHttp();
    const request: Request = context.getRequest();
    return request[REQUEST_TOKEN_PAYLOAD_KEY] as TokenPayloadDto;
  },
);
