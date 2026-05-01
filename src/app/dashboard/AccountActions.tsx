"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../../convex/_generated/api";
import type { Lang } from "@/lib/i18n";

const COPY: Record<Lang, {
  title: string;
  body: string;
  exportLabel: string;
  exporting: string;
  exportError: string;
  deleteLabel: string;
  deleteWarning: string;
  deleteConfirmPrompt: string;
  deletePhrase: string;
  deleteCancel: string;
  deleteConfirm: string;
  deleteWorking: string;
  deleteError: string;
}> = {
  nl: {
    title: "Account & gegevens",
    body: "Onder de AVG heb je het recht om al je gegevens te downloaden of je account te laten verwijderen.",
    exportLabel: "Mijn gegevens downloaden",
    exporting: "Bezig...",
    exportError: "Downloaden mislukt — probeer het opnieuw.",
    deleteLabel: "Account verwijderen",
    deleteWarning: "Dit verwijdert je profiel, voortgang en notities permanent. Bestellingen en facturen blijven 7 jaar bewaard voor de fiscus, maar zijn losgekoppeld van je account.",
    deleteConfirmPrompt: "Typ ter bevestiging onderstaande zin:",
    deletePhrase: "VERWIJDER MIJN ACCOUNT",
    deleteCancel: "Annuleren",
    deleteConfirm: "Definitief verwijderen",
    deleteWorking: "Bezig met verwijderen...",
    deleteError: "Verwijderen mislukt — probeer het opnieuw.",
  },
  en: {
    title: "Account & data",
    body: "Under GDPR you have the right to download all your data or to have your account deleted.",
    exportLabel: "Download my data",
    exporting: "Working...",
    exportError: "Download failed — please try again.",
    deleteLabel: "Delete account",
    deleteWarning: "This permanently deletes your profile, progress and notes. Orders and invoices are retained for 7 years for tax purposes but disconnected from your account.",
    deleteConfirmPrompt: "Type the phrase below to confirm:",
    deletePhrase: "DELETE MY ACCOUNT",
    deleteCancel: "Cancel",
    deleteConfirm: "Delete permanently",
    deleteWorking: "Deleting...",
    deleteError: "Deletion failed — please try again.",
  },
  de: {
    title: "Konto & Daten",
    body: "Unter der DSGVO haben Sie das Recht, all Ihre Daten herunterzuladen oder Ihr Konto löschen zu lassen.",
    exportLabel: "Meine Daten herunterladen",
    exporting: "Wird verarbeitet...",
    exportError: "Download fehlgeschlagen — bitte erneut versuchen.",
    deleteLabel: "Konto löschen",
    deleteWarning: "Dies löscht Profil, Fortschritt und Notizen unwiderruflich. Bestellungen und Rechnungen bleiben 7 Jahre für steuerliche Zwecke erhalten, sind aber vom Konto getrennt.",
    deleteConfirmPrompt: "Tippen Sie zur Bestätigung den folgenden Satz:",
    deletePhrase: "KONTO LÖSCHEN",
    deleteCancel: "Abbrechen",
    deleteConfirm: "Endgültig löschen",
    deleteWorking: "Wird gelöscht...",
    deleteError: "Löschung fehlgeschlagen — bitte erneut versuchen.",
  },
};

export function AccountActions({ lang }: { lang: Lang }) {
  const t = COPY[lang];
  // Backend phrase is fixed — UI prompt is per-language but server expects this exact string
  const SERVER_PHRASE = "VERWIJDER MIJN ACCOUNT";
  const exportData = useQuery(api.users.exportMyData);
  const deleteMyAccount = useMutation(api.users.deleteMyAccount);
  const { signOut } = useAuthActions();

  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmInput, setConfirmInput] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function handleExport() {
    if (!exportData) {
      setExportError(t.exportError);
      return;
    }
    setExporting(true);
    setExportError(null);
    try {
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `klaaskroezen-mijn-gegevens-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setExportError(t.exportError);
    } finally {
      setExporting(false);
    }
  }

  async function handleDelete() {
    if (confirmInput.trim() !== t.deletePhrase && confirmInput.trim() !== SERVER_PHRASE) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteMyAccount({ confirm: SERVER_PHRASE });
      await signOut();
      window.location.href = "/";
    } catch {
      setDeleteError(t.deleteError);
      setDeleting(false);
    }
  }

  const phraseMatches = confirmInput.trim() === t.deletePhrase || confirmInput.trim() === SERVER_PHRASE;

  return (
    <section className="mt-12 pt-10 border-t border-rule">
      <h2 className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/40 mb-3">{t.title}</h2>
      <p className="text-[13px] text-ink/55 leading-[1.7] max-w-[600px] mb-5">{t.body}</p>

      <div className="flex flex-wrap gap-3 mb-3">
        <button
          type="button"
          onClick={handleExport}
          disabled={exporting || exportData === undefined}
          className="inline-flex items-center gap-2 border border-rule px-4 py-2 text-[13px] text-ink/70 hover:text-ink hover:border-ink/30 rounded-[2px] cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {exporting ? t.exporting : t.exportLabel}
        </button>
        {!confirmOpen && (
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="inline-flex items-center gap-2 border border-red-300 px-4 py-2 text-[13px] text-red-600 hover:bg-red-50 rounded-[2px] cursor-pointer transition-colors"
          >
            {t.deleteLabel}
          </button>
        )}
      </div>

      {exportError && <p className="text-[12px] text-red-500" role="alert">{exportError}</p>}

      {confirmOpen && (
        <div className="mt-4 border border-red-300 bg-red-50/40 rounded-[2px] p-5 max-w-[600px]">
          <p className="text-[13px] text-ink leading-[1.7] mb-3">{t.deleteWarning}</p>
          <p className="text-[12px] text-ink/60 mb-2">{t.deleteConfirmPrompt}</p>
          <p className="text-[12px] font-mono font-medium text-ink mb-3 select-all">{t.deletePhrase}</p>
          <input
            type="text"
            value={confirmInput}
            onChange={(e) => setConfirmInput(e.target.value)}
            className="w-full bg-white border border-rule px-3 py-2 text-[14px] text-ink focus:border-red-400 focus:outline-none rounded-[2px] mb-3"
            placeholder={t.deletePhrase}
            autoFocus
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setConfirmOpen(false); setConfirmInput(""); setDeleteError(null); }}
              disabled={deleting}
              className="border border-rule px-4 py-2 text-[13px] text-ink/70 hover:text-ink hover:border-ink/30 rounded-[2px] cursor-pointer transition-colors disabled:opacity-50"
            >
              {t.deleteCancel}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={!phraseMatches || deleting}
              className="bg-red-600 text-paper px-4 py-2 text-[13px] hover:bg-red-700 rounded-[2px] cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleting ? t.deleteWorking : t.deleteConfirm}
            </button>
          </div>
          {deleteError && <p className="text-[12px] text-red-600 mt-2" role="alert">{deleteError}</p>}
        </div>
      )}
    </section>
  );
}
