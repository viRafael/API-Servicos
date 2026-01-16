import { IsNotEmpty, IsString, Min, Max } from 'class-validator';

export class UpdateUserDto {
  @IsNotEmpty()
  @IsString()
  @Min(3)
  @Max(18)
  name?: string;

  @IsNotEmpty()
  @IsString()
  @Min(3)
  @Max(18)
  phone?: string;
}
