import { Type } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateBookingDto {
  @IsNotEmpty()
  @Type(() => Date)
  startTime?: Date;

  @IsNotEmpty()
  @Type(() => Date)
  endTime?: Date;

  @IsNotEmpty()
  @IsString()
  notes?: string;

  @IsNotEmpty()
  @Type(() => Date)
  paidAt?: Date;

  @IsNotEmpty()
  @Type(() => Date)
  cancelledAt?: Date;

  @IsNotEmpty()
  @Type(() => Date)
  completedAt?: Date;
}
