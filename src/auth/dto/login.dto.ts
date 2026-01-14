import { IsEmail, IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Min(8)
  @Max(24)
  password: string;
}
