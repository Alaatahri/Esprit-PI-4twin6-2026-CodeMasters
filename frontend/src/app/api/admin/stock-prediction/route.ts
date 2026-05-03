import { NextResponse } from 'next/server';
import { predictStockOutDate } from '@/lib/stock';

export async function POST(req: Request) {
  try {
    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const predictedDate = await predictStockOutDate(productId);

    return NextResponse.json({
      productId,
      predictedDate,
      message: predictedDate ? 'Prediction generated successfully' : 'Not enough data to predict'
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
