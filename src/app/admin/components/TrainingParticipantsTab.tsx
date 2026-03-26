"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { Loading, StatCard, Th, formatDate } from "./shared";

interface Props {
  trainingId: Id<"trainings">;
  onBack: () => void;
}

export function TrainingParticipantsTab({ trainingId, onBack }: Props) {
  const trainingData = useQuery(api.trainings.listAll);
  const participants = useQuery(api.trainings.getParticipants, { trainingId });
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  const training = trainingData?.find((t) => t._id === trainingId);
  if (!training || participants === undefined) return <Loading />;

  const avgProgress = participants.length > 0
    ? Math.round(participants.reduce((s, p) => s + p.overallPercent, 0) / participants.length)
    : 0;
  const completedAll = participants.filter((p) => p.overallPercent === 100).length;
  const activeRecent = participants.filter(
    (p) => p.lastActivity && p.lastActivity > Date.now() - 7 * 24 * 60 * 60 * 1000,
  ).length;

  return (
    <div className="max-w-[960px]">
      <button onClick={onBack} className="text-[12px] text-ink/40 hover:text-ink mb-6 cursor-pointer">
        ← Terug naar trainingen
      </button>

      <h2 className="font-display text-[22px] font-black tracking-[-0.02em] mb-2">
        Deelnemers — {training.title.nl}
      </h2>
      <p className="text-[13px] text-ink/40 mb-8">
        {participants.length} deelnemers
      </p>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Deelnemers" value={String(participants.length)} />
        <StatCard label="Gem. voortgang" value={`${avgProgress}%`} accent />
        <StatCard label="Afgerond" value={String(completedAll)} />
        <StatCard label="Actief (7d)" value={String(activeRecent)} />
      </div>

      {participants.length === 0 ? (
        <div className="border border-rule rounded-[2px] p-10 text-center">
          <p className="text-[14px] text-ink/40 mb-2">
            Nog geen deelnemers voor deze training.
          </p>
          <p className="text-[12px] text-ink/30">
            Gebruikers met access rights voor &quot;{training.slug}&quot; verschijnen hier.
          </p>
        </div>
      ) : (
        <div className="border border-rule rounded-[2px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead className="bg-warm/50 border-b border-rule">
                <tr>
                  <Th>Naam</Th>
                  <Th>Email</Th>
                  <Th>Voortgang</Th>
                  <Th>Modules</Th>
                  <Th>Laatste activiteit</Th>
                  <Th>{""}</Th>
                </tr>
              </thead>
              <tbody>
                {participants.map((p) => {
                  const isExpanded = expandedUser === p.userId;
                  return (
                    <ParticipantRow
                      key={p.userId}
                      participant={p}
                      isExpanded={isExpanded}
                      onToggle={() => setExpandedUser(isExpanded ? null : p.userId)}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Participant Row ─── */

type ParticipantData = {
  userId: string;
  name: string;
  email: string;
  overallPercent: number;
  completedModules: number;
  totalModules: number;
  lastActivity?: number;
  grantedAt?: number;
  moduleProgress: Array<{
    moduleId: string;
    title: string;
    sortOrder: number;
    completed: number;
    total: number;
    quizPassed?: boolean;
    quizScore?: number;
  }>;
};

function ParticipantRow({
  participant: p,
  isExpanded,
  onToggle,
}: {
  participant: ParticipantData;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <tr className="border-b border-rule/50 hover:bg-warm/20 transition-colors">
        <td className="px-4 py-3 font-medium">{p.name}</td>
        <td className="px-4 py-3 text-ink/50">{p.email}</td>
        <td className="px-4 py-3">
          <ProgressBar percent={p.overallPercent} />
        </td>
        <td className="px-4 py-3 text-ink/50 tabular-nums">
          {p.completedModules}/{p.totalModules}
        </td>
        <td className="px-4 py-3 text-ink/40 text-[12px]">
          {p.lastActivity ? formatDate(p.lastActivity) : "—"}
        </td>
        <td className="px-4 py-3 text-right">
          <button
            onClick={onToggle}
            className="text-[11px] text-copper hover:text-copper-light cursor-pointer"
          >
            {isExpanded ? "Inklappen" : "Details"}
          </button>
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={6} className="bg-warm/30 px-4 py-4">
            <ModuleDetails
              modules={p.moduleProgress}
              grantedAt={p.grantedAt}
            />
          </td>
        </tr>
      )}
    </>
  );
}

/* ─── Module Details (expanded row) ─── */

function ModuleDetails({
  modules,
  grantedAt,
}: {
  modules: ParticipantData["moduleProgress"];
  grantedAt?: number;
}) {
  return (
    <div className="space-y-3">
      {grantedAt && (
        <p className="text-[11px] text-ink/30 mb-2">
          Toegang verleend: {formatDate(grantedAt)}
        </p>
      )}
      <div className="grid gap-2">
        {modules.map((mod) => (
          <div
            key={mod.moduleId}
            className="flex items-center gap-4 bg-paper/60 border border-rule/50 rounded-[2px] px-4 py-2.5"
          >
            <span className="text-[12px] text-ink/40 w-6 tabular-nums shrink-0">
              {String(mod.sortOrder + 1).padStart(2, "0")}
            </span>
            <span className="flex-1 text-[13px] text-ink truncate">
              {mod.title}
            </span>
            <div className="w-20 shrink-0">
              <ProgressBar percent={mod.total > 0 ? Math.round((mod.completed / mod.total) * 100) : 0} small />
            </div>
            <span className="text-[11px] text-ink/40 w-10 text-right tabular-nums shrink-0">
              {mod.completed}/{mod.total}
            </span>
            {mod.quizPassed !== undefined && (
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-[2px] shrink-0 ${
                mod.quizPassed
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-600"
              }`}>
                Quiz {mod.quizPassed ? "gehaald" : "niet gehaald"}
                {mod.quizScore !== undefined && ` (${mod.quizScore}%)`}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Progress Bar ─── */

function ProgressBar({ percent, small }: { percent: number; small?: boolean }) {
  const h = small ? "h-1.5" : "h-2";
  return (
    <div className="flex items-center gap-2">
      <div className={`flex-1 ${h} bg-rule rounded-full overflow-hidden`}>
        <div
          className={`${h} rounded-full transition-all duration-300 ${
            percent === 100 ? "bg-green-500" : "bg-copper/60"
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="text-[11px] text-ink/40 tabular-nums w-8 text-right">
        {percent}%
      </span>
    </div>
  );
}
