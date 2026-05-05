import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { generateInvoicePDF } from '@/lib/invoice';
import { sendInvoiceEmail } from '@/lib/email';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {
  apiVersion: '2025-02-24.acacia' as any,
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_dummy';

export async function POST(req: Request) {
  const payload = await req.text();
  const sig = req.headers.get('stripe-signature') as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
  } catch (err: any) {
    console.warn('Webhook signature verification failed (ignored in dev if dummy secret). Error:', err.message);
    // In production, you MUST return 400. For dummy tests, we'll parse it manually.
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    } else {
      event = JSON.parse(payload);
    }
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    const orderId = session.metadata?.orderId;
    
    if (orderId) {
      // 1. Update Order Status
      const order = await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'PAID',
          stripeSessionId: session.id,
          // Clear reservation expiry since it's paid
          stockReservedUntil: null, 
        },
        include: {
          user: true,
          items: {
            include: { product: true }
          }
        }
      });

      // 2. Generate PDF Invoice
      const invoiceData = {
        orderNumber: order.orderNumber,
        date: order.createdAt,
        customerName: order.user.name || 'Customer',
        customerEmail: order.user.email,
        items: order.items.map((item: (typeof order.items)[number]) => ({
          description: item.product.name,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: order.totalAmount,
        vatRate: 0.19, // 19% VAT
      };

      try {
        const pdfBuffer = await generateInvoicePDF(invoiceData);
        
        // 3. Send Email
        await sendInvoiceEmail(order.user.email, pdfBuffer, order.orderNumber);
      } catch (pdfError) {
        console.error('Error generating/sending PDF:', pdfError);
      }
    }
  }

  return NextResponse.json({ received: true });
}
