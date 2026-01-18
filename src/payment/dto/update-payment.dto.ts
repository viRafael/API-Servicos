import { IsNumber, IsPositive } from 'class-validator';

export class UpdatePaymentDto {
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsNumber()
  @IsPositive()
  paymentMethod: string;

  @IsNumber()
  @IsPositive()
  receiptUrl?: string;

  @IsNumber()
  @IsPositive()
  refundAmount: number;
}
