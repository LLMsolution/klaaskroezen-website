"use client";

import type { Lang } from "@/lib/checkout-i18n";

interface Props {
  email: string;
  name: string;
  lang: Lang;
}

/** Referral system — placeholder until backend API is built */
export function ReferralClient({ email, name, lang }: Props) {
  // TODO: Implement getReferralCode and createReferralCode in convex/checkout.ts
  void email;
  void name;
  void lang;
  return null;
}
