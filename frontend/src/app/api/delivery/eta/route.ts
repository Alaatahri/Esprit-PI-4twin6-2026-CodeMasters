import { NextResponse } from 'next/server';
import { calculateComprehensiveETA } from '@/lib/delivery';

export async function POST(req: Request) {
  try {
    const { originLat, originLng, destLat, destLng, orderId } = await req.json();

    if (!originLat || !originLng || !destLat || !destLng || !orderId) {
      return NextResponse.json({ error: 'Missing coordinates or orderId' }, { status: 400 });
    }

    const origin = { lat: Number(originLat), lng: Number(originLng) };
    const destination = { lat: Number(destLat), lng: Number(destLng) };

    const etaData = await calculateComprehensiveETA(origin, destination);

    // If using a custom server with socket.io, we can emit an event to the client if there's a delay.
    // However, global.io might only be available in API routes if they are not running in Edge runtime.
    if (etaData.weatherDelay > 15) {
      const io = (global as any).io;
      if (io) {
        io.to(`delivery_${orderId}`).emit('delivery_delayed', {
          orderId,
          delayMinutes: etaData.weatherDelay,
          reason: etaData.delayReason,
          newETA: etaData.finalETA
        });
      }
    }

    return NextResponse.json(etaData);
  } catch (error: any) {
    console.error('ETA API Error:', error);
    return NextResponse.json({ error: 'Failed to calculate ETA' }, { status: 500 });
  }
}
