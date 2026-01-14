import { IsNumber, IsPositive } from 'class-validator';

export class CreatePaymentDto {
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsNumber()
  @IsPositive()
  paymentIntentId: number;

  @IsNumber()
  @IsPositive()
  paymentMethod: number;

  @IsNumber()
  @IsPositive()
  receiptUrl?: number;

  @IsNumber()
  @IsPositive()
  refundId?: number;

  @IsNumber()
  @IsPositive()
  refundAmount: number;

  @IsNumber()
  @IsPositive()
  bookingId: number;

  @IsNumber()
  @IsPositive()
  userId: number;
}
