export class CreateServiceDto {
  providerId: number;
  name: string;
  description?: string;
  duration: number;
  price: number;
  category?: string;
}
