"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { MessageCircle, Loader2, ChevronRight, User } from "lucide-react";
import { getStoredUser, normalizeRole } from "@/lib/auth";
import {
  fetchConversations,
  type ConversationRow,
} from "@/lib/messages-api";
import { BmpInsetPanel, BmpRowCard } from "@/components/bmp/surfaces";

function roleLabel(role?: string): string {
  if (!role) return "";
  const r = normalizeRole(role);
  if (r === "client") return "Client";
  if (r === "expert") return "Expert";
  if (r === "artisan") return "Artisan";
  return role;
}

export default function MessagesInboxPage() {
  const router = useRouter();
  const [rows, setRows] = useState<ConversationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    const u = getStoredUser();
    if (!u) {
      router.replace("/login");
      return;
    }
    setLoading(true);
    setErr(null);
    try {
      const data = await fetchConversations(u._id);
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Chargement impossible");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  const u = getStoredUser();

  if (!u) {
    return null;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:py-10">
      <div className="mb-8 flex items-center gap-3">
        <div className="rounded-2xl border border-brand/35 bg-brand/10 p-3 dark:bg-brand/15">
          <MessageCircle className="h-7 w-7 text-brand" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Messages</h1>
          <p className="text-sm text-muted-foreground">
            Vos conversations avec clients, experts et artisans.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-brand" />
        </div>
      ) : err ? (
        <div className="rounded-2xl border border-destructive/35 bg-destructive/10 px-4 py-3 text-sm text-destructive dark:text-red-200">
          {err}
        </div>
      ) : rows.length === 0 ? (
        <BmpInsetPanel className="space-y-3 py-12">
          <p className="text-sm text-muted-foreground">
            Aucune conversation pour le moment. Ouvrez un projet (ex. espace
            expert) et utilisez « Contacter » pour écrire à un client ou un
            artisan.
          </p>
          <Link
            href="/espace"
            className="inline-flex text-sm font-medium text-brand underline-offset-4 hover:text-brand-muted hover:underline"
          >
            Retour à l&apos;espace
          </Link>
        </BmpInsetPanel>
      ) : (
        <ul className="space-y-2">
          {rows.map((c) => (
            <li key={c.partnerId}>
              <Link href={`/messages/${c.partnerId}`}>
                <BmpRowCard className="flex cursor-pointer items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-brand/25 bg-gradient-to-br from-brand/20 to-brand-muted/15">
                    <User className="h-6 w-6 text-brand" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate font-semibold text-foreground">
                        {c.partnerNom || "Utilisateur"}
                      </p>
                      {c.unread > 0 && (
                        <span className="shrink-0 rounded-full bg-brand-muted px-2 py-0.5 text-[11px] font-bold text-brand-foreground">
                          {c.unread}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      {roleLabel(c.partnerRole)}
                    </p>
                    <p className="mt-1 truncate text-sm text-muted-foreground">
                      {c.lastBody}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                </BmpRowCard>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
