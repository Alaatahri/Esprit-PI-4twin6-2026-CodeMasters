"use client";

import { useState, FormEvent, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Building2, Mail, Lock, Loader2, AlertCircle } from "lucide-react";
import {
  ensureAuthCookie,
  getStoredUser,
  normalizeRole,
  setAuthTokens,
  setStoredUser,
} from "@/lib/auth";
import { formatApiError } from "@/lib/api-error";
import { getApiBaseUrl } from "@/lib/api-base";
import { fieldInputClass } from "@/lib/form-ui";

const API_URL = getApiBaseUrl();

function safeReturnUrl(raw: string | null): string | null {
  if (!raw || typeof raw !== "string") return null;
  const t = raw.trim();
  if (!t.startsWith("/") || t.startsWith("//")) return null;
  return t;
}

function homeForRole(role: string): string {
  const r = normalizeRole(role);
  if (r === "client") return "/espace/client";
  if (r === "expert") return "/espace/expert";
  if (r === "artisan") return "/espace/artisan";
  if (r === "admin") return "/espace/admin";
  if (r === "livreur") return "/espace-livreur";
  if (r === "ouvrier") return "/espace";
  return "/espace";
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = safeReturnUrl(searchParams.get("returnUrl"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const existing = getStoredUser();
    if (existing) {
      router.replace(returnUrl ?? homeForRole(existing.role));
    }
  }, [router, returnUrl]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

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
        setError(formatApiError(data, "Email ou mot de passe incorrect"));
        setLoading(false);
        return;
      }

      if (!data.success || !data.user) {
        setError(formatApiError(data, "Email ou mot de passe incorrect"));
        setLoading(false);
        return;
      }

      const userToStore = {
        ...data.user,
        role: normalizeRole(data.user.role),
      };
      if (typeof window !== "undefined") {
        setStoredUser(userToStore);
        if (
          typeof data.accessToken === "string" &&
          data.accessToken.length > 0
        ) {
          setAuthTokens(
            data.accessToken,
            typeof data.refreshToken === "string"
              ? data.refreshToken
              : undefined,
          );
        } else {
          localStorage.setItem(
            "bmp_token",
            btoa(`${data.user._id}-${Date.now()}`),
          );
          ensureAuthCookie();
        }
      }

      const target = returnUrl ?? homeForRole(data.user.role);
      router.push(target);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Erreur de connexion au serveur",
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground dark:bg-gradient-to-b dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 dark:text-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md sm:max-w-lg">
        <Link
          href="/"
          className="flex items-center justify-center gap-3 mb-8 sm:mb-10 group"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-300 flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:shadow-amber-500/50 transition-shadow shrink-0">
            <Building2 className="w-7 h-7 text-gray-900" />
          </div>
          <div className="text-left min-w-0">
            <span className="text-2xl font-bold bg-gradient-to-r from-amber-300 via-white to-amber-100 bg-clip-text text-transparent">
              BMP.tn
            </span>
            <div className="text-xs text-blue-300/70 font-light tracking-widest mt-0.5">
              SIGN IN
            </div>
          </div>
        </Link>

        <div className="backdrop-blur-2xl bg-card/70 rounded-3xl p-6 sm:p-8 border border-border shadow-2xl dark:bg-white/10 dark:border-white/20">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground dark:text-white mb-2 text-center">
            Sign in
          </h1>
          <p className="text-muted-foreground text-center mb-6 sm:mb-8 text-sm dark:text-gray-400">
            Access your dashboard
          </p>

          <form noValidate onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            {error && (
              <div
                className="flex items-start gap-3 p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-200"
                role="alert"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span className="text-sm leading-relaxed">{error}</span>
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-muted-foreground mb-2 dark:text-gray-300"
              >
                Email <span className="text-red-400/90">*</span>
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400/70 pointer-events-none"
                  aria-hidden
                />
                <input
                  id="email"
                  name="email"
                  type="text"
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@exemple.tn"
                  disabled={loading}
                  className={fieldInputClass(false, loading, {
                    hasLeftIcon: true,
                  })}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-muted-foreground mb-2 dark:text-gray-300"
              >
                Password <span className="text-red-400/90">*</span>
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400/70 pointer-events-none"
                  aria-hidden
                />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                  className={fieldInputClass(false, loading, {
                    hasLeftIcon: true,
                  })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[52px] py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-900 font-bold text-base shadow-xl shadow-amber-500/30 hover:shadow-amber-500/50 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 touch-manipulation"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </button>

            <div className="flex items-center justify-between text-sm">
              <Link
                href="/forgot-password"
                className="text-brand hover:text-brand-muted underline-offset-4 hover:underline transition-colors"
              >
                Forgot password?
              </Link>
              <Link
                href="/inscription"
                className="text-muted-foreground hover:text-foreground underline-offset-4 hover:underline transition-colors"
              >
                Create account
              </Link>
            </div>
          </form>

          <p className="mt-6 text-center text-muted-foreground text-xs">
            If you don’t receive the email, check spam or contact an admin.
          </p>

          <div className="mt-6 pt-6 border-t border-border dark:border-white/10">
            <p className="text-xs text-foreground dark:text-gray-500 text-center mb-3">
              Test accounts (dev)
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                { label: "Client", email: "ahmed@example.com", pass: "password123" },
                { label: "Expert", email: "sara@example.com", pass: "password123" },
                { label: "Admin", email: "admin@bmp.tn", pass: "admin123" },
                { label: "Livreur", email: "sami@bmp.tn", pass: "livreur123" },
              ].map((c) => (
                <button
                  key={c.label}
                  type="button"
                  onClick={() => {
                    setEmail(c.email);
                    setPassword(c.pass);
                    setError("");
                  }}
                  className="px-3 py-1.5 rounded-lg bg-card/60 border border-border text-muted-foreground hover:text-brand hover:border-brand/35 text-xs transition-colors dark:bg-white/5 dark:border-white/10 dark:text-gray-400 dark:hover:text-amber-400 dark:hover:border-amber-500/30"
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-muted-foreground text-sm mt-6">
          <Link href="/" className="hover:text-amber-400 transition-colors">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">
          <Loader2 className="w-10 h-10 animate-spin text-amber-400/80" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
