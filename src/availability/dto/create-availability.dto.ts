import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateAvailabilityDto {
  @IsNumber()
  dayOfWeek: number; // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado

  @IsString()
  @IsNotEmpty()
  startTime: string; // "09:00"

  @IsString()
  @IsNotEmpty()
  endTime: string; // "18:00"
}
