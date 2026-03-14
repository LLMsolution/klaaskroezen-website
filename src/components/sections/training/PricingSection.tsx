"use client";

import { useState } from "react";
import { Container } from "@/components/ui/Container";
import { Label } from "@/components/ui/Label";
import {
  ButtonExternal,
  ButtonLink,
  ButtonArrow,
} from "@/components/ui/Button";
import { FadeIn } from "@/components/ui/FadeIn";

interface PricingTier {
  label?: string;
  title: string;
  price: string;
  priceNote?: string;
  description: string;
  features: string[];
  cta: string;
  href: string;
  featured?: boolean;
  external?: boolean;
}

interface PricingTrack {
  tiers: PricingTier[];
}

interface PricingSectionProps {
  individual: PricingTrack;
  team: PricingTrack;
  guarantee?: string;
}

export function PricingSection({
  individual,
  team,
  guarantee,
}: PricingSectionProps) {
  const [mode, setMode] = useState<"individual" | "team">("individual");
  const tiers = mode === "individual" ? individual.tiers : team.tiers;

  return (
    <section
      id="pricing"
      aria-labelledby="pricing-heading"
      className="py-16 sm:py-[110px] bg-warm border-b border-rule"
    >
      <Container>
        <FadeIn className="text-center mb-10 sm:mb-14">
          <Label className="mb-3">Investering</Label>
          <h2
            id="pricing-heading"
            className="font-display text-[clamp(30px,3.8vw,48px)] font-black leading-[0.97] tracking-[-0.03em] mb-6"
          >
            Kies jouw traject.
          </h2>

          {/* Toggle */}
          <div className="inline-flex border border-rule rounded-[3px] p-1 bg-paper">
            <button
              type="button"
              onClick={() => setMode("individual")}
              className={`px-5 sm:px-7 py-2.5 text-[12px] sm:text-[13px] font-medium tracking-[0.06em] rounded-[2px] transition-all duration-200 cursor-pointer ${
                mode === "individual"
                  ? "bg-copper text-paper"
                  : "text-ink/50 hover:text-ink"
              }`}
            >
              Voor mezelf
            </button>
            <button
              type="button"
              onClick={() => setMode("team")}
              className={`px-5 sm:px-7 py-2.5 text-[12px] sm:text-[13px] font-medium tracking-[0.06em] rounded-[2px] transition-all duration-200 cursor-pointer ${
                mode === "team"
                  ? "bg-copper text-paper"
                  : "text-ink/50 hover:text-ink"
              }`}
            >
              Voor teams
            </button>
          </div>

          {guarantee && (
            <p className="text-[14px] sm:text-[15px] text-ink/50 mt-5 max-w-[480px] mx-auto leading-[1.7]">
              {guarantee}
            </p>
          )}
        </FadeIn>

        <div
          className={`grid gap-px bg-rule border border-rule ${
            tiers.length === 3
              ? "grid-cols-1 md:grid-cols-3"
              : "grid-cols-1 md:grid-cols-2 max-w-[780px] mx-auto"
          }`}
        >
          {tiers.map((tier) => {
            const Btn = tier.external ? ButtonExternal : ButtonLink;
            return (
              <div
                key={tier.title}
                className={`flex flex-col p-7 sm:p-9 ${
                  tier.featured ? "bg-ink" : "bg-paper"
                }`}
              >
                {tier.label && (
                  <span
                    className={`text-[10px] font-medium tracking-[0.2em] uppercase mb-4 ${
                      tier.featured ? "text-copper-light" : "text-copper"
                    }`}
                  >
                    {tier.label}
                  </span>
                )}
                <h3
                  className={`font-display text-[20px] sm:text-[22px] font-black leading-[1.1] tracking-[-0.01em] mb-2 ${
                    tier.featured ? "text-paper" : "text-ink"
                  }`}
                >
                  {tier.title}
                </h3>
                <div className="mb-1">
                  <span
                    className={`font-display text-[34px] sm:text-[40px] font-black leading-none tracking-[-0.02em] ${
                      tier.featured ? "text-paper" : "text-ink"
                    }`}
                  >
                    {tier.price}
                  </span>
                </div>
                {tier.priceNote && (
                  <span
                    className={`text-[12px] mb-5 ${
                      tier.featured ? "text-paper/40" : "text-ink/40"
                    }`}
                  >
                    {tier.priceNote}
                  </span>
                )}
                <p
                  className={`text-[14px] sm:text-[15px] leading-[1.65] mb-6 ${
                    tier.featured ? "text-paper/65" : "text-ink/65"
                  }`}
                >
                  {tier.description}
                </p>
                <ul className="flex-1 mb-8 space-y-3">
                  {tier.features.map((f) => (
                    <li
                      key={f}
                      className={`flex items-start gap-2.5 text-[13px] sm:text-[14px] leading-[1.5] ${
                        tier.featured ? "text-paper/70" : "text-ink/70"
                      }`}
                    >
                      <span
                        className={`shrink-0 mt-0.5 ${
                          tier.featured ? "text-copper-light" : "text-copper"
                        }`}
                      >
                        &#10003;
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto">
                  <Btn
                    href={tier.href}
                    variant={tier.featured ? "copper" : "ghost"}
                    size="large"
                  >
                    <ButtonArrow>{tier.cta}</ButtonArrow>
                  </Btn>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
