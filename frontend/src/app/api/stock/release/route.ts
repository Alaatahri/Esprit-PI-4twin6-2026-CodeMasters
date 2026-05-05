import { NextResponse } from 'next/server';
import { releaseExpiredReservations } from '@/lib/stock';

export async function POST() {
  try {
    const count = await releaseExpiredReservations();

    return NextResponse.json({
      message: `Released ${count} expired reservations`,
      count
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
