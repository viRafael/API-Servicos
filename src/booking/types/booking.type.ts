import { Booking, Payment, Service, User } from 'src/generated/prisma/client';

export type FullBooking = Booking & {
  client: User;
  provider: User;
  service: Service;
  payment?: Payment | null;
};
