import { IsNumber, IsPositive } from 'class-validator';

export class UpdatePaymentDto {
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsNumber()
  @IsPositive()
  paymentMethod: number;

  @IsNumber()
  @IsPositive()
  receiptUrl?: number;

  @IsNumber()
  @IsPositive()
  refundAmount: number;
}
