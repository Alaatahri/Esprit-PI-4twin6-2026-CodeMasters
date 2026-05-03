"use client";

import { useState, FormEvent, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, Mail, Lock, Loader2, AlertCircle } from "lucide-react";
import { getStoredUser, normalizeRole, setStoredUser } from "@/lib/auth";
import { formatApiError } from "@/lib/api-error";
import { getApiBaseUrl } from "@/lib/api-base";
import { FieldError, fieldInputClass } from "@/lib/form-ui";
import { validateEmail, validateLoginPassword } from "@/lib/validators";
import { cn } from "@/lib/utils";

const API_URL = getApiBaseUrl();

type LoginField = "email" | "password";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [emailVerifyHint, setEmailVerifyHint] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<LoginField, string>>>({});
  const [loading, setLoading] = useState(false);

  const clearField = useCallback((key: LoginField) => {
    setFieldErrors((prev) => {
      const n = { ...prev };
      delete n[key];
      return n;
    });
  }, []);

  useEffect(() => {
    const existing = getStoredUser();
    if (existing) {
      const r = normalizeRole(existing.role);
      const target =
        r === "client"
          ? "/espace/client"
          : r === "expert"
            ? "/espace/expert"
            : r === "artisan"
              ? "/espace/artisan"
              : r === "livreur"
                ? "/espace/livreur"
                : r === "admin"
                  ? "/espace/admin"
                  : "/espace";
      router.replace(target);
    }
  }, [router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setEmailVerifyHint(false);
    setFieldErrors({});

    const eEmail = validateEmail(email);
    const ePw = validateLoginPassword(password);
    const next: Partial<Record<LoginField, string>> = {};
    if (eEmail) next.email = eEmail;
    if (ePw) next.password = ePw;
    if (Object.keys(next).length > 0) {
      setFieldErrors(next);
      setError("Veuillez corriger les champs indiqués.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          mot_de_passe: password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = formatApiError(data, "Email ou mot de passe incorrect");
        setError(msg);
        setEmailVerifyHint(
          res.status === 401 && /vérifier votre email/i.test(msg),
        );
        setLoading(false);
        return;
      }

      if (!data.success || !data.user) {
        const msg = data.message || "Email ou mot de passe incorrect";
        setError(msg);
        setEmailVerifyHint(/vérifier votre email/i.test(msg));
        setLoading(false);
        return;
      }

      const token = btoa(`${data.user._id}-${Date.now()}`);
      const userToStore = {
        ...data.user,
        role: normalizeRole(data.user.role),
      };
      if (typeof window !== "undefined") {
        setStoredUser(userToStore);
        localStorage.setItem("bmp_token", token);
      }

      const r = normalizeRole(data.user.role);
      const target =
        r === "client"
          ? "/espace/client"
          : r === "expert"
            ? "/espace/expert"
            : r === "artisan"
              ? "/espace/artisan"
              : r === "livreur"
                ? "/espace/livreur"
                : r === "admin"
                  ? "/espace/admin"
                  : "/espace";
      router.push(target);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Erreur de connexion au serveur",
      );
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10 text-foreground">
      <div className="w-full max-w-md sm:max-w-lg">
        <Link
          href="/espace"
          className="group mb-8 flex items-center justify-center gap-3 sm:mb-10"
        >
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bmp-icon-gradient transition-shadow group-hover:shadow-amber-500/40">
            <Building2 className="h-7 w-7 text-gray-900" />
          </div>
          <div className="min-w-0 text-left">
            <span className="bg-gradient-to-r from-brand via-brand-muted to-foreground bg-clip-text text-2xl font-bold text-transparent">
              BMP.tn
            </span>
            <div className="mt-0.5 text-xs font-light tracking-widest text-muted-foreground">
              CONNEXION
            </div>
          </div>
        </Link>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-bmp-md backdrop-blur-sm sm:p-8">
          <h1 className="mb-2 text-center text-xl font-bold text-foreground sm:text-2xl">
            Connexion
          </h1>
          <p className="mb-6 text-center text-sm text-muted-foreground sm:mb-8">
            Accédez à votre tableau de bord
          </p>

          <form noValidate onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            {error && (
              <div
                className={cn(
                  "flex items-start gap-3 rounded-xl border p-4",
                  emailVerifyHint
                    ? "border-brand/40 bg-brand/10 text-foreground dark:text-amber-100"
                    : "border-destructive/35 bg-destructive/10 text-destructive dark:text-red-200",
                )}
                role="alert"
              >
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <span className="text-sm leading-relaxed">{error}</span>
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-body-secondary"
              >
                E-mail <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-brand/70"
                  aria-hidden
                />
                <input
                  id="email"
                  name="email"
                  type="text"
                  inputMode="email"
                  autoComplete="email"
                  maxLength={254}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearField("email");
                  }}
                  placeholder="nom@exemple.tn"
                  disabled={loading}
                  aria-invalid={!!fieldErrors.email}
                  aria-describedby={fieldErrors.email ? "err-login-email" : undefined}
                  className={fieldInputClass(!!fieldErrors.email, loading, {
                    hasLeftIcon: true,
                  })}
                />
              </div>
              <FieldError id="err-login-email" message={fieldErrors.email} />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-body-secondary"
              >
                Mot de passe <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-brand/70"
                  aria-hidden
                />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  maxLength={128}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearField("password");
                  }}
                  placeholder="••••••••"
                  disabled={loading}
                  aria-invalid={!!fieldErrors.password}
                  aria-describedby={
                    fieldErrors.password ? "err-login-password" : undefined
                  }
                  className={fieldInputClass(!!fieldErrors.password, loading, {
                    hasLeftIcon: true,
                  })}
                />
              </div>
              <FieldError id="err-login-password" message={fieldErrors.password} />
              <div className="mt-1.5 text-right">
                <Link
                  href="/forgot-password"
                  className="text-[13px] font-medium text-brand hover:text-brand-muted hover:underline"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex min-h-[52px] w-full touch-manipulation items-center justify-center gap-2 rounded-xl bmp-btn-primary py-3.5 text-base font-bold text-gray-900 transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Connexion…
                </>
              ) : (
                "Se connecter"
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Pas encore de compte ?{" "}
            <Link
              href="/inscription"
              className="font-medium text-brand transition-colors hover:text-brand-muted hover:underline"
            >
              S&apos;inscrire
            </Link>
          </p>

          <div className="mt-6 border-t border-border pt-6">
            <p className="mb-3 text-center text-xs text-muted-foreground">
              Comptes de test (dev)
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                { label: "Client", email: "ahmed@example.com", pass: "password123" },
                { label: "Expert", email: "sara@example.com", pass: "password123" },
                { label: "Admin", email: "admin@bmp.tn", pass: "admin123" },
              ].map((c) => (
                <button
                  key={c.label}
                  type="button"
                  onClick={() => {
                    setEmail(c.email);
                    setPassword(c.pass);
                    setFieldErrors({});
                    setError("");
                  }}
                  className="rounded-lg border border-border bg-muted px-3 py-1.5 text-xs text-body-secondary transition-colors hover:border-brand/40 hover:text-brand"
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/espace" className="hover:text-brand hover:underline">
            ← Retour à l&apos;accueil
          </Link>
        </p>
      </div>
    </div>
  );
}
