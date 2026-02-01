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
import { Public } from 'src/auth/decorator/public.decorator';

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Public()
  @Get('available-slots')
  findAvailableSlots(@Query() query: AvailableSlotsDto) {
    return this.bookingService.findAvailableSlots(query);
  }

  @SetRoleAccess(Roles.CLIENT)
  @UseGuards(AuthTokenGuard, RoleGuard)
  @Post()
  create(
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
    @Body() createBookingDto: CreateBookingDto,
  ) {
    return this.bookingService.create(tokenPayload.sub, createBookingDto);
  }

  @SetRoleAccess(Roles.CLIENT)
  @UseGuards(AuthTokenGuard, RoleGuard)
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

  @SetRoleAccess(Roles.CLIENT)
  @UseGuards(AuthTokenGuard, RoleGuard)
  @Get('my-bookings')
  findMyBookingsAsClient(@TokenPayloadParam() tokenPayload: TokenPayloadDto) {
    return this.bookingService.findMyBookingsAsClient(tokenPayload.sub);
  }

  @SetRoleAccess(Roles.PROVIDER)
  @UseGuards(AuthTokenGuard, RoleGuard)
  @Get('as-provider')
  findBookingsAsProvider(
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
    @Query() query: FindBookingsAsProviderDto,
  ) {
    return this.bookingService.findBookingsAsProvider(tokenPayload.sub, query);
  }

  @SetRoleAccess(Roles.CLIENT)
  @UseGuards(AuthTokenGuard)
  @Get(':id')
  findOne(
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
    @Param('id') id: number,
  ) {
    return this.bookingService.findOne(tokenPayload.sub, id);
  }

  @SetRoleAccess(Roles.CLIENT)
  @UseGuards(AuthTokenGuard, RoleGuard)
  @Patch(':id/cancel')
  cancel(
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
    @Param('id') id: number,
    @Body() cancelBookingDto: CancelBookingDto,
  ) {
    return this.bookingService.cancel(tokenPayload.sub, id, cancelBookingDto);
  }

  @SetRoleAccess(Roles.CLIENT)
  @UseGuards(AuthTokenGuard, RoleGuard)
  @Patch(':id/complete')
  complete(
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
    @Param('id') id: number,
  ) {
    return this.bookingService.complete(tokenPayload.sub, id);
  }

  @SetRoleAccess(Roles.CLIENT, Roles.PROVIDER)
  @UseGuards(AuthTokenGuard, RoleGuard)
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
