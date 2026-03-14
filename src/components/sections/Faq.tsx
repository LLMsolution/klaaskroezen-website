"use client";

import { useState, useCallback } from "react";
import { Container } from "@/components/ui/Container";
import { Label } from "@/components/ui/Label";
import { FadeIn } from "@/components/ui/FadeIn";

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqProps {
  eyebrow?: string;
  title?: string;
  titleAccent?: string;
  items: FaqItem[];
}

function FaqRow({ item, isOpen, onToggle }: { item: FaqItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-rule">
      <button
        onClick={onToggle}
        className="w-full flex items-start justify-between gap-6 py-5 sm:py-6 text-left group outline-none focus-visible:ring-2 focus-visible:ring-copper focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
        aria-expanded={isOpen}
      >
        <span className="text-[15px] sm:text-[16px] font-medium text-ink leading-[1.5] group-hover:text-copper transition-colors">
          {item.question}
        </span>
        <span
          className={`shrink-0 w-5 h-5 flex items-center justify-center text-copper text-[18px] transition-transform duration-200 ${isOpen ? "rotate-45" : ""}`}
          aria-hidden="true"
        >
          +
        </span>
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-200"
        style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <p className="text-[14px] sm:text-[15px] text-ink/65 leading-[1.8] pb-5 sm:pb-6 max-w-[640px]">
            {item.answer}
          </p>
        </div>
      </div>
    </div>
  );
}

export function Faq({
  eyebrow = "Veelgestelde vragen",
  title = "Nog vragen?",
  titleAccent,
  items,
}: FaqProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = useCallback((i: number) => {
    setOpenIndex((prev) => (prev === i ? null : i));
  }, []);

  return (
    <section className="py-16 sm:py-[110px] border-b border-rule">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-10 lg:gap-20">
          <FadeIn>
            <Label className="mb-3">{eyebrow}</Label>
            <h2 className="font-display text-[clamp(28px,3.4vw,44px)] font-black leading-[0.97] tracking-[-0.03em]">
              {title}
              {titleAccent && (
                <>
                  <br />
                  <em className="italic font-normal text-ink/40">{titleAccent}</em>
                </>
              )}
            </h2>
          </FadeIn>

          <div className="border-t border-rule">
            {items.map((item, i) => (
              <FaqRow
                key={i}
                item={item}
                isOpen={openIndex === i}
                onToggle={() => toggle(i)}
              />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
