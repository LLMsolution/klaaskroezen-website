"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

interface Props {
  trainingId: Id<"trainings">;
  trainingTitle: string;
}

export function CertificateButton({ trainingId, trainingTitle }: Props) {
  const modules = useQuery(api.trainings.getModulesForTraining, { trainingId });
  const progress = useQuery(api.trainingProgress.getMyTrainingProgress, { trainingId });
  const user = useQuery(api.users.getCurrentUser);

  if (!modules || !progress) return null;

  const quizModules = modules.filter((m) => m.active && m.quizRequired);
  const passedModules = quizModules.filter((m) => {
    const p = progress.find((pr) => pr.moduleId === m._id);
    return p?.quizPassed;
  });

  const allPassed = quizModules.length > 0 && passedModules.length === quizModules.length;

  function handleDownload() {
    // Generate certificate HTML in browser (opens print preview)
    if (!user) return;
    const name = user.name || user.email;
    const date = new Date().toLocaleDateString("nl-NL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const html = buildCertificateHtml(name, trainingTitle, date);
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
    }
  }

  return (
    <div className="my-8 border border-rule rounded-[2px] p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper mb-1">
            Certificaat
          </p>
          <p className="text-[14px] text-ink/60">
            {passedModules.length} van {quizModules.length} quizzes gehaald
          </p>
        </div>
        {allPassed ? (
          <button
            onClick={handleDownload}
            className="bg-copper text-paper px-5 py-2.5 text-[12px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors rounded-[2px] cursor-pointer"
          >
            Download certificaat
          </button>
        ) : (
          <span className="text-[12px] text-ink/30">
            Haal alle quizzes om je certificaat te ontvangen
          </span>
        )}
      </div>
    </div>
  );
}

function buildCertificateHtml(name: string, training: string, date: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Certificaat — ${training}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'DM Sans', sans-serif; background: #F7F4EF; color: #0E0C0A; }
    .cert { width: 800px; min-height: 560px; margin: 40px auto; padding: 60px; border: 2px solid #0E0C0A; position: relative; }
    .cert::before { content: ''; position: absolute; inset: 8px; border: 1px solid rgba(14,12,10,0.15); pointer-events: none; }
    .eyebrow { font-size: 10px; font-weight: 500; letter-spacing: 0.2em; text-transform: uppercase; color: #B5622A; margin-bottom: 24px; }
    .title { font-family: 'Playfair Display', serif; font-size: 42px; font-weight: 900; line-height: 1; letter-spacing: -0.03em; margin-bottom: 16px; }
    .subtitle { font-size: 16px; color: rgba(14,12,10,0.5); margin-bottom: 40px; }
    .name { font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 700; color: #B5622A; margin-bottom: 8px; }
    .detail { font-size: 14px; color: rgba(14,12,10,0.5); margin-bottom: 4px; }
    .footer { position: absolute; bottom: 60px; left: 60px; right: 60px; display: flex; justify-content: space-between; align-items: flex-end; }
    .sig { text-align: center; }
    .sig-line { width: 180px; border-bottom: 1px solid #0E0C0A; margin-bottom: 8px; }
    .sig-name { font-size: 13px; font-weight: 500; }
    .sig-role { font-size: 11px; color: rgba(14,12,10,0.4); }
    .logo { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 900; letter-spacing: -0.02em; }
    @media print { body { background: white; } .cert { margin: 0; border-color: #0E0C0A; } }
  </style>
</head>
<body>
  <div class="cert">
    <p class="eyebrow">Certificate of Completion</p>
    <h1 class="title">Certificaat</h1>
    <p class="subtitle">Hierbij verklaren wij dat</p>
    <p class="name">${name}</p>
    <p class="detail">de ${training} succesvol heeft afgerond</p>
    <p class="detail">${date}</p>
    <div class="footer">
      <div class="sig">
        <div class="sig-line"></div>
        <p class="sig-name">Klaas Kroezen</p>
        <p class="sig-role">Trainer & Auteur</p>
      </div>
      <p class="logo">Klaas Kroezen</p>
    </div>
  </div>
  <script>window.onload = () => window.print();</script>
</body>
</html>`;
}
