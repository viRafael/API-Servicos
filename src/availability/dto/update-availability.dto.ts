import { IsNumber, IsString, IsNotEmpty } from 'class-validator';

export class UpdateAvailabilityDto {
  @IsNumber()
  dayOfWeek: number; // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado

  @IsString()
  @IsNotEmpty()
  startTime: string; // "09:00"

  @IsString()
  @IsNotEmpty()
  endTime: string; // "18:00"
}
