import { TrainingOverviewClient } from "@/components/training/TrainingOverviewClient";
import { getLocale } from "@/lib/i18n/server";

export default async function TrainingPage() {
  const lang = await getLocale();
  return <TrainingOverviewClient lang={lang} />;
}
