"use client";

import { Container } from "@/components/ui/Container";
import { Label } from "@/components/ui/Label";
import { Marquee } from "@/components/ui/Marquee";

interface Review {
  text: string;
  name: string;
  role: string;
  source?: string;
}

interface ReviewMarqueeProps {
  eyebrow?: string;
  title: string;
  titleAccent?: string;
  reviews: Review[];
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <figure className="w-[340px] sm:w-[400px] shrink-0 bg-paper border border-rule p-6 sm:p-8 flex flex-col">
      <div className="flex gap-1 mb-4" aria-label="5 sterren">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg
            key={i}
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="text-copper"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
      <blockquote className="font-display text-[14px] sm:text-[15px] italic leading-[1.7] text-ink/80 flex-1 mb-5">
        &ldquo;{review.text}&rdquo;
      </blockquote>
      <figcaption className="border-t border-rule pt-4">
        <span className="text-[14px] font-semibold text-ink block">
          {review.name}
        </span>
        <span className="text-[12px] text-ink/50">{review.role}</span>
        {review.source && (
          <span className="text-[11px] text-copper block mt-1">
            {review.source}
          </span>
        )}
      </figcaption>
    </figure>
  );
}

export function ReviewMarquee({
  eyebrow,
  title,
  titleAccent,
  reviews,
}: ReviewMarqueeProps) {
  const firstHalf = reviews.slice(0, Math.ceil(reviews.length / 2));
  const secondHalf = reviews.slice(Math.ceil(reviews.length / 2));

  return (
    <section className="py-16 sm:py-[110px] bg-warm border-b border-rule overflow-hidden">
      <Container>
        <div className="text-center mb-10 sm:mb-14">
          {eyebrow && <Label className="mb-3">{eyebrow}</Label>}
          <h2 className="font-display text-[clamp(28px,3.4vw,44px)] font-black leading-[0.97] tracking-[-0.03em]">
            {title}
            {titleAccent && (
              <>
                <br />
                <em className="italic font-normal text-ink/40">
                  {titleAccent}
                </em>
              </>
            )}
          </h2>
        </div>
      </Container>

      <div className="space-y-5">
        <Marquee duration="50s" gap="1.25rem">
          {firstHalf.map((review) => (
            <ReviewCard key={review.name} review={review} />
          ))}
        </Marquee>
        <Marquee duration="55s" gap="1.25rem" reverse>
          {secondHalf.map((review) => (
            <ReviewCard key={review.name} review={review} />
          ))}
        </Marquee>
      </div>
    </section>
  );
}
