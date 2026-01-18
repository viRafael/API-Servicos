import { IsNumber, IsPositive } from 'class-validator';

export class CreatePaymentDto {
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsNumber()
  @IsPositive()
  paymentIntentId: string;

  @IsNumber()
  @IsPositive()
  paymentMethod: string;

  @IsNumber()
  @IsPositive()
  receiptUrl?: string;

  @IsNumber()
  @IsPositive()
  refundId?: string;

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
