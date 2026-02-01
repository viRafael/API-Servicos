import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { SocketWithUser } from '../interfaces/socket-with-user.interface';

export const WsCurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const client: SocketWithUser = ctx.switchToWs().getClient();
    return client.user;
  },
);
