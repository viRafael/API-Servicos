import { Controller, Post, Req, Res, Headers, Logger } from '@nestjs/common';
import type { Request, Response } from 'express';
import { StripeWebhookService } from './webhook-stripe.service';

@Controller('webhooks/stripe')
export class StripeWebhookController {
  private readonly logger = new Logger(StripeWebhookController.name);
  constructor(private readonly webhookService: StripeWebhookService) {}

  @Post()
  async handleStripeWebhook(
    @Req() req: Request,
    @Res() res: Response,
    @Headers('stripe-signature') signature: string,
  ) {
    try {
      await this.webhookService.handleEvent(req.body, signature);
    } catch (error) {
      this.logger.error('Error handling stripe webhook', error);
      return res.status(500).send({ error: 'Internal Server Error' });
    }

    return res.status(200).send({ received: true });
  }
}
