import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { Roles } from '../enum/roles.enum';

export class TokenPayloadDto {
  @IsNotEmpty()
  @IsNumber()
  sub: number;

  @IsNotEmpty()
  @IsEnum(Roles)
  role: Roles;

  @IsNotEmpty()
  @IsNumber()
  iat: number;

  @IsNotEmpty()
  @IsNumber()
  exp: number;

  @IsNotEmpty()
  @IsNumber()
  aud: string;

  @IsNotEmpty()
  @IsNumber()
  iss: string;
}
