import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { AvailableSlotsDto } from './dto/available-slots.dto';
import { CancelBookingDto } from './dto/cancel-booking.dto';
import { RescheduleBookingDto } from './dto/reschedule-booking.dto';
import { FindAllBookingsDto } from './dto/find-all-bookings.dto';
import { FindBookingsAsProviderDto } from './dto/find-bookings-as-provider.dto';
import { addMinutes, isBefore } from 'date-fns';
import { Booking, BookingStatus, Prisma, UserRole } from '@prisma/client';
import { Roles } from 'src/auth/enum/roles.enum';
import { FullBooking } from './types/booking.type';
import { MailQueue } from 'src/common/mail/mail.queue';
import { PaymentService } from 'src/payment/payment.service';
import { GoogleCalendarService } from 'src/google-calendar/google-calendar.service';
import { BookingGateway } from 'src/websocket/gateways/booking.gateway';

@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly mailQueue: MailQueue,
    private readonly paymentService: PaymentService,
    private readonly googleCalendarService: GoogleCalendarService,
    private readonly bookingGateway: BookingGateway,
  ) {}

  private validateBookingCanBeModified(
    booking: Booking,
    userId: number,
    action: string,
  ) {
    // Apenas client ou provider podem modificar
    if (booking.clientId !== userId && booking.providerId !== userId) {
      throw new ForbiddenException(
        `You are not authorized to ${action} this booking.`,
      );
    }

    // Apenas agendamentos confirmados ou pendentes podem ser modificados
    if (
      booking.status === BookingStatus.COMPLETED ||
      booking.status === BookingStatus.CANCELLED
    ) {
      throw new BadRequestException(
        `Booking cannot be ${action}ed as it is ${booking.status.toLowerCase()}.`,
      );
    }
  }

  private async validateSlotAvailability(
    providerId: number,
    startTime: Date,
    endTime: Date,
    excludeBookingId?: number,
  ) {
    // Verifica por agendamentos sobrepostos
    const existingBookings = await this.prismaService.booking.findMany({
      where: {
        providerId,
        ...(excludeBookingId && { id: { not: excludeBookingId } }),
        OR: [
          {
            startTime: { lt: endTime },
            endTime: { gt: startTime },
          },
        ],
        status: {
          notIn: [BookingStatus.CANCELLED],
        },
      },
    });

    if (existingBookings.length > 0) {
      throw new BadRequestException('Time slot is already booked.');
    }
  }

  private async validateProviderAvailability(
    providerId: number,
    startTime: Date,
    endTime: Date,
  ) {
    const dayOfWeek = startTime.getDay();

    const availability = await this.prismaService.availability.findFirst({
      where: { providerId, dayOfWeek },
    });

    if (!availability) {
      throw new BadRequestException('Provider is not available at this time.');
    }

    const [availStartHour, availStartMin] = availability.startTime
      .split(':')
      .map(Number);
    const [availEndHour, availEndMin] = availability.endTime
      .split(':')
      .map(Number);

    const bookingStartMinutes =
      startTime.getHours() * 60 + startTime.getMinutes();
    const bookingEndMinutes = endTime.getHours() * 60 + endTime.getMinutes();
    const availStartMinutes = availStartHour * 60 + availStartMin;
    const availEndMinutes = availEndHour * 60 + availEndMin;

    if (
      bookingStartMinutes < availStartMinutes ||
      bookingEndMinutes > availEndMinutes
    ) {
      throw new BadRequestException('Provider is not available at this time.');
    }
  }

  async confirmByPaymentIntent(paymentIntentId: string) {
    const bookingToConfirm = await this.prismaService.booking.findUnique({
      where: { paymentIntentId },
      include: {
        client: true,
        provider: true,
        service: true,
      },
    });

    if (!bookingToConfirm) {
      throw new NotFoundException('Booking not found for this payment intent.');
    }

    if (bookingToConfirm.status === BookingStatus.CONFIRMED) {
      return this.getFullBooking(bookingToConfirm.id);
    }

    if (bookingToConfirm.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Cannot confirm a cancelled booking.');
    }

    // Verifica se já existe um pagamento para evitar duplicação em caso de retries do webhook
    const existingPayment = await this.prismaService.payment.findUnique({
      where: { paymentIntentId: paymentIntentId },
    });

    if (!existingPayment) {
      await this.prismaService.payment.create({
        data: {
          bookingId: bookingToConfirm.id,
          userId: bookingToConfirm.clientId,
          paymentIntentId: paymentIntentId,
          amount: bookingToConfirm.service.price,
          status: 'SUCCEEDED',
        },
      });
    }

    let providerGoogleEventId: string | null = null;
    let clientGoogleEventId: string | null = null;

    // Cria Google Calendar event para provider
    try {
      providerGoogleEventId = await this.googleCalendarService.createEvent(
        bookingToConfirm.providerId,
        bookingToConfirm as FullBooking,
        'provider',
      );
    } catch (error) {
      this.logger.error(
        `Failed to create Google Calendar event for provider ${bookingToConfirm.providerId} for booking ${bookingToConfirm.id}:`,
        error,
      );
    }

    // Cria Google Calendar event para client
    try {
      clientGoogleEventId = await this.googleCalendarService.createEvent(
        bookingToConfirm.clientId,
        bookingToConfirm as FullBooking,
        'client',
      );
    } catch (error) {
      this.logger.error(
        `Failed to create Google Calendar event for client ${bookingToConfirm.clientId} for booking ${bookingToConfirm.id}:`,
        error,
      );
    }

    const updatedBooking = await this.prismaService.booking.update({
      where: {
        paymentIntentId: paymentIntentId,
      },
      data: {
        status: BookingStatus.CONFIRMED,
        providerGoogleEventId,
        clientGoogleEventId,
      },
    });

    await this.mailQueue.sendBookingConfirmation(updatedBooking.id);
    await this.mailQueue.sendPaymentConfirmed(updatedBooking.id);

    const fullBooking = await this.getFullBooking(updatedBooking.id);
    this.bookingGateway.notifyPaymentConfirmed(
      fullBooking.clientId,
      fullBooking,
    );

    return fullBooking;
  }

  async getFullBooking(bookingId: number): Promise<FullBooking> {
    const booking = await this.prismaService.booking.findUnique({
      where: { id: bookingId },
      include: {
        client: true,
        provider: true,
        service: true,
        payment: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found.');
    }

    return booking as FullBooking;
  }

  async findAvailableSlots(query: AvailableSlotsDto) {
    const { providerId, serviceId, date } = query;
    const baseDate = new Date(date);

    // Valida provider
    const provider = await this.prismaService.user.findUnique({
      where: {
        id: +providerId,
        role: UserRole.PROVIDER,
      },
    });
    if (!provider) {
      throw new NotFoundException('Provider not found.');
    }

    // Valida service
    const service = await this.prismaService.service.findUnique({
      where: {
        id: +serviceId,
        providerId: +providerId,
      },
    });
    if (!service) {
      throw new NotFoundException('Service not found for this provider.');
    }

    if (!service.isActive) {
      throw new BadRequestException('Service is not active.');
    }

    const dayOfWeek = baseDate.getDay(); // Sunday - 0, Saturday - 6

    // Pega as disponibilidades do provider para o dia especificado
    const availabilities = await this.prismaService.availability.findMany({
      where: {
        providerId: +providerId,
        dayOfWeek: dayOfWeek,
      },
    });

    if (availabilities.length === 0) {
      return { message: 'Provider not available on this day.', slots: [] };
    }

    // Pega agendamentos existentes para o provider para o dia especificado (sem mutar baseDate)
    const startOfDay = new Date(baseDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(baseDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingBookings = await this.prismaService.booking.findMany({
      where: {
        providerId: +providerId,
        startTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          notIn: [BookingStatus.CANCELLED],
        },
      },
      select: {
        startTime: true,
        endTime: true,
      },
    });

    const availableSlots: { startTime: Date; endTime: Date }[] = [];
    availabilities.forEach((availability) => {
      const dayCopy = new Date(baseDate.getTime());
      dayCopy.setHours(
        parseInt(availability.startTime.split(':')[0], 10),
        parseInt(availability.startTime.split(':')[1], 10),
        0,
        0,
      );
      let currentSlotStart = new Date(dayCopy.getTime());

      const availabilityEnd = new Date(baseDate.getTime());
      availabilityEnd.setHours(
        parseInt(availability.endTime.split(':')[0], 10),
        parseInt(availability.endTime.split(':')[1], 10),
        0,
        0,
      );

      while (
        addMinutes(currentSlotStart, service.duration) <= availabilityEnd
      ) {
        const currentSlotEnd = addMinutes(currentSlotStart, service.duration);
        const isOverlapping = existingBookings.some((booking) => {
          return (
            currentSlotStart < booking.endTime &&
            currentSlotEnd > booking.startTime
          );
        });

        if (!isOverlapping && currentSlotStart >= new Date()) {
          availableSlots.push({
            startTime: new Date(currentSlotStart.getTime()),
            endTime: new Date(currentSlotEnd.getTime()),
          });
        }
        currentSlotStart = addMinutes(currentSlotStart, service.duration);
      }
    });

    return { slots: availableSlots };
  }

  async create(clientId: number, createBookingDto: CreateBookingDto) {
    const { providerId, serviceId, startTime, notes } = createBookingDto;

    const provider = await this.prismaService.user.findUnique({
      where: { id: providerId, role: UserRole.PROVIDER },
    });
    if (!provider) {
      throw new NotFoundException('Provider not found.');
    }

    const service = await this.prismaService.service.findUnique({
      where: { id: serviceId, providerId },
    });
    if (!service) {
      throw new NotFoundException('Service not found for this provider.');
    }

    if (!service.isActive) {
      throw new BadRequestException('Service is not active.');
    }

    const bookingStartTime = new Date(startTime);
    const bookingEndTime = addMinutes(bookingStartTime, service.duration);

    // Valida se o horário está no futuro
    if (isBefore(bookingStartTime, new Date())) {
      throw new BadRequestException('Start time cannot be in the past.');
    }

    await this.validateSlotAvailability(
      providerId,
      bookingStartTime,
      bookingEndTime,
    );

    await this.validateProviderAvailability(
      providerId,
      bookingStartTime,
      bookingEndTime,
    );

    const booking = await this.prismaService.booking.create({
      data: {
        clientId,
        providerId,
        serviceId,
        startTime: bookingStartTime,
        endTime: bookingEndTime,
        notes,
        status: BookingStatus.PENDING_PAYMENT,
      },
    });

    const paymentIntent = await this.paymentService.createPaymentIntent(
      clientId,
      { bookingId: booking.id },
    );

    return {
      booking: await this.getFullBooking(booking.id),
      clientSecret: paymentIntent.clientSecret,
    };
  }

  async findAll(userId: number, userRole: Roles, query: FindAllBookingsDto) {
    const { status, startDate, endDate } = query;
    const where: Prisma.BookingWhereInput = {};

    if (userRole === Roles.CLIENT) {
      where.clientId = userId;
    } else if (userRole === Roles.PROVIDER) {
      where.providerId = userId;
    } else {
      throw new ForbiddenException(
        'You are not authorized to perform this action.',
      );
    }

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.startTime = {};
      if (startDate) {
        where.startTime.gte = new Date(startDate);
      }
      if (endDate) {
        where.startTime.lte = new Date(endDate);
      }
    }

    return this.prismaService.booking.findMany({
      where,
      include: {
        service: {
          select: {
            name: true,
            provider: {
              select: {
                name: true,
              },
            },
          },
        },
        client: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  async findMyBookingsAsClient(clientId: number) {
    return this.prismaService.booking.findMany({
      where: {
        clientId,
      },
      include: {
        service: {
          select: {
            name: true,
            provider: {
              select: {
                name: true,
              },
            },
          },
        },
        provider: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        startTime: 'desc',
      },
    });
  }

  async findBookingsAsProvider(
    providerId: number,
    query: FindBookingsAsProviderDto,
  ) {
    const { status, date } = query;
    const where: Prisma.BookingWhereInput = { providerId };

    if (status) {
      where.status = status;
    }

    if (date) {
      const baseDate = new Date(date);
      const startOfDay = new Date(baseDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(baseDate);
      endOfDay.setHours(23, 59, 59, 999);
      where.startTime = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    return this.prismaService.booking.findMany({
      where,
      include: {
        service: {
          select: {
            name: true,
          },
        },
        client: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        startTime: 'desc',
      },
    });
  }

  async findOne(userId: number, id: number) {
    const booking = await this.getFullBooking(id);

    if (booking.clientId !== userId && booking.providerId !== userId) {
      throw new ForbiddenException(
        'You are not authorized to view this booking.',
      );
    }

    return booking;
  }

  async cancel(userId: number, id: number, cancelBookingDto: CancelBookingDto) {
    const booking = await this.getFullBooking(id);

    if (!booking) {
      throw new NotFoundException('Booking not found.');
    }

    this.validateBookingCanBeModified(booking, userId, 'cancel');

    if (booking.providerGoogleEventId) {
      try {
        await this.googleCalendarService.deleteEvent(
          booking.providerId,
          booking.providerGoogleEventId,
        );
      } catch (error) {
        this.logger.error(
          `Failed to delete Google Calendar event for provider ${booking.providerId} for booking ${booking.id}:`,
          error instanceof Error ? error.stack : error,
        );
      }
    }

    if (booking.clientGoogleEventId) {
      try {
        await this.googleCalendarService.deleteEvent(
          booking.clientId,
          booking.clientGoogleEventId,
        );
      } catch (error) {
        this.logger.error(
          `Failed to delete Google Calendar event for client ${booking.clientId} for booking ${booking.id}:`,
          error instanceof Error ? error.stack : error,
        );
      }
    }

    const CanceledBooking = await this.prismaService.booking.update({
      where: { id },
      data: {
        status: BookingStatus.CANCELLED,
        cancelledAt: new Date(),
        updatedAt: new Date(),
        providerGoogleEventId: null,
        clientGoogleEventId: null,
        notes: cancelBookingDto.reason
          ? (booking.notes || '') +
            `\nCancellation Reason: ${cancelBookingDto.reason}`
          : booking.notes,
      },
    });

    const fullBooking = await this.getFullBooking(CanceledBooking.id);
    const cancelledBy = userId === fullBooking.clientId ? 'client' : 'provider';
    this.bookingGateway.notifyBookingCancelled(
      fullBooking.clientId,
      fullBooking.providerId,
      fullBooking,
      cancelledBy,
      cancelBookingDto.reason,
    );

    await this.mailQueue.sendCancellation(booking.id, cancelBookingDto.reason);

    return fullBooking;
  }

  async changeBookingStatus(bookingId: number, status: BookingStatus) {
    const booking = await this.getFullBooking(bookingId);

    if (!booking) {
      throw new NotFoundException('Booking not found.');
    }

    const updatedBooking = await this.prismaService.booking.update({
      where: { id: bookingId },
      data: { status },
    });

    return this.getFullBooking(updatedBooking.id);
  }

  async complete(userId: number, id: number) {
    const booking = await this.prismaService.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found.');
    }

    // Apenas o provider pode completar
    if (booking.providerId !== userId) {
      throw new ForbiddenException(
        'You are not authorized to complete this booking.',
      );
    }

    // Validar status - apenas bookings confirmados podem ser completados
    if (booking.status !== BookingStatus.CONFIRMED) {
      throw new BadRequestException(
        `Booking cannot be completed. Current status: ${booking.status.toLowerCase()}. Only confirmed bookings can be completed.`,
      );
    }

    await this.prismaService.booking.update({
      where: { id },
      data: {
        status: BookingStatus.COMPLETED,
        completedAt: new Date(),
      },
    });

    const fullBooking = await this.getFullBooking(id);
    this.bookingGateway.notifyBookingCompleted(
      fullBooking.clientId,
      fullBooking.providerId,
      fullBooking,
    );

    return fullBooking;
  }

  async reschedule(
    userId: number,
    id: number,
    rescheduleBookingDto: RescheduleBookingDto,
  ) {
    const { newStartTime } = rescheduleBookingDto;
    const oldStartTime = (await this.getFullBooking(id)).startTime;

    const booking = await this.prismaService.booking.findUnique({
      where: { id },
      include: { service: true, client: true, provider: true },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found.');
    }

    this.validateBookingCanBeModified(booking, userId, 'reschedule');

    const newBookingStartTime = new Date(newStartTime);
    const newBookingEndTime = addMinutes(
      newBookingStartTime,
      booking.service.duration,
    );

    if (isBefore(newBookingStartTime, new Date())) {
      throw new BadRequestException('New start time cannot be in the past.');
    }

    if (newBookingStartTime.getTime() === booking.startTime.getTime()) {
      throw new BadRequestException('New start time is the same as current.');
    }

    await this.validateSlotAvailability(
      booking.providerId,
      newBookingStartTime,
      newBookingEndTime,
      booking.id,
    );

    await this.validateProviderAvailability(
      booking.providerId,
      newBookingStartTime,
      newBookingEndTime,
    );

    await this.prismaService.booking.update({
      where: { id },
      data: {
        startTime: newBookingStartTime,
        endTime: newBookingEndTime,
        updatedAt: new Date(),
      },
    });

    const fullBooking = await this.getFullBooking(id);

    if (booking.providerGoogleEventId) {
      try {
        await this.googleCalendarService.updateEvent(
          booking.providerId,
          booking.providerGoogleEventId,
          fullBooking,
          'provider',
        );
      } catch (error) {
        this.logger.error(
          `Failed to update Google Calendar event for provider ${booking.providerId} for booking ${booking.id}:`,
          error,
        );
      }
    }

    if (booking.clientGoogleEventId) {
      try {
        await this.googleCalendarService.updateEvent(
          booking.clientId,
          booking.clientGoogleEventId,
          fullBooking,
          'client',
        );
      } catch (error) {
        this.logger.error(
          `Failed to update Google Calendar event for client ${booking.clientId} for booking ${booking.id}:`,
          error,
        );
      }
    }

    this.bookingGateway.notifyBookingRescheduled(
      fullBooking.clientId,
      fullBooking.providerId,
      fullBooking,
      oldStartTime,
    );

    return fullBooking;
  }
}
