import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripePaymentForm from './StripePaymentForm';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

// COMPOSANT DE SIMULATION (MOCK) QUI REPRODUIT EXACTEMENT VOTRE IMAGE
const MockStripeForm = ({ amount }: any) => {
  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '12px',
      padding: '24px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#30313d',
      maxWidth: '400px',
      margin: '0 auto',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      {/* Bouton Link */}
      <button style={{
        width: '100%',
        background: '#00d66f',
        color: '#fff',
        border: 'none',
        padding: '12px',
        borderRadius: '6px',
        fontSize: '15px',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        marginBottom: '20px',
        cursor: 'pointer'
      }}>
        Pay with <span style={{ background: '#000', color: '#fff', padding: '0 4px', borderRadius: '4px', fontSize: '12px' }}>link</span>
      </button>

      <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', color: '#6b7280', fontSize: '12px' }}>
        <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }}></div>
        <span style={{ padding: '0 10px' }}>Or pay with card</span>
        <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }}></div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>Email</label>
        <input type="email" placeholder="email@example.com" style={{
          width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px', outline: 'none'
        }} />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>Card information</label>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '6px', overflow: 'hidden' }}>
          <input type="text" placeholder="1234 1234 1234 1234" style={{
            width: '100%', padding: '12px', border: 'none', borderBottom: '1px solid #e5e7eb', outline: 'none'
          }} />
          <div style={{ display: 'flex' }}>
            <input type="text" placeholder="MM / YY" style={{ width: '50%', padding: '12px', border: 'none', borderRight: '1px solid #e5e7eb', outline: 'none' }} />
            <input type="text" placeholder="CVC" style={{ width: '50%', padding: '12px', border: 'none', outline: 'none' }} />
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>Cardholder name</label>
        <input type="text" placeholder="Full name on card" style={{
          width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px', outline: 'none'
        }} />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>Country or region</label>
        <select style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px', outline: 'none', background: '#fff' }}>
          <option>Tunisia</option>
          <option>France</option>
          <option>United States</option>
        </select>
      </div>

      <button 
        onClick={() => window.location.href = window.location.pathname + '?success=true'}
        style={{
          width: '100%',
          background: '#0055ff',
          color: '#fff',
          border: 'none',
          padding: '14px',
          borderRadius: '6px',
          fontSize: '15px',
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
      >
        Payer {amount.toLocaleString('fr-TN')} TND
      </button>
      
      <p style={{ marginTop: '16px', fontSize: '11px', color: '#6b7280', textAlign: 'center', lineHeight: 1.5 }}>
        En payant, vous acceptez les conditions de service et la politique de confidentialité.
      </p>
    </div>
  );
};

export default function StripeContainer({ amount, factureId }: any) {
  const [clientSecret, setClientSecret] = useState('');
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    const fetchIntent = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/stripe/create-payment-intent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount }),
        });
        const data = await response.json();
        if (data.demo || !response.ok) {
          setIsDemo(true);
        } else {
          setClientSecret(data.clientSecret);
        }
      } catch (err) {
        setIsDemo(true);
      }
    };
    fetchIntent();
  }, [amount]);

  // SI MODE DÉMO -> ON AFFICHE LE FORMULAIRE IDENTIQUE À L'IMAGE
  if (isDemo) {
    return <MockStripeForm amount={amount} />;
  }

  if (!clientSecret) return null;

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <StripePaymentForm amount={amount} factureId={factureId} />
    </Elements>
  );
}
