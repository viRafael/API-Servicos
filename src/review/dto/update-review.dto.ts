import {
  IsNumber,
  IsPositive,
  Min,
  Max,
  IsString,
  IsNotEmpty,
} from 'class-validator';

export class UpdateReviewDto {
  @IsNumber()
  @IsPositive()
  @Min(1)
  @Max(5)
  rating: number; // 1 a 5 estrelas

  @IsString()
  @IsNotEmpty()
  comment: string;
}
