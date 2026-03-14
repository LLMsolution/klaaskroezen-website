import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Bedankt voor je bestelling",
  robots: { index: false, follow: false },
};

export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; product?: string; lang?: string }>;
}) {
  const sp = await searchParams;
  const email = sp.email || "";
  const lang = sp.lang === "en" ? "en" : "nl";

  return (
    <main className="mx-auto max-w-[520px] px-7 py-16 lg:py-24 text-center">
      {/* Success icon */}
      <div className="w-16 h-16 rounded-full bg-copper/10 flex items-center justify-center mx-auto mb-6">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-copper"
        >
          <path d="M9 12l2 2 4-4" />
          <circle cx="12" cy="12" r="10" />
        </svg>
      </div>

      <h1 className="font-display text-[clamp(26px,3.4vw,36px)] font-black leading-[0.97] tracking-[-0.03em] mb-4">
        {lang === "nl" ? "Bedankt voor je bestelling!" : "Thank you for your order!"}
      </h1>

      <p className="text-[15px] text-ink/60 leading-[1.8] mb-2">
        {lang === "nl"
          ? "We hebben een bevestigingsmail gestuurd naar"
          : "We've sent a confirmation email to"}
      </p>
      {email && (
        <p className="text-[15px] font-medium text-ink mb-6">{email}</p>
      )}
      <p className="text-[14px] text-ink/50 leading-[1.7] mb-10">
        {lang === "nl"
          ? "Check je inbox (en eventueel je spam-folder) voor de details en je toegangsgegevens."
          : "Check your inbox (and possibly your spam folder) for the details and your access credentials."}
      </p>

      {/* Actions */}
      <div className="space-y-3">
        <Link
          href="/dashboard"
          className="block w-full bg-copper text-paper py-3.5 text-[13px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors rounded-[2px] text-center"
        >
          {lang === "nl" ? "Ga naar mijn dashboard" : "Go to my dashboard"}
        </Link>
        <Link
          href="/"
          className="block w-full text-[13px] text-ink/50 hover:text-ink transition-colors py-2"
        >
          {lang === "nl" ? "Terug naar de website" : "Back to the website"}
        </Link>
      </div>
    </main>
  );
}
