import { Controller, Post, Body } from '@nestjs/common';
import { StripeService } from './stripe.service';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('create-checkout-session')
  async createCheckoutSession(@Body() data: { factureId: string; amount: number; currency?: string }) {
    return this.stripeService.createCheckoutSession(data.factureId, data.amount, data.currency || 'eur');
  }

  @Post('create-payment-intent')
  async createPaymentIntent(@Body() data: { amount: number; currency?: string }) {
    return this.stripeService.createPaymentIntent(data.amount, data.currency || 'eur');
  }
}
