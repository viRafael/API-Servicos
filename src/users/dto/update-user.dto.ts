import { IsEnum, IsNotEmpty, IsString, Min, Max } from 'class-validator';
import { UserRole } from 'src/auth/enum/roles.enum';

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

  @IsEnum(UserRole)
  role?: UserRole;
}
