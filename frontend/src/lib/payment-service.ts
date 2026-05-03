const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface PaymentData {
  orderId: string;
  amount: number;
  method: 'card' | 'mobile' | 'bank';
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  phoneNumber?: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  message?: string;
  redirectUrl?: string;
}

export const paymentService = {
  async processPayment(paymentData: PaymentData): Promise<PaymentResult> {
    // Simulation de paiement (à remplacer par un vrai gateway)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simuler un succès pour les cartes de test
    const isTestCard = paymentData.cardNumber === '4242 4242 4242 4242';
    
    if (isTestCard || paymentData.method === 'mobile') {
      return {
        success: true,
        transactionId: `txn_${Date.now()}`,
        message: 'Paiement effectué avec succès',
      };
    }
    
    // Simuler une erreur aléatoire 10% du temps
    if (Math.random() < 0.1) {
      return {
        success: false,
        message: 'Erreur de paiement. Veuillez réessayer.',
      };
    }
    
    return {
      success: true,
      transactionId: `txn_${Date.now()}`,
      message: 'Paiement effectué avec succès',
    };
  },

  async createPaymentIntent(amount: number, currency: string = 'TND'): Promise<any> {
    const res = await fetch(`${API_URL}/payments/create-intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, currency }),
    });
    if (!res.ok) throw new Error('Erreur création intention de paiement');
    return res.json();
  },

  async verifyPayment(transactionId: string): Promise<PaymentResult> {
    const res = await fetch(`${API_URL}/payments/verify/${transactionId}`);
    if (!res.ok) throw new Error('Erreur vérification paiement');
    return res.json();
  },
};