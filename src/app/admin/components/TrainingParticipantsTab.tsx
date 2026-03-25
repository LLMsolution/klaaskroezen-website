"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { Loading } from "./shared";

interface Props {
  trainingId: Id<"trainings">;
  onBack: () => void;
}

export function TrainingParticipantsTab({ trainingId, onBack }: Props) {
  const trainingData = useQuery(api.trainings.listAll);
  const modules = useQuery(api.trainings.getModulesForTraining, { trainingId });

  const training = trainingData?.find((t) => t._id === trainingId);
  if (!training || modules === undefined) return <Loading />;

  return (
    <div className="max-w-[800px]">
      <button onClick={onBack} className="text-[12px] text-ink/40 hover:text-ink mb-6 cursor-pointer">
        ← Terug naar trainingen
      </button>

      <h2 className="font-display text-[22px] font-black tracking-[-0.02em] mb-2">
        Deelnemers — {training.title.nl}
      </h2>
      <p className="text-[13px] text-ink/40 mb-8">
        {modules.filter((m) => !m.parentModuleId).length} modules · {modules.filter((m) => !!m.parentModuleId).length} trainingen
      </p>

      <div className="border border-rule rounded-[2px] p-10 text-center">
        <p className="text-[14px] text-ink/40 mb-2">
          Deelnemersoverzicht wordt gevuld zodra er deelnemers zijn.
        </p>
        <p className="text-[12px] text-ink/30">
          Gebruikers met access rights voor &quot;{training.slug}&quot; verschijnen hier met hun voortgang.
        </p>
      </div>
    </div>
  );
}
