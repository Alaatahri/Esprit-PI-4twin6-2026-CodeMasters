import { NextResponse } from 'next/server';
import { reserveStock } from '@/lib/stock';

export async function POST(req: Request) {
  try {
    const { productId, quantity, userId } = await req.json();

    if (!productId || !quantity || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await reserveStock(productId, Number(quantity), userId);

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
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
