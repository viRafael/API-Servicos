import { IsEnum, IsOptional, IsDateString } from 'class-validator';
import { BookingStatus } from '@prisma/client'; // Assuming BookingStatus is an enum from Prisma client

export class FindBookingsAsProviderDto {
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @IsOptional()
  @IsDateString()
  date?: string;
}
