import Link from "next/link";

export function AnnouncementBar() {
  return (
    <div className="bg-copper text-paper text-[12.5px] text-center py-2.5 px-5 tracking-[0.04em]">
      Bestseller{" "}
      <strong>Sales, Oprecht en Ontspannen</strong> — 2e druk —{" "}
      <Link
        href="/boek"
        className="border-b border-paper/40 hover:border-paper/70 transition-colors"
      >
        Bestel nu, gratis verzending &rarr;
      </Link>
    </div>
  );
}
