import { prisma } from './prisma';

/**
 * Reserves stock for a specific product for 15 minutes.
 * Uses a database transaction to prevent overselling.
 */
export async function reserveStock(productId: string, quantity: number, userId: string): Promise<{ success: boolean; message: string; orderId?: string }> {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Check current product stock
      const product = await tx.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new Error('Product not found');
      }

      if (product.currentStock < quantity) {
        throw new Error('Insufficient stock');
      }

      // 2. Calculate reservation expiry (15 minutes from now)
      const reserveUntil = new Date(Date.now() + 15 * 60 * 1000);

      // 3. Create a pending order to hold the reservation
      const order = await tx.order.create({
        data: {
          orderNumber: `INV-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(Math.random() * 10000)}`,
          userId,
          totalAmount: product.price * quantity,
          paymentStatus: 'PENDING',
          stockReservedUntil: reserveUntil,
          items: {
            create: [
              {
                productId: product.id,
                quantity: quantity,
                price: product.price,
              }
            ]
          }
        }
      });

      // 4. Decrease product stock temporarily
      await tx.product.update({
        where: { id: product.id },
        data: {
          currentStock: {
            decrement: quantity
          }
        }
      });

      // 5. Record the transaction
      await tx.stockTransaction.create({
        data: {
          productId: product.id,
          quantityChange: -quantity,
          type: 'SALE_RESERVATION',
        }
      });

      return order.id;
    });

    return { success: true, message: 'Stock reserved successfully', orderId: result };
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to reserve stock' };
  }
}

/**
 * Releases reserved stock if the payment wasn't completed in time.
 */
export async function releaseExpiredReservations() {
  const expiredOrders = await prisma.order.findMany({
    where: {
      paymentStatus: 'PENDING',
      stockReservedUntil: {
        lt: new Date()
      }
    },
    include: {
      items: true
    }
  });

  for (const order of expiredOrders) {
    await prisma.$transaction(async (tx) => {
      // Restore stock for each item
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            currentStock: {
              increment: item.quantity
            }
          }
        });

        await tx.stockTransaction.create({
          data: {
            productId: item.productId,
            quantityChange: item.quantity,
            type: 'RESERVATION_RELEASED',
          }
        });
      }

      // Mark order as failed/cancelled
      await tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'FAILED',
          stockReservedUntil: null
        }
      });
    });
  }

  return expiredOrders.length;
}

/**
 * Basic Moving Average prediction for stock-out date
 */
export async function predictStockOutDate(productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      transactions: {
        where: {
          type: 'SALE',
          timestamp: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // last 30 days
          }
        },
        orderBy: { timestamp: 'desc' }
      }
    }
  });

  if (!product || product.transactions.length === 0) return null;

  // Calculate average daily sales over the last 30 days
  const totalSold = product.transactions.reduce((acc, tx) => acc + Math.abs(tx.quantityChange), 0);
  const dailyAverage = totalSold / 30;

  if (dailyAverage <= 0) return null;

  const daysUntilStockOut = product.currentStock / dailyAverage;
  const predictedDate = new Date(Date.now() + daysUntilStockOut * 24 * 60 * 60 * 1000);

  // Update product with prediction
  await prisma.product.update({
    where: { id: productId },
    data: { predictedStockOutDate: predictedDate }
  });

  // Record prediction
  await prisma.prediction.create({
    data: {
      productId,
      predictedDate,
      confidence: 0.85, // Dummy confidence for now
    }
  });

  return predictedDate;
}
