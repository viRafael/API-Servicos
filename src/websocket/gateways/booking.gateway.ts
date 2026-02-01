import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../guards/ws-jwt.guard';
import { WsCurrentUser } from '../decorators/ws-current-user.decorator';
import type { SocketWithUser } from '../interfaces/socket-with-user.interface';
import { FullBooking } from 'src/booking/types/booking.type';
import { FullReview } from 'src/review/types/review.type';

@UseGuards(WsJwtGuard)
@WebSocketGateway({
  cors: {
    origin: '*', // Em produção, especifique os domínios permitidos
    credentials: true,
  },
  namespace: '/bookings', // Namespace específico para bookings
})
export class BookingGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  // Armazena quais sockets pertencem a quais usuários
  private userSockets: Map<number, Set<string>> = new Map();

  //
  // FUNĆOES PARA O CICLO DE VIDA
  //
  handleConnection(client: SocketWithUser) {
    // Se a conexão chegou até aqui, o usuário está autenticado.
    console.log(
      `Client connected: ${client.id} - User: ${client.user.name} (${client.user.id})`,
    );
  }

  handleDisconnect(client: SocketWithUser) {
    console.log(`Client disconnected: ${client.id}`);

    // Remove socket do mapa de usuários
    if (client.user) {
      const userSocketSet = this.userSockets.get(client.user.id);
      if (userSocketSet) {
        userSocketSet.delete(client.id);
        if (userSocketSet.size === 0) {
          this.userSockets.delete(client.user.id);
        }
      }
    }
  }

  //
  // FUNĆOES PARA O CLIENTE USAR
  //

  @SubscribeMessage('join')
  async handleJoin(
    @ConnectedSocket() client: SocketWithUser,
    @WsCurrentUser() user: SocketWithUser['user'],
  ) {
    // Adiciona cliente à room do seu userId
    const roomName = `user:${user.id}`;
    await client.join(roomName);

    // Se for PROVIDER, adiciona também à room de providers
    if (user.role === 'PROVIDER') {
      await client.join('providers');
    }

    // Se for CLIENT, adiciona à room de clients
    if (user.role === 'CLIENT') {
      await client.join('clients');
    }

    // Armazena referência do socket
    if (!this.userSockets.has(user.id)) {
      this.userSockets.set(user.id, new Set());
    }
    this.userSockets.get(user.id)!.add(client.id);

    console.log(`User ${user.name} (${user.id}) joined room: ${roomName}`);

    // Confirma que entrou na room
    client.emit('joined', {
      message: 'Successfully joined',
      rooms: Array.from(client.rooms),
    });
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: SocketWithUser) {
    client.emit('pong', { timestamp: new Date().toISOString() });
  }

  //
  // FUNĆOES PARA USARMOS E ENVIAR PARA O CLIENTE
  //

  //Notifica provider que recebeu novo agendamento
  notifyNewBooking(providerId: number, booking: FullBooking) {
    const roomName = `user:${providerId}`;

    this.server.to(roomName).emit('new-booking', {
      type: 'new-booking',
      title: 'Novo Agendamento!',
      message: `${booking.client.name} agendou ${booking.service.name}`,
      data: {
        bookingId: booking.id,
        clientName: booking.client.name,
        serviceName: booking.service.name,
        startTime: booking.startTime,
        endTime: booking.endTime,
        status: booking.status,
      },
      timestamp: new Date().toISOString(),
    });

    console.log(`Notified provider ${providerId} about new booking`);
  }

  // Notifica cliente que pagamento foi confirmado
  notifyPaymentConfirmed(clientId: number, booking: FullBooking) {
    const roomName = `user:${clientId}`;

    this.server.to(roomName).emit('payment-confirmed', {
      type: 'payment-confirmed',
      title: 'Pagamento Confirmado!',
      message: `Seu agendamento de ${booking.service.name} foi confirmado`,
      data: {
        bookingId: booking.id,
        serviceName: booking.service.name,
        providerName: booking.provider.name,
        startTime: booking.startTime,
        amount: booking.service.price,
      },
      timestamp: new Date().toISOString(),
    });

    // Também notifica o provider
    this.notifyNewBooking(booking.providerId, booking);

    console.log(`Notified client ${clientId} about payment confirmation`);
  }

  //Notifica sobre cancelamento (cliente E provider)
  notifyBookingCancelled(
    clientId: number,
    providerId: number,
    booking: FullBooking,
    cancelledBy: 'client' | 'provider',
    reason?: string,
  ) {
    const cancellerName =
      cancelledBy === 'client' ? booking.client.name : booking.provider.name;

    // Notifica o cliente
    this.server.to(`user:${clientId}`).emit('booking-cancelled', {
      type: 'booking-cancelled',
      title: 'Agendamento Cancelado',
      message:
        cancelledBy === 'client'
          ? `Você cancelou o agendamento de ${booking.service.name}`
          : `${booking.provider.name} cancelou seu agendamento`,
      data: {
        bookingId: booking.id,
        serviceName: booking.service.name,
        startTime: booking.startTime,
        cancelledBy,
        cancellerName,
        reason,
      },
      timestamp: new Date().toISOString(),
    });

    // Notifica o provider
    this.server.to(`user:${providerId}`).emit('booking-cancelled', {
      type: 'booking-cancelled',
      title: 'Agendamento Cancelado',
      message:
        cancelledBy === 'provider'
          ? `Você cancelou o agendamento com ${booking.client.name}`
          : `${booking.client.name} cancelou o agendamento`,
      data: {
        bookingId: booking.id,
        clientName: booking.client.name,
        serviceName: booking.service.name,
        startTime: booking.startTime,
        cancelledBy,
        cancellerName,
        reason,
      },
      timestamp: new Date().toISOString(),
    });

    console.log(`Notified about cancellation - Booking ${booking.id}`);
  }

  //Notifica sobre reagendamento
  notifyBookingRescheduled(
    clientId: number,
    providerId: number,
    booking: FullBooking,
    oldStartTime: Date,
  ) {
    const notification = {
      type: 'booking-rescheduled',
      title: 'Agendamento Reagendado',
      data: {
        bookingId: booking.id,
        serviceName: booking.service.name,
        oldStartTime,
        newStartTime: booking.startTime,
      },
      timestamp: new Date().toISOString(),
    };

    // Notifica cliente
    this.server.to(`user:${clientId}`).emit('booking-rescheduled', {
      ...notification,
      message: `Seu agendamento foi reagendado para ${new Date(booking.startTime).toLocaleString('pt-BR')}`,
    });

    // Notifica provider
    this.server.to(`user:${providerId}`).emit('booking-rescheduled', {
      ...notification,
      message: `Agendamento com ${booking.client.name} foi reagendado`,
    });

    console.log(`Notified about rescheduling - Booking ${booking.id}`);
  }

  //Notifica que booking foi completado
  notifyBookingCompleted(
    clientId: number,
    providerId: number,
    booking: FullBooking,
  ) {
    // Notifica cliente - pode pedir avaliação
    this.server.to(`user:${clientId}`).emit('booking-completed', {
      type: 'booking-completed',
      title: 'Serviço Concluído',
      message: `Como foi sua experiência com ${booking.provider.name}? Deixe sua avaliação!`,
      data: {
        bookingId: booking.id,
        serviceName: booking.service.name,
        providerName: booking.provider.name,
        canReview: true,
      },
      timestamp: new Date().toISOString(),
    });

    // Notifica provider
    this.server.to(`user:${providerId}`).emit('booking-completed', {
      type: 'booking-completed',
      title: 'Serviço Marcado como Concluído',
      message: `Serviço com ${booking.client.name} foi concluído`,
      data: {
        bookingId: booking.id,
        clientName: booking.client.name,
        serviceName: booking.service.name,
      },
      timestamp: new Date().toISOString(),
    });
  }

  //Notifica sobre falha de pagamento
  notifyPaymentFailed(clientId: number, booking: FullBooking, reason?: string) {
    this.server.to(`user:${clientId}`).emit('payment-failed', {
      type: 'payment-failed',
      title: 'Falha no Pagamento',
      message: 'Houve um problema ao processar seu pagamento. Tente novamente.',
      data: {
        bookingId: booking.id,
        serviceName: booking.service.name,
        amount: booking.service.price,
        reason,
      },
      timestamp: new Date().toISOString(),
    });
  }

  //Notifica provider sobre novo review
  notifyNewReview(providerId: number, review: FullReview) {
    this.server.to(`user:${providerId}`).emit('new-review', {
      type: 'new-review',
      title: 'Nova Avaliação!',
      message: `${review.client.name} deixou uma avaliação de ${review.rating} estrelas`,
      data: {
        reviewId: review.id,
        rating: review.rating,
        comment: review.comment,
        clientName: review.client.name,
        serviceName: review.booking.service.name,
      },
      timestamp: new Date().toISOString(),
    });
  }

  //Broadcast para todos os providers online
  broadcastToProviders(event: string, data: unknown) {
    this.server.to('providers').emit(event, data);
  }

  //Broadcast para todos os clients online
  broadcastToClients(event: string, data: unknown) {
    this.server.to('clients').emit(event, data);
  }

  //Verifica se usuário está online
  isUserOnline(userId: number): boolean {
    return this.userSockets.has(userId);
  }

  //Pega quantidade de usuários online
  getOnlineUsersCount(): number {
    return this.userSockets.size;
  }
}
