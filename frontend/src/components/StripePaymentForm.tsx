"use client";

import React, { useState } from 'react';

export default function StripePaymentForm({ amount, factureId }: any) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheckout = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/stripe/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, factureId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la création de la session');
      }

      if (data.demo) {
        // Au lieu d'une alerte, on simule une redirection vers une "fausse" page Stripe
        // pour montrer au client à quoi ça va ressembler.
        setLoading(true);
        setTimeout(() => {
          // Simulation de redirection vers le succès
          window.location.href = window.location.pathname + '?success=true';
        }, 1500);
        return;
      }

      // REDIRECTION RÉELLE (vers la page de votre image)
      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: '10px' }}>
      <div style={{
        padding: '30px 20px',
        background: 'rgba(255,255,255,0.02)',
        borderRadius: '24px',
        border: '1px solid rgba(255,255,255,0.05)',
        textAlign: 'center',
        marginBottom: '20px'
      }}>
        <div style={{ 
          width: '50px', height: '50px', background: '#6366f1', borderRadius: '12px', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', 
          margin: '0 auto 20px', boxShadow: '0 10px 20px rgba(99,102,241,0.2)' 
        }}>
          <span style={{ fontSize: '24px' }}>💳</span>
        </div>
        
        <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: 800, margin: '0 0 10px' }}>Paiement via Stripe</h3>
        <p style={{ color: '#94a3b8', fontSize: '12px', margin: '0 0 25px', lineHeight: 1.6 }}>
          Vous allez être redirigé vers l'interface sécurisée de <strong>Stripe Checkout</strong> pour finaliser votre paiement.
        </p>

        <button
          onClick={handleCheckout}
          disabled={loading}
          style={{
            width: '100%', padding: '18px', borderRadius: '14px', border: 'none',
            background: loading ? '#334155' : '#6366f1',
            color: '#fff', fontSize: '14px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px',
            cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.3s'
          }}
        >
          {loading ? 'Redirection...' : `Payer ${amount.toLocaleString('fr-TN')} TND`}
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', opacity: 0.4 }}>
        <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" style={{ height: '15px' }} />
      </div>
    </div>
  );
}
