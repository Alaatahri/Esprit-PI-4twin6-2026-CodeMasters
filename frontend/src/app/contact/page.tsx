"use client";

import Link from "next/link";
import { Building2, Mail, Phone, MapPin, ArrowLeft, Send } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background text-foreground dark:bg-gradient-to-b dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 dark:text-white">
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-background via-blue-100/25 to-background dark:from-gray-950/95 dark:via-blue-950/30 dark:to-gray-950/95" />
      <div className="relative z-10 container mx-auto px-4 py-16 sm:py-24">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-brand mb-12 transition-colors dark:text-gray-400 dark:hover:text-amber-700 dark:text-amber-300">
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-300 flex items-center justify-center">
              <Building2 className="w-7 h-7 text-gray-900" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-amber-600 to-amber-900 dark:from-amber-300 dark:to-white bg-clip-text text-transparent">
                Contact us
              </h1>
              <p className="text-muted-foreground mt-1 dark:text-gray-400">BMP.tn – Digital construction platform</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 mb-12">
            {[
              { icon: Mail, title: "Email", value: "contact@bmp.tn" },
              { icon: Phone, title: "Phone", value: "+216 70 000 000" },
              { icon: MapPin, title: "HQ", value: "Tunis, Tunisia" },
            ].map((item) => (
              <div
                key={item.title}
                className="backdrop-blur-xl bg-card/70 rounded-2xl p-6 border border-border shadow-bmp-xs dark:bg-white/10 dark:border-white/20"
              >
                <item.icon className="w-6 h-6 text-amber-400 mb-3" />
                <div className="text-muted-foreground text-sm dark:text-gray-400">{item.title}</div>
                <div className="text-foreground dark:text-white font-medium">{item.value}</div>
              </div>
            ))}
          </div>

          <div className="backdrop-blur-xl bg-card/70 rounded-2xl p-8 border border-border shadow-bmp-sm dark:bg-white/10 dark:border-white/20">
            <h2 className="text-xl font-bold text-foreground dark:text-white mb-4">Request a demo</h2>
            <p className="text-muted-foreground dark:text-gray-400 mb-6">
              Join professionals already optimizing their operations with BMP.tn.
            </p>
            <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-900 font-semibold hover:opacity-90 transition-opacity">
              <Send className="w-4 h-4" />
              Send a message
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
