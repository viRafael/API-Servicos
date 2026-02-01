import { IsDateString, IsNumberString } from 'class-validator';

export class AvailableSlotsDto {
  @IsNumberString()
  providerId: number;

  @IsNumberString()
  serviceId: number;

  @IsDateString()
  date: string;
}
