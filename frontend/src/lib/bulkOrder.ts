export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
}

export function validateBulkOrder(items: CartItem[], isVerifiedBusiness: boolean) {
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  if (subtotal < 500) {
    return {
      isValid: false,
      error: 'Minimum order amount is 500 TND for bulk purchases.',
      discountPercent: 0,
      discountAmount: 0,
      finalAmount: subtotal
    };
  }

  if (subtotal > 5000 && !isVerifiedBusiness) {
    return {
      isValid: false,
      error: 'Business verification is required for orders over 5000 TND.',
      discountPercent: 0,
      discountAmount: 0,
      finalAmount: subtotal
    };
  }

  let discountPercent = 0;

  if (subtotal >= 5000) {
    // Gold
    discountPercent = 0.15;
  } else if (subtotal >= 1000) {
    // Silver
    discountPercent = 0.10;
  } else if (subtotal >= 500) {
    // Bronze
    discountPercent = 0.05;
  }

  const discountAmount = subtotal * discountPercent;
  const finalAmount = subtotal - discountAmount;

  return {
    isValid: true,
    error: null,
    subtotal,
    discountPercent,
    discountAmount,
    finalAmount
  };
}
