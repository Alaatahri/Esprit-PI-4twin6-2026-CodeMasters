"use client";

import Link from "next/link";
import { FileText, ArrowLeft, ChevronRight } from "lucide-react";

export default function GestionDevisPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="relative z-10 container mx-auto px-4 py-16 sm:py-24">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-amber-300 mb-12 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Accueil
        </Link>
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-400 flex items-center justify-center mx-auto mb-8">
            <FileText className="w-10 h-10 text-foreground" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Devis & Facturation IA</h1>
          <p className="text-muted-foreground mb-8">
            Devis et facturation automatisés avec analyse prédictive. Cette section sera bientôt disponible.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bmp-btn-primary font-semibold"
          >
            Accéder au tableau de bord
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
