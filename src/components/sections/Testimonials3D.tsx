"use client";

import React from "react";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Label } from "@/components/ui/Label";
import { FadeIn } from "@/components/ui/FadeIn";

interface Review {
  text: string;
  name: string;
  role: string;
  avatar?: string;
  source?: string;
}

interface Testimonials3DProps {
  eyebrow?: string;
  title: string;
  titleAccent?: string;
  reviews: Review[];
  dark?: boolean;
}

function VerticalMarquee({
  children,
  reverse = false,
  duration = "40s",
}: {
  children: React.ReactNode;
  reverse?: boolean;
  duration?: string;
}) {
  return (
    <div
      className="group flex flex-col overflow-hidden"
      style={
        {
          "--marquee-duration": duration,
          "--marquee-gap": "0.75rem",
          gap: "var(--marquee-gap)",
        } as React.CSSProperties
      }
    >
      {Array.from({ length: 3 }, (_, i) => (
        <div
          key={i}
          className={`flex flex-col shrink-0 animate-marquee-vertical group-hover:[animation-play-state:paused] ${
            reverse ? "[animation-direction:reverse]" : ""
          }`}
          style={{ gap: "var(--marquee-gap)" }}
        >
          {children}
        </div>
      ))}
    </div>
  );
}

function HorizontalMarquee({
  children,
  reverse = false,
  duration = "30s",
}: {
  children: React.ReactNode;
  reverse?: boolean;
  duration?: string;
}) {
  return (
    <div
      className="flex overflow-hidden"
      style={
        {
          "--marquee-duration": duration,
          "--marquee-gap": "0.75rem",
          gap: "var(--marquee-gap)",
        } as React.CSSProperties
      }
    >
      {Array.from({ length: 3 }, (_, i) => (
        <div
          key={i}
          className={`flex shrink-0 animate-marquee ${
            reverse ? "[animation-direction:reverse]" : ""
          }`}
          style={{ gap: "var(--marquee-gap)" }}
        >
          {children}
        </div>
      ))}
    </div>
  );
}

function ReviewCard({
  review,
  dark = false,
}: {
  review: Review;
  dark?: boolean;
}) {
  const initials = review.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  return (
    <figure
      className={`w-[220px] shrink-0 border p-5 flex flex-col gap-3 ${
        dark ? "border-paper/10 bg-paper/[0.06]" : "border-rule bg-paper"
      }`}
    >
      <div className="flex items-center gap-2.5">
        {review.avatar ? (
          <Image
            src={review.avatar}
            alt={review.name}
            width={32}
            height={32}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold ${
              dark ? "bg-paper/10 text-paper/50" : "bg-warm text-ink/50"
            }`}
          >
            {initials}
          </div>
        )}
        <div className="flex flex-col min-w-0">
          <span
            className={`text-[13px] font-semibold truncate ${
              dark ? "text-paper" : "text-ink"
            }`}
          >
            {review.name}
          </span>
          <span
            className={`text-[11px] truncate ${
              dark ? "text-paper/45" : "text-ink/45"
            }`}
          >
            {review.role}
          </span>
        </div>
      </div>
      <blockquote
        className={`text-[13px] leading-[1.6] ${
          dark ? "text-paper/65" : "text-ink/70"
        }`}
      >
        {review.text}
      </blockquote>
      {review.source && (
        <span
          className={`text-[10px] font-medium tracking-[0.1em] uppercase mt-auto ${
            dark ? "text-copper-light" : "text-copper"
          }`}
        >
          {review.source}
        </span>
      )}
    </figure>
  );
}

export function Testimonials3D({
  eyebrow,
  title,
  titleAccent,
  reviews,
  dark = false,
}: Testimonials3DProps) {
  const cols = [
    reviews.filter((_, i) => i % 4 === 0),
    reviews.filter((_, i) => i % 4 === 1),
    reviews.filter((_, i) => i % 4 === 2),
    reviews.filter((_, i) => i % 4 === 3),
  ];

  const fadeBg = dark ? "from-ink" : "from-warm";

  // Split reviews into two rows for mobile
  const half = Math.ceil(reviews.length / 2);
  const mobileRow1 = reviews.slice(0, half);
  const mobileRow2 = reviews.slice(half);

  return (
    <section
      className={`py-16 sm:py-[110px] border-b overflow-hidden ${
        dark ? "bg-ink border-paper/[0.07]" : "bg-warm border-rule"
      }`}
    >
      {/* Mobile: heading + horizontal marquee */}
      <div className="lg:hidden">
        <Container>
          <FadeIn className="mb-8">
            {eyebrow && (
              <Label className={`mb-3 ${dark ? "text-copper-light" : ""}`}>
                {eyebrow}
              </Label>
            )}
            <h2
              className={`font-display text-[clamp(28px,3.4vw,44px)] font-black leading-[0.97] tracking-[-0.03em] ${
                dark ? "text-paper" : ""
              }`}
            >
              {title}
              {titleAccent && (
                <>
                  <br />
                  <em
                    className={`italic font-normal ${
                      dark ? "text-paper/40" : "text-ink/40"
                    }`}
                  >
                    {titleAccent}
                  </em>
                </>
              )}
            </h2>
          </FadeIn>
        </Container>

        <div className="relative space-y-3">
          <HorizontalMarquee duration="35s">
            {mobileRow1.map((r) => (
              <ReviewCard key={r.name} review={r} dark={dark} />
            ))}
          </HorizontalMarquee>
          <HorizontalMarquee duration="40s" reverse>
            {mobileRow2.map((r) => (
              <ReviewCard key={r.name} review={r} dark={dark} />
            ))}
          </HorizontalMarquee>

          <div
            className={`pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r ${fadeBg}`}
          />
          <div
            className={`pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l ${fadeBg}`}
          />
        </div>
      </div>

      {/* Desktop: heading left + 3D vertical marquee right */}
      <div className="hidden lg:block">
        <div className="relative min-h-[560px]">
          <Container>
            <FadeIn className="relative z-10 max-w-[380px] py-10">
              {eyebrow && (
                <Label className={`mb-3 ${dark ? "text-copper-light" : ""}`}>
                  {eyebrow}
                </Label>
              )}
              <h2
                className={`font-display text-[clamp(28px,3.4vw,44px)] font-black leading-[0.97] tracking-[-0.03em] ${
                  dark ? "text-paper" : ""
                }`}
              >
                {title}
                {titleAccent && (
                  <>
                    <br />
                    <em
                      className={`italic font-normal ${
                        dark ? "text-paper/40" : "text-ink/40"
                      }`}
                    >
                      {titleAccent}
                    </em>
                  </>
                )}
              </h2>
            </FadeIn>
          </Container>

          <div className="absolute top-1/2 -translate-y-1/2 left-[45%] right-0 h-full overflow-hidden [perspective:400px]">
            <div
              className="flex flex-row items-center gap-3 absolute inset-0 items-center justify-center"
              style={{
                transform:
                  "translateX(-20px) translateZ(-30px) rotateX(10deg) rotateY(-6deg) rotateZ(12deg)",
              }}
            >
              <VerticalMarquee duration="35s">
                {cols[0].map((r) => (
                  <ReviewCard key={r.name} review={r} dark={dark} />
                ))}
              </VerticalMarquee>
              <VerticalMarquee duration="38s" reverse>
                {cols[1].map((r) => (
                  <ReviewCard key={r.name} review={r} dark={dark} />
                ))}
              </VerticalMarquee>
              <VerticalMarquee duration="36s">
                {cols[2].map((r) => (
                  <ReviewCard key={r.name} review={r} dark={dark} />
                ))}
              </VerticalMarquee>
              <VerticalMarquee duration="40s" reverse>
                {cols[3].map((r) => (
                  <ReviewCard key={r.name} review={r} dark={dark} />
                ))}
              </VerticalMarquee>
            </div>

            <div
              className={`pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b ${fadeBg}`}
            />
            <div
              className={`pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t ${fadeBg}`}
            />
            <div
              className={`pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r ${fadeBg}`}
            />
            <div
              className={`pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l ${fadeBg}`}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
