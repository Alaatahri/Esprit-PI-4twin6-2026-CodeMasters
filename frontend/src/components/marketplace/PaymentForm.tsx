'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Smartphone, Building2, AlertCircle } from 'lucide-react';

interface PaymentFormProps {
  amount: number;
  onSubmit: (data: PaymentData) => void;
  loading?: boolean;
}

export interface PaymentData {
  method: 'card' | 'mobile' | 'bank';
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  phoneNumber?: string;
}

/** Validation métier (pas HTML5) — le flux paiement ne passe pas encore par un DTO Nest. */
export function validatePaymentData(data: PaymentData): string | null {
  if (data.method === 'card') {
    const pan = String(data.cardNumber ?? '').replace(/\s/g, '');
    if (!/^\d{13,19}$/.test(pan)) {
      return 'Indiquez un numéro de carte valide (13 à 19 chiffres).';
    }
    const exp = String(data.expiryDate ?? '').trim();
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(exp)) {
      return 'Indiquez une date d’expiration au format MM/AA.';
    }
    const cvvRaw = String(data.cvv ?? '').trim();
    if (!/^\d{3,4}$/.test(cvvRaw)) {
      return 'Indiquez un code CVV à 3 ou 4 chiffres.';
    }
    return null;
  }
  if (data.method === 'mobile') {
    const digits = String(data.phoneNumber ?? '').replace(/\D/g, '');
    if (digits.length < 8 || digits.length > 15) {
      return 'Indiquez un numéro de téléphone valide.';
    }
    return null;
  }
  return null;
}

export function PaymentForm({ amount, onSubmit, loading }: PaymentFormProps) {
  const [method, setMethod] = useState<'card' | 'mobile' | 'bank'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [formError, setFormError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: PaymentData = {
      method,
      cardNumber,
      expiryDate,
      cvv,
      phoneNumber,
    };
    const err = validatePaymentData(payload);
    if (err) {
      setFormError(err);
      return;
    }
    setFormError('');
    onSubmit(payload);
  };

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-6">
      {/* Mode de paiement */}
      <div>
        <label className="block text-sm font-medium text-muted-foreground dark:text-gray-300 mb-3">
          Mode de paiement
        </label>
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => {
              setMethod('card');
              setFormError('');
            }}
            className={`p-3 rounded-xl border text-center transition-all ${
              method === 'card'
                ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                : 'border-border dark:border-white/10 bg-black/5 dark:bg-white/5 text-muted-foreground dark:text-gray-400 hover:text-foreground dark:text-white'
            }`}
          >
            <CreditCard className="w-6 h-6 mx-auto mb-1" />
            <span className="text-xs">Carte bancaire</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMethod('mobile');
              setFormError('');
            }}
            className={`p-3 rounded-xl border text-center transition-all ${
              method === 'mobile'
                ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                : 'border-border dark:border-white/10 bg-black/5 dark:bg-white/5 text-muted-foreground dark:text-gray-400 hover:text-foreground dark:text-white'
            }`}
          >
            <Smartphone className="w-6 h-6 mx-auto mb-1" />
            <span className="text-xs">Mobile Money</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMethod('bank');
              setFormError('');
            }}
            className={`p-3 rounded-xl border text-center transition-all ${
              method === 'bank'
                ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                : 'border-border dark:border-white/10 bg-black/5 dark:bg-white/5 text-muted-foreground dark:text-gray-400 hover:text-foreground dark:text-white'
            }`}
          >
            <Building2 className="w-6 h-6 mx-auto mb-1" />
            <span className="text-xs">Virement bancaire</span>
          </button>
        </div>
      </div>

      {/* Formulaire selon méthode */}
      {method === 'card' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-muted-foreground dark:text-gray-300 mb-2">
              Numéro de carte
            </label>
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => {
                setFormError('');
                setCardNumber(e.target.value);
              }}
              placeholder="4242 4242 4242 4242"
              className="w-full rounded-xl bg-black/5 dark:bg-white/5 border border-border dark:border-white/15 px-4 py-3 text-foreground dark:text-white placeholder:text-foreground dark:text-gray-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground dark:text-gray-300 mb-2">
                Date d'expiration
              </label>
              <input
                type="text"
                value={expiryDate}
                onChange={(e) => {
                  setFormError('');
                  setExpiryDate(e.target.value);
                }}
                placeholder="MM/AA"
                className="w-full rounded-xl bg-black/5 dark:bg-white/5 border border-border dark:border-white/15 px-4 py-3 text-foreground dark:text-white placeholder:text-foreground dark:text-gray-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground dark:text-gray-300 mb-2">
                CVV
              </label>
              <input
                type="text"
                value={cvv}
                onChange={(e) => {
                  setFormError('');
                  setCvv(e.target.value);
                }}
                placeholder="123"
                className="w-full rounded-xl bg-black/5 dark:bg-white/5 border border-border dark:border-white/15 px-4 py-3 text-foreground dark:text-white placeholder:text-foreground dark:text-gray-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>
        </motion.div>
      )}

      {method === 'mobile' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <label className="block text-sm font-medium text-muted-foreground dark:text-gray-300 mb-2">
            Numéro de téléphone
          </label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => {
              setFormError('');
              setPhoneNumber(e.target.value);
            }}
            placeholder="XX XXX XXX"
            className="w-full rounded-xl bg-black/5 dark:bg-white/5 border border-border dark:border-white/15 px-4 py-3 text-foreground dark:text-white placeholder:text-foreground dark:text-gray-500 focus:outline-none focus:border-amber-500/50"
          />
          <p className="text-xs text-foreground dark:text-gray-500 mt-2">
            Vous recevrez un code de confirmation par SMS
          </p>
        </motion.div>
      )}

      {method === 'bank' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30"
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-blue-400" />
            <p className="text-sm text-blue-300 font-medium">Informations bancaires</p>
          </div>
          <p className="text-xs text-blue-200/70">
            Vous serez redirigé vers notre partenaire bancaire pour finaliser le paiement.
          </p>
        </motion.div>
      )}

      {formError && (
        <div
          className="flex items-start gap-2 rounded-xl border border-red-500/35 bg-red-500/10 p-3 text-sm text-red-300"
          role="alert"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {/* Montant à payer */}
      <div className="pt-4 border-t border-border dark:border-white/10">
        <div className="flex justify-between items-center mb-4">
          <span className="text-muted-foreground dark:text-gray-400">Montant à payer</span>
          <span className="text-2xl font-bold text-amber-400">{amount.toFixed(2)} TND</span>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-900 font-bold flex items-center justify-center gap-2 disabled:opacity-50 hover:shadow-lg hover:shadow-amber-500/30 transition-all"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 rounded-full border-2 border-gray-900 border-t-transparent animate-spin" />
              Traitement...
            </>
          ) : (
            'Confirmer le paiement'
          )}
        </button>
      </div>
    </form>
  );
}