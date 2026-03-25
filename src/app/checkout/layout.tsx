import Link from "next/link";
import { getLocale } from "@/lib/i18n/server";

export default async function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const lang = await getLocale();

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-rule">
        <div className="mx-auto max-w-[1080px] px-7 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="font-display text-[20px] font-bold tracking-[-0.02em] text-ink"
          >
            Klaas Kroezen
          </Link>
          <div className="flex items-center gap-3">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-ink/30"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span className="text-[12px] text-ink/40 tracking-[0.05em]">
              {{ nl: "Beveiligde checkout", en: "Secure checkout", de: "Sichere Kaufabwicklung" }[lang]}
            </span>
          </div>
        </div>
      </header>

      {children}
    </div>
  );
}
