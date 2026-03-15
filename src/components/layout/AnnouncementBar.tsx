import Link from "next/link";
import { t, type Lang } from "@/lib/i18n";

export function AnnouncementBar({ lang }: { lang: Lang }) {
  const s = t(lang).announcement;

  return (
    <div className="bg-copper text-paper text-[12.5px] text-center py-2.5 px-5 tracking-[0.04em]">
      {s.prefix}{" "}
      <strong>{s.title}</strong> {s.edition}{" "}
      <Link
        href="/boek"
        className="border-b border-paper/40 hover:border-paper/70 transition-colors"
      >
        {s.cta}
      </Link>
    </div>
  );
}
