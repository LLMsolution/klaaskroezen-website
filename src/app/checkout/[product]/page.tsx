import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProduct, CHECKOUT_PRODUCTS } from "@/lib/checkout-config";
import { detectLang } from "@/lib/checkout-i18n";
import { CheckoutClient } from "@/components/checkout/CheckoutClient";

interface Props {
  params: Promise<{ product: string }>;
  searchParams: Promise<{ lang?: string; tier?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { product: slug } = await params;
  const product = getProduct(slug);
  if (!product) return { title: "Checkout" };

  return {
    title: `Checkout — ${product.name.nl}`,
    robots: { index: false, follow: false },
  };
}

export function generateStaticParams() {
  return Object.keys(CHECKOUT_PRODUCTS).map((product) => ({ product }));
}

export default async function CheckoutPage({ params, searchParams }: Props) {
  const { product: slug } = await params;
  const sp = await searchParams;
  const product = getProduct(slug);

  if (!product) notFound();

  const lang = detectLang(sp);

  return (
    <main className="mx-auto max-w-[1080px] px-7 py-10 lg:py-14">
      <CheckoutClient productSlug={slug} lang={lang} />
    </main>
  );
}
