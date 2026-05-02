"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../../convex/_generated/api";
import type { Lang } from "@/lib/i18n";

const COPY: Record<Lang, {
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
    exportLabel: "Mijn gegevens",
    exporting: "Bezig...",
    exportError: "Downloaden mislukt",
    deleteLabel: "Account verwijderen",
    deleteWarning: "Dit verwijdert je profiel, voortgang en notities permanent. Bestellingen en facturen blijven 7 jaar bewaard voor de fiscus, maar zijn losgekoppeld van je account.",
    deleteConfirmPrompt: "Typ ter bevestiging:",
    deletePhrase: "VERWIJDER MIJN ACCOUNT",
    deleteCancel: "Annuleren",
    deleteConfirm: "Definitief verwijderen",
    deleteWorking: "Bezig...",
    deleteError: "Verwijderen mislukt",
  },
  en: {
    exportLabel: "My data",
    exporting: "Working...",
    exportError: "Download failed",
    deleteLabel: "Delete account",
    deleteWarning: "This permanently deletes your profile, progress and notes. Orders and invoices are retained for 7 years for tax purposes but disconnected from your account.",
    deleteConfirmPrompt: "Type to confirm:",
    deletePhrase: "DELETE MY ACCOUNT",
    deleteCancel: "Cancel",
    deleteConfirm: "Delete permanently",
    deleteWorking: "Working...",
    deleteError: "Deletion failed",
  },
  de: {
    exportLabel: "Meine Daten",
    exporting: "Wird verarbeitet...",
    exportError: "Download fehlgeschlagen",
    deleteLabel: "Konto löschen",
    deleteWarning: "Dies löscht Profil, Fortschritt und Notizen unwiderruflich. Bestellungen und Rechnungen bleiben 7 Jahre für steuerliche Zwecke erhalten.",
    deleteConfirmPrompt: "Zur Bestätigung tippen:",
    deletePhrase: "KONTO LÖSCHEN",
    deleteCancel: "Abbrechen",
    deleteConfirm: "Endgültig löschen",
    deleteWorking: "Wird verarbeitet...",
    deleteError: "Löschung fehlgeschlagen",
  },
};

const SERVER_PHRASE = "VERWIJDER MIJN ACCOUNT";
const LINK_CLASS = "text-[12px] text-paper/40 hover:text-paper/60 transition-colors duration-150 cursor-pointer";

export function FooterAccountActions({ lang }: { lang: Lang }) {
  const t = COPY[lang];
  const user = useQuery(api.users.getCurrentUser);
  const exportData = useQuery(api.users.exportMyData, user ? {} : "skip");
  const deleteMyAccount = useMutation(api.users.deleteMyAccount);
  const { signOut } = useAuthActions();

  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmInput, setConfirmInput] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  if (!user) return null;

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
    <>
      <button
        type="button"
        onClick={handleExport}
        disabled={exporting || exportData === undefined}
        className={`${LINK_CLASS} disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {exporting ? t.exporting : t.exportLabel}
      </button>
      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        className={LINK_CLASS}
      >
        {t.deleteLabel}
      </button>
      {exportError && (
        <span className="text-[12px] text-red-300/70" role="alert">
          {exportError}
        </span>
      )}

      {confirmOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/70 px-7"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget && !deleting) {
              setConfirmOpen(false);
              setConfirmInput("");
              setDeleteError(null);
            }
          }}
        >
          <div className="bg-paper border border-rule rounded-[2px] p-6 max-w-[480px] w-full">
            <h3 className="font-display text-[18px] font-bold text-ink mb-3">
              {t.deleteLabel}
            </h3>
            <p className="text-[13px] text-ink/70 leading-[1.7] mb-4">{t.deleteWarning}</p>
            <p className="text-[12px] text-ink/60 mb-2">{t.deleteConfirmPrompt}</p>
            <p className="text-[12px] font-mono font-medium text-ink mb-3 select-all">
              {t.deletePhrase}
            </p>
            <input
              type="text"
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              className="w-full bg-white border border-rule px-3 py-2 text-[14px] text-ink focus:border-red-400 focus:outline-none rounded-[2px] mb-3"
              placeholder={t.deletePhrase}
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => {
                  setConfirmOpen(false);
                  setConfirmInput("");
                  setDeleteError(null);
                }}
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
            {deleteError && (
              <p className="text-[12px] text-red-600 mt-2" role="alert">
                {deleteError}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
