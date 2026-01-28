import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateReviewDto {
  @IsNumber()
  @IsPositive()
  @Min(1)
  @Max(5)
  rating: number; // 1 a 5 estrelas

  @IsString()
  @IsNotEmpty()
  comment: string;

  @IsNumber()
  @IsPositive()
  bookingId: number;
}
