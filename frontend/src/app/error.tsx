"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";    

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="mb-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-500/20 to-amber-500/20 border border-red-500/30 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-12 h-12 text-red-400" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-4">Une erreur est survenue</h1>
          <p className="text-body-secondary mb-6">
            Une erreur inattendue s&apos;est produite. Notre équipe technique en a été informée.
          </p>
          <div className="bg-muted rounded-xl p-4 mb-6 border border-border">
            <code className="text-sm text-muted-foreground break-all">
              {error.message || "Erreur inconnue"}
            </code>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="px-6 py-3 rounded-xl bmp-btn-primary font-bold flex items-center justify-center gap-2 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Réessayer
          </button>
          
          <Link
            href="/"
            className="px-6 py-3 rounded-xl backdrop-blur-xl bg-muted border border-amber-500/30 text-foreground font-semibold flex items-center justify-center gap-2 hover:bg-accent transition-all"
          >
            <Home className="w-4 h-4" />
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
}