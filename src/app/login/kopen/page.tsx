import type { Metadata } from "next";
import { AutoLoginClient } from "./AutoLoginClient";

export const metadata: Metadata = {
  title: "Inloggen",
  robots: { index: false, follow: false },
};

export default async function KopenLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; next?: string }>;
}) {
  const sp = await searchParams;
  const email = sp.email ?? "";
  const next = sp.next ?? "/dashboard";

  return (
    <section className="flex justify-center py-16 sm:py-24 px-7">
      <div className="w-full max-w-[420px]">
        <AutoLoginClient email={email} next={next} />
      </div>
    </section>
  );
}
