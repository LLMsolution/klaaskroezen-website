import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  generateMetadata as setMetadata,
  default as SalesExcellenceTrainingPage,
} from "../../../sales-excellence-training/page";
import {
  generateMetadata as cstMetadata,
  default as CustomerSuccessTrainingPage,
} from "../../../customer-success-training/page";

type Slug = "set-online" | "cst-online";

const RENDERERS: Record<Slug, () => Promise<React.ReactElement>> = {
  "set-online": SalesExcellenceTrainingPage,
  "cst-online": CustomerSuccessTrainingPage,
};

const META: Record<Slug, () => Promise<Metadata>> = {
  "set-online": setMetadata,
  "cst-online": cstMetadata,
};

function isSupportedSlug(slug: string): slug is Slug {
  return slug === "set-online" || slug === "cst-online";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!isSupportedSlug(slug)) return {};
  return META[slug]();
}

export default async function TrainingMarketingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!isSupportedSlug(slug)) notFound();
  const Renderer = RENDERERS[slug];
  return await Renderer();
}
