import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: any;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
      apiVersion: '2025-01-27' as any,
    });
  }

  async createCheckoutSession(factureId: string, amount: number, currency: string = 'tnd') {
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_placeholder') {
      console.warn('⚠️ STRIPE_SECRET_KEY is placeholder. Demo Checkout Session.');
      return { url: 'https://checkout.stripe.com/demo_session', demo: true };
    }

    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: currency.toLowerCase(),
              product_data: {
                name: `Paiement Facture ${factureId}`,
              },
              unit_amount: Math.round(amount * 100),
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/gestion-devis-facturation?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/gestion-devis-facturation?canceled=true`,
      });

      return { url: session.url };
    } catch (error) {
      console.error('Stripe Checkout error:', error);
      throw error;
    }
  }

  async createPaymentIntent(amount: number, currency: string = 'tnd') {
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_placeholder') {
      console.warn('⚠️ STRIPE_SECRET_KEY is missing or placeholder. Running in DEMO MODE.');
      return { clientSecret: 'demo_intent_secret_success', demo: true };
    }

    try {
      const intent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: currency.toLowerCase(),
        automatic_payment_methods: {
          enabled: true,
        },
      });
      return { clientSecret: intent.client_secret };
    } catch (error) {
      console.error('Stripe error:', error);
      throw error;
    }
  }
}
