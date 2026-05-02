import React from 'react';
import { CheckCircle2, X } from 'lucide-react';

export default function SuccessNotification({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-sm bg-slate-900 border border-emerald-500/30 rounded-[2rem] p-8 text-center shadow-2xl shadow-emerald-500/20 animate-in zoom-in duration-300">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>

        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
            <div className="relative bg-emerald-500/10 p-4 rounded-full border border-emerald-500/20">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-bounce" />
            </div>
          </div>
        </div>

        <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">Paiement Confirmé !</h3>
        <p className="text-slate-400 text-sm leading-relaxed mb-8">
          Votre transaction Stripe a été traitée avec succès. Votre facture a été mise à jour et votre projet se poursuit.
        </p>

        <button 
          onClick={onClose}
          className="w-full py-4 bg-emerald-500 text-slate-950 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-emerald-400 transition-all active:scale-95 shadow-xl shadow-emerald-500/20"
        >
          Continuer
        </button>
      </div>
    </div>
  );
}
