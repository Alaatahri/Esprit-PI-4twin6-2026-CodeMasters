"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Mail } from "lucide-react";
import { fieldInputClass } from "@/lib/form-ui";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [errorMsg, setErrorMsg] = useState("");
  const [mailMode, setMailMode] = useState<
    "smtp" | "ethereal" | "none" | null
  >(null);

  const handleSubmit = async () => {
    if (!email) {
      setErrorMsg("Veuillez saisir votre email.");
      setStatus("error");
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        const data = await res.json().catch(() => null);
        setMailMode(data?.mailMode ?? null);
        setStatus("success");
      } else {
        setErrorMsg("Une erreur est survenue.");
        setStatus("error");
      }
    } catch {
      setErrorMsg("Une erreur est survenue.");
      setStatus("error");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10 text-foreground">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-bmp-md sm:p-10">
        <div className="mb-6 text-center">
          <h2 className="text-xl font-bold text-brand">Mot de passe oublié</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Entrez votre email pour recevoir un lien de réinitialisation.
          </p>
        </div>

        {status === "success" ? (
          <div className="space-y-4 rounded-2xl border border-success/35 bg-success/10 p-5 text-center text-sm text-foreground">
            <p className="text-2xl" aria-hidden>
              📧
            </p>
            <p>
              Un lien a été envoyé à <strong>{email}</strong>.
              <br />
              {mailMode === "none" ? (
                <>
                  Aucun service e-mail n’est configuré sur le serveur (MAIL_*
                  manquantes).
                  <br />
                  Configure SMTP (Gmail app password) ou active
                  USE_ETHEREAL_IN_DEV=true.
                </>
              ) : mailMode === "ethereal" ? (
                <>
                  En mode dev, l’e-mail est simulé via Ethereal. Aucun mail Gmail
                  n’est livré.
                  <br />
                  Ouvre la prévisualisation (lien) dans la console backend.
                </>
              ) : (
                <>Vérifiez votre boîte mail (et les indésirables).</>
              )}
            </p>
            <Link
              href="/login"
              className="inline-block text-sm font-medium text-brand hover:text-brand-muted hover:underline"
            >
              ← Retour à la connexion
            </Link>
          </div>
        ) : (
          <>
            <label htmlFor="forgot-email" className="text-sm font-medium text-body-secondary">
              E-mail
            </label>
            <div className="relative mt-2">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-brand/70" />
              <input
                id="forgot-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setStatus("idle");
                }}
                placeholder="nom@exemple.tn"
                onKeyDown={(e) => e.key === "Enter" && void handleSubmit()}
                className={fieldInputClass(false, status === "loading", {
                  hasLeftIcon: true,
                })}
              />
            </div>
            {status === "error" && (
              <p className="mt-2 text-sm text-destructive" role="alert">
                {errorMsg}
              </p>
            )}
            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={status === "loading"}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bmp-btn-primary py-3 text-[15px] font-bold text-gray-900 transition-opacity disabled:opacity-70"
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                "Envoyer le lien"
              )}
            </button>
            <div className="mt-4 text-center">
              <Link
                href="/login"
                className="text-sm font-medium text-brand hover:text-brand-muted hover:underline"
              >
                ← Retour à la connexion
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
