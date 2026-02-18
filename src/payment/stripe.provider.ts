import { env } from 'src/utils/env-validator';
import Stripe from 'stripe';

export const StripeProvider = {
  provide: 'STRIPE_CLIENT',
  useFactory: () =>
    new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-01-28.clover',
    }),
};
