import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateBookingDto {
  @IsNotEmpty()
  @Type(() => Date)
  startTime: Date;

  @IsNotEmpty()
  @Type(() => Date)
  endTime: Date;

  @IsNotEmpty()
  @IsString()
  notes?: string;

  @IsNotEmpty()
  @IsNumber()
  paymentIntentId: number;

  @IsNotEmpty()
  @Type(() => Date)
  paidAt?: Date;

  @IsNotEmpty()
  @Type(() => Date)
  cancelledAt?: Date;

  @IsNotEmpty()
  @Type(() => Date)
  completedAt?: Date;

  @IsNotEmpty()
  @IsNumber()
  serviceId: number;

  @IsNotEmpty()
  @IsNumber()
  clientId: number;

  @IsNotEmpty()
  @IsNumber()
  providerId: number;
}
