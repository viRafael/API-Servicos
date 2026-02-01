import { Socket } from 'socket.io';

export interface SocketWithUser extends Socket {
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
  };
}
