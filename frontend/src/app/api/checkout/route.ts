import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { validateBulkOrder, CartItem } from '@/lib/bulkOrder';
import { reserveStock } from '@/lib/stock';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {
  apiVersion: '2026-04-22.dahlia',
});

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { items, userId, isVerifiedBusiness } = body as {
      items?: CartItem[];
      userId?: string;
      isVerifiedBusiness?: boolean;
    };

    // Exiger login uniquement au moment de l'achat.
    // (Marketplace reste navigable sans compte.)
    const headerUserId =
      req.headers.get('x-user-id')?.trim() ||
      req.headers.get('x-userid')?.trim() ||
      '';
    const effectiveUserId = (userId || headerUserId || '').trim();
    if (!effectiveUserId) {
      return NextResponse.json(
        { error: 'login_required', message: 'Veuillez vous connecter pour acheter.' },
        { status: 401 },
      );
    }

    if (!items || items.length === 0) {
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
      const reserveResult = await reserveStock(item.productId, item.quantity, effectiveUserId);
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
      line_items: items.map((item: CartItem) => ({
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
        userId: effectiveUserId ?? '',
        orderId: masterOrderId ?? '',
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: unknown) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
