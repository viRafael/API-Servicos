import { IsEnum, IsOptional, IsDateString } from 'class-validator';
import { BookingStatus } from '@prisma/client'; // Assuming BookingStatus is an enum from Prisma client

export class FindAllBookingsDto {
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
