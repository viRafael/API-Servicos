import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { AvailableSlotsDto } from './dto/available-slots.dto';
import { CancelBookingDto } from './dto/cancel-booking.dto';
import { RescheduleBookingDto } from './dto/reschedule-booking.dto';
import { FindAllBookingsDto } from './dto/find-all-bookings.dto';
import { FindBookingsAsProviderDto } from './dto/find-bookings-as-provider.dto';
import { addMinutes, isBefore } from 'date-fns';
import { BookingStatus, UserRole } from '@prisma/client';
import { Roles } from 'src/auth/enum/roles.enum';

@Injectable()
export class BookingService {
  constructor(private readonly prismaService: PrismaService) {}

  private validateBookingCanBeModified(
    booking: any,
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
    excludeBookingId?: number, // Para excluir o booking atual ao reagendar
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

  async findAvailableSlots(query: AvailableSlotsDto) {
    const { providerId, serviceId, date } = query;
    const searchDate = new Date(date);

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

    const dayOfWeek = searchDate.getDay(); // Sunday - 0, Saturday - 6

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

    // Pega agendamentos existentes para o provider para o dia especificado
    const startOfDay = new Date(searchDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(searchDate.setHours(23, 59, 59, 999));

    const existingBookings = await this.prismaService.booking.findMany({
      where: {
        providerId: +providerId,
        startTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          notIn: [BookingStatus.CANCELLED], // Consider only active/pending bookings
        },
      },
      select: {
        startTime: true,
        endTime: true,
      },
    });

    const availableSlots: { startTime: Date; endTime: Date }[] = [];
    availabilities.forEach((availability) => {
      let currentSlotStart = new Date(
        searchDate.setHours(
          parseInt(availability.startTime.split(':')[0]),
          parseInt(availability.startTime.split(':')[1]),
          0,
          0,
        ),
      );
      const availabilityEnd = new Date(
        searchDate.setHours(
          parseInt(availability.endTime.split(':')[0]),
          parseInt(availability.endTime.split(':')[1]),
          0,
          0,
        ),
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
            startTime: currentSlotStart,
            endTime: currentSlotEnd,
          });
        }
        currentSlotStart = addMinutes(currentSlotStart, service.duration);
      }
    });

    return { slots: availableSlots };
  }

  async create(clientId: number, createBookingDto: CreateBookingDto) {
    const { providerId, serviceId, startTime, notes } = createBookingDto;

    // 1. Validar provider
    const provider = await this.prismaService.user.findUnique({
      where: { id: providerId, role: UserRole.PROVIDER },
    });
    if (!provider) {
      throw new NotFoundException('Provider not found.');
    }

    // 2. Validar service
    const service = await this.prismaService.service.findUnique({
      where: { id: serviceId, providerId },
    });
    if (!service) {
      throw new NotFoundException('Service not found for this provider.');
    }

    // 3. Calcular horários
    const bookingStartTime = new Date(startTime);
    const bookingEndTime = addMinutes(bookingStartTime, service.duration);

    // 4. Validar disponibilidade do slot (reutilizando método)
    await this.validateSlotAvailability(
      providerId,
      bookingStartTime,
      bookingEndTime,
    );

    // 5. Validar disponibilidade do provider (reutilizando método)
    await this.validateProviderAvailability(
      providerId,
      bookingStartTime,
      bookingEndTime,
    );

    // 6. Criar booking
    return this.prismaService.booking.create({
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
  }

  async findAll(userId: number, userRole: Roles, query: FindAllBookingsDto) {
    const { status, startDate, endDate } = query;
    const where: any = {};

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
    const where: any = { providerId };

    if (status) {
      where.status = status;
    }

    if (date) {
      const searchDate = new Date(date);
      const startOfDay = new Date(searchDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(searchDate.setHours(23, 59, 59, 999));
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
    const booking = await this.prismaService.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found.');
    }

    if (booking.clientId !== userId && booking.providerId !== userId) {
      throw new ForbiddenException(
        'You are not authorized to view this booking.',
      );
    }

    return booking;
  }

  async cancel(userId: number, id: number, cancelBookingDto: CancelBookingDto) {
    const booking = await this.prismaService.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found.');
    }

    // Reutilizar validação
    this.validateBookingCanBeModified(booking, userId, 'cancel');

    return this.prismaService.booking.update({
      where: { id },
      data: {
        status: BookingStatus.CANCELLED,
        cancelledAt: new Date(),
        updatedAt: new Date(),
        notes: cancelBookingDto.reason
          ? (booking.notes || '') +
            `\nCancellation Reason: ${cancelBookingDto.reason}`
          : booking.notes,
      },
    });
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

    // Validar status
    if (
      booking.status === BookingStatus.COMPLETED ||
      booking.status === BookingStatus.CANCELLED
    ) {
      throw new BadRequestException(
        `Booking cannot be completed as it is ${booking.status.toLowerCase()}.`,
      );
    }

    return this.prismaService.booking.update({
      where: { id },
      data: {
        status: BookingStatus.COMPLETED,
        completedAt: new Date(),
      },
    });
  }

  async reschedule(
    userId: number,
    id: number,
    rescheduleBookingDto: RescheduleBookingDto,
  ) {
    const { newStartTime } = rescheduleBookingDto;

    const booking = await this.prismaService.booking.findUnique({
      where: { id },
      include: { service: true },
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

    return this.prismaService.booking.update({
      where: { id },
      data: {
        startTime: newBookingStartTime,
        endTime: newBookingEndTime,
        updatedAt: new Date(),
      },
    });
  }
}
