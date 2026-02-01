import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { google } from 'googleapis';
import { FullBooking } from 'src/booking/types/booking.type';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { env } from 'src/utils/env-validator';

@Injectable()
export class GoogleCalendarService {
  private readonly logger = new Logger(GoogleCalendarService.name);
  constructor(private readonly prismaService: PrismaService) {}

  private getOAuthClient() {
    return new google.auth.OAuth2(
      env.GOOGLE_CLIENT_ID,
      env.GOOGLE_CLIENT_SECRET,
      env.GOOGLE_REDIRECT_URI,
    );
  }

  private async getCalendarClient(userId: number) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user?.googleRefreshToken) {
      throw new InternalServerErrorException(
        'Usuário não conectado ao Google Calendar',
      );
    }

    const oauth2Client = this.getOAuthClient();

    oauth2Client.setCredentials({
      refresh_token: user.googleRefreshToken,
    });

    return google.calendar({ version: 'v3', auth: oauth2Client });
  }

  getAuthUrl() {
    const oauth2Client = this.getOAuthClient();

    return oauth2Client.generateAuthUrl({
      access_type: 'offline', // NECESSÁRIO para refresh_token
      scope: ['https://www.googleapis.com/auth/calendar'],
      prompt: 'consent', // força retorno do refresh_token
    });
  }

  async handleOAuthCallback(code: string, userId: number) {
    const oauth2Client = this.getOAuthClient();
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.refresh_token) {
      throw new InternalServerErrorException('Refresh token não retornado');
    }

    await this.prismaService.user.update({
      where: { id: userId },
      data: { googleRefreshToken: tokens.refresh_token },
    });
  }

  async createEvent(
    userId: number,
    booking: FullBooking,
    forWhom: 'client' | 'provider',
  ) {
    try {
      const calendar = await this.getCalendarClient(userId);

      let summary: string;
      let description: string;

      if (forWhom === 'client') {
        summary = `Seu agendamento: ${booking.service.name}`;
        description = `Com: ${booking.provider.name}\nServiço: ${booking.service.name}\nDuração: ${booking.service.duration} minutos\nNotas: ${booking.notes || 'Nenhuma'}`;
      } else {
        summary = `Agendamento com ${booking.client.name}`;
        description = `Serviço: ${booking.service.name}\nCliente: ${booking.client.name}\nEmail: ${booking.client.email}\nTelefone: ${booking.client.phone}\nDuração: ${booking.service.duration} minutos\nNotas: ${booking.notes || 'Nenhuma'}`;
      }

      const event = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: {
          summary: summary,
          description: description,
          start: {
            dateTime: booking.startTime.toISOString(),
            timeZone: 'America/Sao_Paulo',
          },
          end: {
            dateTime: booking.endTime.toISOString(),
            timeZone: 'America/Sao_Paulo',
          },
        },
      });

      if (!event.data.id) {
        throw new Error('Não foi possível criar o evento no Google Calendar');
      }

      return event.data.id;
    } catch (error) {
      this.logger.error(
        `Failed to create Google Calendar event for user ${userId} (${forWhom}):`,
        error,
      );
      return null;
    }
  }

  async updateEvent(
    userId: number,
    eventId: string,
    booking: FullBooking,
    forWhom: 'client' | 'provider',
  ) {
    try {
      const calendar = await this.getCalendarClient(userId);

      let summary: string;
      let description: string;

      if (forWhom === 'client') {
        summary = `Seu agendamento: ${booking.service.name}`;
        description = `Com: ${booking.provider.name}\nServiço: ${booking.service.name}\nDuração: ${booking.service.duration} minutos\nNotas: ${booking.notes || 'Nenhuma'}`;
      } else {
        summary = `Agendamento com ${booking.client.name}`;
        description = `Serviço: ${booking.service.name}\nCliente: ${booking.client.name}\nEmail: ${booking.client.email}\nTelefone: ${booking.client.phone}\nDuração: ${booking.service.duration} minutos\nNotas: ${booking.notes || 'Nenhuma'}`;
      }

      await calendar.events.update({
        calendarId: 'primary',
        eventId,
        requestBody: {
          summary: summary,
          description: description,
          start: { dateTime: booking.startTime.toISOString() },
          end: { dateTime: booking.endTime.toISOString() },
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to update Google Calendar event ${eventId} for user ${userId} (${forWhom}):`,
        error,
      );
    }
  }

  async deleteEvent(userId: number, eventId: string) {
    try {
      const calendar = await this.getCalendarClient(userId);

      await calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId,
      });
    } catch (error) {
      this.logger.error(
        `Failed to delete Google Calendar event ${eventId} for user ${userId}:`,
        error,
      );
    }
  }
}
