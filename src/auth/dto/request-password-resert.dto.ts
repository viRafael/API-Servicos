import { IsEmail, IsNotEmpty } from 'class-validator';

export class RequestPasswordReset {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
