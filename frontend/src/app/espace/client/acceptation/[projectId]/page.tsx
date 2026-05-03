"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, FileText, Loader2, CheckCircle2, Download, Upload } from "lucide-react";
import { getStoredUser } from "@/lib/auth";
import { getApiBaseUrl } from "@/lib/api-base";
import { SafeHtml, isProbablyHtml } from "@/components/SafeHtml";
import {
  type ClientContractRow,
  parseContractFromApiBody,
  parseContractRow,
} from "@/lib/contract-api";
import { readJsonSafe } from "@/lib/read-json-safe";
import { publicFileUrl } from "@/lib/backend-public-url";
import { downloadContractPdf, uploadClientSignedPdf } from "@/lib/contract-files";

const API_URL = getApiBaseUrl();

type Project = {
  _id: string;
  titre: string;
  description?: string;
  clientId: string | { _id?: string };
};

type ProposalRow = {
  _id: string;
  proposedPrice: number;
  estimatedDurationDays: number;
  technicalNotes: string;
  materialSuggestions?: string;
  status: string;
  createdAt?: string;
  clientCounterPrice?: number;
  clientCounterDurationDays?: number;
  clientCounterMessage?: string;
};

export default function AcceptationProjetPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = typeof params?.projectId === "string" ? params.projectId : "";

  const [project, setProject] = useState<Project | null>(null);
  const [proposals, setProposals] = useState<ProposalRow[]>([]);
  const [contract, setContract] = useState<ClientContractRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [signing, setSigning] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [pendingClientPdf, setPendingClientPdf] = useState<File | null>(null);

  const [counterPrice, setCounterPrice] = useState("");
  const [counterDays, setCounterDays] = useState("");
  const [counterMsg, setCounterMsg] = useState("");
  const [counteringId, setCounteringId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const canSign = useMemo(() => {
    return Boolean(contract && !contract.clientSignedAt);
  }, [contract]);

  const clientPdfHref = contract?.clientSignedPdfUrl
    ? publicFileUrl(contract.clientSignedPdfUrl)
    : null;

  const load = useCallback(async () => {
    const u = getStoredUser();
    if (!u) {
      router.replace("/login");
      return;
    }
    if (u.role !== "client") {
      router.replace("/espace");
      return;
    }
    if (!projectId) return;

    setLoading(true);
    setErr(null);
    try {
      const resP = await fetch(`${API_URL}/projects/${encodeURIComponent(projectId)}`, {
        cache: "no-store",
      });
      if (!resP.ok) throw new Error("Projet introuvable.");
      const p = (await resP.json()) as Project;
      const clientRef = typeof p.clientId === "object" && p.clientId && "_id" in p.clientId
        ? String((p.clientId as { _id: unknown })._id)
        : String(p.clientId);
      if (clientRef !== String(u._id)) {
        throw new Error("Ce projet ne vous appartient pas.");
      }
      setProject(p);

      const [resProps, resContract] = await Promise.all([
        fetch(`${API_URL}/proposals/by-project/${encodeURIComponent(projectId)}`, { cache: "no-store" }),
        fetch(`${API_URL}/contracts/by-project/${encodeURIComponent(projectId)}`, { cache: "no-store" }),
      ]);

      const propsRaw = await readJsonSafe(resProps);
      const props = resProps.ok && Array.isArray(propsRaw) ? (propsRaw as ProposalRow[]) : [];
      setProposals(props);

      if (resContract.ok) {
        const raw = await readJsonSafe(resContract);
        setContract(parseContractFromApiBody(raw));
      } else {
        setContract(null);
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erreur");
      setProject(null);
      setProposals([]);
      setContract(null);
    } finally {
      setLoading(false);
    }
  }, [projectId, router]);

  useEffect(() => {
    void load();
  }, [load]);

  const acceptProposal = async (proposalId: string) => {
    const u = getStoredUser();
    if (!u || u.role !== "client") return;
    setAcceptingId(proposalId);
    setErr(null);
    try {
      const res = await fetch(
        `${API_URL}/contracts/accept-proposal/${encodeURIComponent(proposalId)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": u._id,
          },
          body: JSON.stringify({
            clientName: String(u.nom || u.email || "Client"),
          }),
        },
      );
      const data = await readJsonSafe(res);
      if (!res.ok) {
        const raw = data && typeof data === "object" ? (data as { message?: unknown }).message : undefined;
        const msg = Array.isArray(raw) ? raw.join(" ") : typeof raw === "string" ? raw : `Erreur ${res.status}`;
        throw new Error(msg);
      }
      const c = parseContractRow(data);
      if (c) setContract(c);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erreur");
    } finally {
      setAcceptingId(null);
    }
  };

  const counterProposal = async (proposalId: string) => {
    const u = getStoredUser();
    if (!u || u.role !== "client") return;
    const p = Number(counterPrice.replace(/,/g, "."));
    const d = Number(counterDays.replace(/\D/g, ""));
    const msg = counterMsg.trim();
    if (!Number.isFinite(p) || p < 0) {
      setErr("Prix de contre-proposition invalide.");
      return;
    }
    if (!Number.isFinite(d) || d < 1) {
      setErr("Durée invalide (jours).");
      return;
    }
    if (!msg) {
      setErr("Indiquez un message pour votre contre-proposition.");
      return;
    }
    setCounteringId(proposalId);
    setErr(null);
    try {
      const res = await fetch(`${API_URL}/proposals/${encodeURIComponent(proposalId)}/counter`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": u._id,
        },
        body: JSON.stringify({
          proposedPrice: p,
          estimatedDurationDays: d,
          message: msg,
        }),
      });
      const data = await readJsonSafe(res);
      if (!res.ok) {
        const raw = data && typeof data === "object" ? (data as { message?: unknown }).message : undefined;
        const msgErr = Array.isArray(raw) ? raw.join(" ") : typeof raw === "string" ? raw : `Erreur ${res.status}`;
        throw new Error(msgErr);
      }
      setCounterPrice("");
      setCounterDays("");
      setCounterMsg("");
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erreur");
    } finally {
      setCounteringId(null);
    }
  };

  const cancelProject = async () => {
    const u = getStoredUser();
    if (!u || u.role !== "client" || !projectId) return;
    if (!window.confirm("Annuler ce projet ? Cette action marque la demande comme annulée.")) return;
    setCancelling(true);
    setErr(null);
    try {
      const res = await fetch(`${API_URL}/projects/${encodeURIComponent(projectId)}/cancel-by-client`, {
        method: "POST",
        headers: { "x-user-id": u._id },
      });
      const data = await readJsonSafe(res);
      if (!res.ok) {
        const raw = data && typeof data === "object" ? (data as { message?: unknown }).message : undefined;
        const msg = Array.isArray(raw) ? raw.join(" ") : typeof raw === "string" ? raw : `Erreur ${res.status}`;
        throw new Error(msg);
      }
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erreur");
    } finally {
      setCancelling(false);
    }
  };

  const handleDownloadPdf = async () => {
    const u = getStoredUser();
    if (!u || !contract?._id) return;
    setPdfBusy(true);
    setErr(null);
    try {
      await downloadContractPdf(API_URL, contract._id, u._id);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erreur téléchargement PDF.");
    } finally {
      setPdfBusy(false);
    }
  };

  const confirmClientUploadPdf = async () => {
    const u = getStoredUser();
    const file = pendingClientPdf;
    if (!file || !contract?._id || !u) return;
    setUploadBusy(true);
    setErr(null);
    try {
      const c = await uploadClientSignedPdf(API_URL, contract._id, u._id, file);
      setContract(c);
      setPendingClientPdf(null);
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Erreur envoi du PDF.");
    } finally {
      setUploadBusy(false);
    }
  };

  const signContract = async () => {
    const u = getStoredUser();
    if (!u || u.role !== "client" || !contract?._id) return;
    setSigning(true);
    setErr(null);
    try {
      const res = await fetch(`${API_URL}/contracts/${encodeURIComponent(contract._id)}/sign`, {
        method: "POST",
        headers: { "x-user-id": u._id },
      });
      const data = await readJsonSafe(res);
      if (!res.ok) {
        const raw = data && typeof data === "object" ? (data as { message?: unknown }).message : undefined;
        const msg = Array.isArray(raw) ? raw.join(" ") : typeof raw === "string" ? raw : `Erreur ${res.status}`;
        throw new Error(msg);
      }
      const c = parseContractRow(data);
      if (c) setContract(c);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erreur");
    } finally {
      setSigning(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-10 max-w-3xl space-y-6">
        <Link
          href={`/espace/client/suivi/${encodeURIComponent(projectId)}`}
          className="inline-flex items-center gap-2 text-sm text-brand hover:text-brand-muted dark:text-amber-400/90 dark:hover:text-amber-300"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au projet
        </Link>

        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
            <FileText className="h-6 w-6 text-brand dark:text-amber-300" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Acceptation & négociation</h1>
            <p className="text-sm text-muted-foreground">
              Acceptez une proposition, proposez une contre-offre, ou annulez le projet.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-10 h-10 animate-spin text-amber-400" />
          </div>
        ) : !project && err ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-800 dark:text-red-200">
            {err}
          </div>
        ) : project ? (
          <>
            {err ? (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-800 dark:text-red-200">
                {err}
              </div>
            ) : null}
            <div className="flex flex-wrap gap-3 justify-between items-start">
              <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 flex-1 min-w-[240px]">
                <p className="text-lg font-semibold text-foreground">{project.titre}</p>
                {project.description ? (
                  <p className="mt-2 text-sm text-muted-foreground">{project.description}</p>
                ) : null}
              </div>
              <button
                type="button"
                disabled={cancelling}
                onClick={() => void cancelProject()}
                className="rounded-2xl border border-red-500/35 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-800 hover:bg-red-500/20 disabled:opacity-50 dark:text-red-200"
              >
                {cancelling ? "…" : "Annuler le projet"}
              </button>
            </div>

            {contract ? (
              <section className="space-y-4 rounded-3xl border border-emerald-500/25 bg-emerald-500/[0.06] p-5 sm:p-6 dark:border-emerald-500/20 dark:bg-emerald-950/15">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-sm font-semibold text-foreground inline-flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-800 dark:text-emerald-300" />
                    Contrat généré
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Client signé: {contract.clientSignedAt ? "oui" : "non"} · Expert signé:{" "}
                    {contract.expertSignedAt ? "oui" : "non"}
                  </p>
                </div>

                <pre className="whitespace-pre-wrap text-[11px] text-body-secondary/90 rounded-2xl border border-border bg-muted dark:bg-black/30 p-4 max-h-80 overflow-auto scrollbar-bmp">
{contract.contractText}
                </pre>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  1) Téléchargez le PDF officiel. 2) Signez-le (signature manuscrite ou cachet). 3) Envoyez le PDF
                  signé ici — cela enregistre votre côté. 4) Vous pouvez aussi confirmer par signature électronique
                  sur la plateforme.
                </p>

                <div className="flex flex-wrap gap-2 items-center">
                  <button
                    type="button"
                    disabled={pdfBusy}
                    onClick={() => void handleDownloadPdf()}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-muted px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted disabled:opacity-40"
                  >
                    {pdfBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    Télécharger le PDF
                  </button>
                  <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-emerald-500/35 bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-950 hover:bg-emerald-500/20 disabled:opacity-40 dark:text-emerald-100">
                    <input
                      type="file"
                      accept="application/pdf,.pdf,application/octet-stream"
                      className="hidden"
                      disabled={uploadBusy}
                      onChange={(e) => {
                        const f = e.target.files?.[0] ?? null;
                        setPendingClientPdf(f);
                      }}
                    />
                    <Upload className="w-4 h-4" />
                    Choisir le PDF signé
                  </label>
                  <button
                    type="button"
                    disabled={!pendingClientPdf || uploadBusy}
                    onClick={() => void confirmClientUploadPdf()}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600/90 px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-emerald-600 disabled:opacity-40"
                  >
                    {uploadBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Valider l&apos;envoi
                  </button>
                </div>
                {pendingClientPdf ? (
                  <p className="text-xs text-muted-foreground">
                    Fichier sélectionné : {pendingClientPdf.name}
                  </p>
                ) : null}

                {clientPdfHref ? (
                  <p className="text-xs text-muted-foreground">
                    Votre PDF signé est enregistré :{" "}
                    <a
                      href={clientPdfHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand hover:underline dark:text-amber-300"
                    >
                      ouvrir / télécharger
                    </a>
                  </p>
                ) : null}

                <button
                  type="button"
                  disabled={!canSign || signing}
                  onClick={() => void signContract()}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bmp-btn-primary px-5 py-3 text-sm font-semibold text-gray-900 hover:opacity-95 disabled:opacity-40"
                >
                  {signing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Signature…
                    </>
                  ) : (
                    "Signer électroniquement (client)"
                  )}
                </button>
              </section>
            ) : (
              <section className="rounded-3xl border border-border bg-card p-5 sm:p-6 space-y-4">
                <h2 className="text-sm font-semibold text-foreground">Propositions reçues</h2>
                {proposals.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucune proposition pour le moment.</p>
                ) : (
                  <div className="space-y-4">
                    {proposals.map((p) => (
                      <div
                        key={p._id}
                        className="rounded-2xl border border-border bg-muted dark:bg-black/25 p-4 space-y-3"
                      >
                        <p className="text-[11px] uppercase text-muted-foreground">
                          Statut :{" "}
                          <span className="text-body-secondary">
                            {p.status === "sent"
                              ? "En attente de votre réponse"
                              : p.status === "countered"
                                ? "Négociation — en attente de l’expert"
                                : p.status === "accepted"
                                  ? "Acceptée"
                                  : p.status === "rejected"
                                    ? "Refusée"
                                    : p.status}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Prix:{" "}
                          <span className="font-semibold text-brand dark:text-amber-200">
                            {Math.round(p.proposedPrice).toLocaleString("fr-FR")} TND
                          </span>{" "}
                          · Durée:{" "}
                          <span className="text-body-secondary font-semibold">
                            {p.estimatedDurationDays} j
                          </span>
                        </p>
                        <div className="text-sm text-body-secondary rounded-xl border border-border bg-muted dark:bg-black/20 p-3">
                          {isProbablyHtml(p.technicalNotes) ? (
                            <SafeHtml html={p.technicalNotes} />
                          ) : (
                            <p className="whitespace-pre-wrap">{p.technicalNotes}</p>
                          )}
                        </div>
                        {p.materialSuggestions ? (
                          <div className="text-xs text-muted-foreground">
                            <span className="text-muted-foreground">Matériaux : </span>
                            {isProbablyHtml(p.materialSuggestions) ? (
                              <SafeHtml
                                html={p.materialSuggestions}
                                className="prose prose-invert prose-sm max-w-none inline text-body-secondary"
                              />
                            ) : (
                              p.materialSuggestions
                            )}
                          </div>
                        ) : null}

                        {p.status === "sent" ? (
                          <div className="flex flex-col sm:flex-row gap-2 pt-2">
                            <button
                              type="button"
                              disabled={acceptingId === p._id}
                              onClick={() => acceptProposal(p._id)}
                              className="inline-flex items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-2.5 text-sm font-semibold text-emerald-950 hover:bg-emerald-500/20 disabled:opacity-50 dark:text-emerald-100"
                            >
                              {acceptingId === p._id ? "Acceptation…" : "Accepter et générer le contrat"}
                            </button>
                          </div>
                        ) : null}

                        {p.status === "sent" ? (
                          <div className="rounded-xl border border-border bg-muted dark:bg-black/20 p-3 space-y-2">
                            <p className="text-xs font-medium text-body-secondary">Contre-proposition</p>
                            <div className="grid sm:grid-cols-2 gap-2">
                              <input
                                type="text"
                                inputMode="decimal"
                                placeholder="Votre prix (TND)"
                                value={counterPrice}
                                onChange={(e) => setCounterPrice(e.target.value)}
                                className="rounded-lg border border-border bg-muted dark:bg-black/40 px-3 py-2 text-sm"
                              />
                              <input
                                type="text"
                                inputMode="numeric"
                                placeholder="Durée souhaitée (jours)"
                                value={counterDays}
                                onChange={(e) => setCounterDays(e.target.value.replace(/\D/g, ""))}
                                className="rounded-lg border border-border bg-muted dark:bg-black/40 px-3 py-2 text-sm"
                              />
                            </div>
                            <textarea
                              value={counterMsg}
                              onChange={(e) => setCounterMsg(e.target.value)}
                              placeholder="Message (motifs, contraintes…)"
                              rows={3}
                              className="w-full rounded-lg border border-border bg-muted dark:bg-black/40 px-3 py-2 text-sm"
                            />
                            <button
                              type="button"
                              disabled={counteringId === p._id}
                              onClick={() => counterProposal(p._id)}
                              className="rounded-xl border border-sky-500/35 bg-sky-500/10 px-4 py-2 text-sm font-semibold text-sky-900 disabled:opacity-50 dark:text-sky-100"
                            >
                              {counteringId === p._id ? "Envoi…" : "Envoyer la contre-proposition"}
                            </button>
                          </div>
                        ) : null}

                        {p.status === "countered" ? (
                          <p className="text-xs text-amber-900/90 dark:text-amber-200/90">
                            Votre contre-proposition a été transmise. Dès que l&apos;expert aura révisé
                            son offre, vous pourrez accepter ou renégocier à nouveau.
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
