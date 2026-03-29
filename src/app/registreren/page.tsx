import type { Metadata } from "next";
import { RegisterForm } from "./RegisterForm";
import { t } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLocale();
  const s = t(lang).register;
  return {
    title: s.title,
    description: s.subtitle,
  };
}

export default async function RegisterPage() {
  const lang = await getLocale();
  const s = t(lang).register;

  return (
    <section className="flex justify-center py-16 sm:py-24 px-7">
      <div className="w-full max-w-[420px]">
        <div className="text-center mb-10">
          <h1 className="font-display text-[clamp(28px,3.4vw,40px)] font-black leading-[0.97] tracking-[-0.03em]">
            {s.title}
          </h1>
          <p className="text-[15px] text-ink/60 leading-[1.8] mt-3">
            {s.subtitle}
          </p>
        </div>
        <RegisterForm lang={lang} />
      </div>
    </section>
  );
}
