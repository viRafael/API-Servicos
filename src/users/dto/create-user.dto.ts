import { IsEmail, IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class CreateUserDto {
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
  @Min(3)
  @Max(18)
  phone: string;
}
