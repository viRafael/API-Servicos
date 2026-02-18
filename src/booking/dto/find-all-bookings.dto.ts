import { IsEnum, IsOptional, IsDateString } from 'class-validator';
import { BookingStatus } from 'src/generated/prisma/client';

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
