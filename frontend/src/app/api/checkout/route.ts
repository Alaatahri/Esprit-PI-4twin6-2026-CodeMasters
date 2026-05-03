import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { validateBulkOrder, CartItem } from '@/lib/bulkOrder';
import { reserveStock } from '@/lib/stock';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {
  apiVersion: '2025-02-24.acacia' as any,
});

export async function POST(req: Request) {
  try {
    const { items, userId, isVerifiedBusiness } = await req.json();

    if (!items || items.length === 0 || !userId) {
      return NextResponse.json({ error: 'Missing items or userId' }, { status: 400 });
    }

    // Validate Bulk Order
    const validation = validateBulkOrder(items, !!isVerifiedBusiness);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Reserve stock for all items
    const orderIds = [];
    for (const item of items) {
      const reserveResult = await reserveStock(item.productId, item.quantity, userId);
      if (!reserveResult.success) {
        return NextResponse.json({ error: `Failed to reserve stock for product ${item.productId}: ${reserveResult.message}` }, { status: 400 });
      }
      orderIds.push(reserveResult.orderId);
    }
    
    // In a real app, we would create a single Order for all items, but for now we are tracking the main order to pass to Stripe
    // Let's assume orderIds[0] is our reference or we create a master order. 
    // For simplicity, we just pass the first orderId in metadata to be updated on success.
    const masterOrderId = orderIds[0];

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map((item: any) => ({
        price_data: {
          currency: 'tnd', // Tunisian Dinar (or your preferred currency)
          product_data: {
            name: `Product ID: ${item.productId}`, // Replace with actual product name from DB ideally
          },
          // Apply discount proportionally to each item, or just set unit_amount. 
          // Note: Stripe requires integer amounts (in cents/millimes)
          unit_amount: Math.round(item.price * (1 - validation.discountPercent) * 1000), 
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/checkout/cancel`,
      metadata: {
        userId,
        orderId: masterOrderId,
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
