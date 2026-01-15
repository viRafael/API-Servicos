import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { AvailableSlotsDto } from './dto/available-slots.dto';
import { CancelBookingDto } from './dto/cancel-booking.dto';
import { RescheduleBookingDto } from './dto/reschedule-booking.dto';
import { FindAllBookingsDto } from './dto/find-all-bookings.dto';
import { FindBookingsAsProviderDto } from './dto/find-bookings-as-provider.dto';
import { AuthTokenGuard } from 'src/auth/guards/auth-token.guard';
import { SetRoleAccess } from 'src/auth/decorator/set-role.decorator';
import { Roles } from 'src/auth/enum/roles.enum';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { TokenPayloadParam } from 'src/auth/params/token-payload.param';
import { TokenPayloadDto } from 'src/auth/dto/token-payload.dto';

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Get('available-slots')
  findAvailableSlots(@Query() query: AvailableSlotsDto) {
    return this.bookingService.findAvailableSlots(query);
  }

  @UseGuards(AuthTokenGuard, RoleGuard)
  @SetRoleAccess(Roles.CLIENT)
  @Post()
  create(
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
    @Body() createBookingDto: CreateBookingDto,
  ) {
    return this.bookingService.create(tokenPayload.sub, createBookingDto);
  }

  @UseGuards(AuthTokenGuard, RoleGuard)
  @SetRoleAccess(Roles.CLIENT, Roles.PROVIDER)
  @Get()
  findAll(
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
    @Query() query: FindAllBookingsDto,
  ) {
    return this.bookingService.findAll(
      tokenPayload.sub,
      tokenPayload.role,
      query,
    );
  }

  @UseGuards(AuthTokenGuard, RoleGuard)
  @SetRoleAccess(Roles.CLIENT)
  @Get('my-bookings')
  findMyBookingsAsClient(@TokenPayloadParam() tokenPayload: TokenPayloadDto) {
    return this.bookingService.findMyBookingsAsClient(tokenPayload.sub);
  }

  @UseGuards(AuthTokenGuard, RoleGuard)
  @SetRoleAccess(Roles.PROVIDER)
  @Get('as-provider')
  findBookingsAsProvider(
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
    @Query() query: FindBookingsAsProviderDto,
  ) {
    return this.bookingService.findBookingsAsProvider(tokenPayload.sub, query);
  }

  @UseGuards(AuthTokenGuard)
  @Get(':id')
  findOne(
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
    @Param('id') id: number,
  ) {
    return this.bookingService.findOne(tokenPayload.sub, id);
  }

  @UseGuards(AuthTokenGuard, RoleGuard)
  @SetRoleAccess(Roles.CLIENT, Roles.PROVIDER)
  @Patch(':id/cancel')
  cancel(
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
    @Param('id') id: number,
    @Body() cancelBookingDto: CancelBookingDto,
  ) {
    return this.bookingService.cancel(tokenPayload.sub, id, cancelBookingDto);
  }

  @UseGuards(AuthTokenGuard, RoleGuard)
  @SetRoleAccess(Roles.PROVIDER)
  @Patch(':id/complete')
  complete(
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
    @Param('id') id: number,
  ) {
    return this.bookingService.complete(tokenPayload.sub, id);
  }

  @UseGuards(AuthTokenGuard, RoleGuard)
  @SetRoleAccess(Roles.CLIENT, Roles.PROVIDER)
  @Patch(':id/reschedule')
  reschedule(
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
    @Param('id') id: number,
    @Body() rescheduleBookingDto: RescheduleBookingDto,
  ) {
    return this.bookingService.reschedule(
      tokenPayload.sub,
      id,
      rescheduleBookingDto,
    );
  }
}
