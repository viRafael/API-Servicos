import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreatePaymentIntentDto {
  @IsNumber()
  @IsNotEmpty()
  bookingId: number;
}
