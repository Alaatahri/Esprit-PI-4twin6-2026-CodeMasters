"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { fieldInputClass } from "@/lib/form-ui";

function ResetPasswordInner() {
  const params = useSearchParams();
  const token = params.get("token") || "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async () => {
    if (newPassword.length < 6) {
      setErrorMsg("Le mot de passe doit contenir au moins 6 caractères.");
      setStatus("error");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg("Les mots de passe ne correspondent pas.");
      setStatus("error");
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword, confirmPassword }),
      });
      const data = await res.json();
      if (res.ok) setStatus("success");
      else {
        setErrorMsg(data.message || "Lien invalide ou expiré.");
        setStatus("error");
      }
    } catch {
      setErrorMsg("Une erreur est survenue.");
      setStatus("error");
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center text-foreground">
        <p className="text-4xl" aria-hidden>
          ❌
        </p>
        <p className="text-destructive">Lien invalide ou manquant.</p>
        <Link
          href="/forgot-password"
          className="mt-2 font-medium text-brand hover:text-brand-muted hover:underline"
        >
          Redemander un lien
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10 text-foreground">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-bmp-md sm:p-10">
        <div className="mb-6 text-center">
          <h2 className="text-xl font-bold text-brand">Nouveau mot de passe</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Choisissez un nouveau mot de passe sécurisé.
          </p>
        </div>

        {status === "success" ? (
          <div className="space-y-4 text-center">
            <p className="text-4xl" aria-hidden>
              ✅
            </p>
            <p className="text-body-secondary">
              Mot de passe modifié avec succès !
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-xl bmp-btn-primary px-7 py-3 font-bold text-gray-900 shadow-bmp-md"
            >
              Se connecter
            </Link>
          </div>
        ) : (
          <>
            <label className="text-sm font-medium text-body-secondary">
              Nouveau mot de passe
            </label>
            <div className="relative mt-2">
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setStatus("idle");
                }}
                placeholder="6 caractères minimum"
                className={cn(fieldInputClass(false, status === "loading"), "pr-12")}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showNew ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showNew ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <label className="mt-4 block text-sm font-medium text-body-secondary">
              Confirmer le mot de passe
            </label>
            <div className="relative mt-2">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setStatus("idle");
                }}
                placeholder="Répétez le mot de passe"
                className={cn(fieldInputClass(false, status === "loading"), "pr-12")}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={
                  showConfirm ? "Masquer le mot de passe" : "Afficher le mot de passe"
                }
              >
                {showConfirm ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            {status === "error" && (
              <p className="mt-3 text-sm text-destructive" role="alert">
                {errorMsg}
              </p>
            )}

            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={status === "loading"}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bmp-btn-primary py-3 font-bold text-gray-900 shadow-bmp-md disabled:opacity-70"
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Mise à jour...
                </>
              ) : (
                "Changer mon mot de passe"
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
          Chargement…
        </div>
      }
    >
      <ResetPasswordInner />
    </Suspense>
  );
}
