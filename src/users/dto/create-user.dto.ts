import { UserRole } from 'src/generated/prisma/client';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  Max,
  Min,
} from 'class-validator';

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
  phone: string;

  @IsNotEmpty()
  @IsEnum(UserRole)
  role: UserRole;
}
