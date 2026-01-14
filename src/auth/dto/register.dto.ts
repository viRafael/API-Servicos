import { IsEmail, IsNotEmpty, IsString, Min, Max } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsString()
  @Min(6)
  @Max(18)
  password: string;

  @IsNotEmpty()
  @IsString()
  @Min(3)
  @Max(18)
  name: string;

  @IsNotEmpty()
  @IsString()
  phone: string;
}
