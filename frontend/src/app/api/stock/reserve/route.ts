import { NextResponse } from 'next/server';
import { reserveStock } from '@/lib/stock';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { productId, quantity, userId } = body as {
      productId?: string;
      quantity?: number;
      userId?: string;
    };

    const headerUserId = req.headers.get('x-user-id')?.trim() || '';
    const effectiveUserId = (userId || headerUserId || '').trim();
    if (!effectiveUserId) {
      return NextResponse.json(
        { error: 'login_required', message: 'Veuillez vous connecter pour réserver du stock.' },
        { status: 401 },
      );
    }

    if (!productId || !quantity) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await reserveStock(productId, Number(quantity), effectiveUserId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: result.message,
      orderId: result.orderId
    });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
