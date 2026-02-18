import { IsEnum, IsOptional, IsDateString } from 'class-validator';
import { BookingStatus } from 'src/generated/prisma/client';

export class FindBookingsAsProviderDto {
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @IsOptional()
  @IsDateString()
  date?: string;
}
