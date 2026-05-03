"use client";

import Link from "next/link";
import { Building2, Mail, Phone, MapPin, ArrowLeft, Send } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="relative z-10 container mx-auto px-4 py-16 sm:py-24">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-amber-300 mb-12 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Retour à l&apos;accueil
        </Link>

        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-14 h-14 rounded-xl bmp-icon-gradient flex items-center justify-center">
              <Building2 className="w-7 h-7 text-gray-900" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-amber-300 to-white bg-clip-text text-transparent">
                Contactez-nous
              </h1>
              <p className="text-muted-foreground mt-1">BMP.tn – Plateforme de construction digitale</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 mb-12">
            {[
              { icon: Mail, title: "Email", value: "contact@bmp.tn" },
              { icon: Phone, title: "Téléphone", value: "+216 70 000 000" },
              { icon: MapPin, title: "Siège", value: "Tunis, Tunisie" },
            ].map((item) => (
              <div
                key={item.title}
                className="backdrop-blur-xl bg-muted rounded-2xl p-6 border border-border"
              >
                <item.icon className="w-6 h-6 text-amber-400 mb-3" />
                <div className="text-muted-foreground text-sm">{item.title}</div>
                <div className="text-foreground font-medium">{item.value}</div>
              </div>
            ))}
          </div>

          <div className="backdrop-blur-xl bg-muted rounded-2xl p-8 border border-border">
            <h2 className="text-xl font-bold text-foreground mb-4">Demander une démonstration</h2>
            <p className="text-muted-foreground mb-6">
              Rejoignez les professionnels qui optimisent déjà leurs opérations avec BMP.tn.
            </p>
            <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bmp-btn-primary font-semibold hover:opacity-90 transition-opacity">
              <Send className="w-4 h-4" />
              Envoyer un message
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
