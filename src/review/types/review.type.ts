import { Review, Booking, User, Service } from '@prisma/client';

export type FullReview = Review & {
  client: User;
  booking: Booking & {
    service: Service;
  };
  provider: User;
};
