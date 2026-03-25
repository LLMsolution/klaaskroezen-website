import { ModulePageClient } from "@/components/training/ModulePageClient";
import { getLocale } from "@/lib/i18n/server";

export default async function ModulePage() {
  const lang = await getLocale();
  return <ModulePageClient lang={lang} />;
}
