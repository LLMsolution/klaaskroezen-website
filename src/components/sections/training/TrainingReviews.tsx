import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Label } from "@/components/ui/Label";
import { FadeIn } from "@/components/ui/FadeIn";

interface Review {
  text: string;
  name: string;
  role: string;
  avatar?: string | null;
}

interface TrainingReviewsProps {
  reviews: Review[];
}

function InitialsAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);
  return (
    <div className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold tracking-wider shrink-0 bg-ink/[0.06] text-ink/50">
      {initials}
    </div>
  );
}

export function TrainingReviews({ reviews }: TrainingReviewsProps) {
  return (
    <section
      aria-labelledby="training-reviews-heading"
      className="py-16 sm:py-[110px] border-b border-rule"
    >
      <Container>
        <FadeIn className="mb-10 sm:mb-[60px]">
          <Label className="mb-3">Wat deelnemers zeggen</Label>
          <h2
            id="training-reviews-heading"
            className="font-display text-[clamp(30px,3.8vw,48px)] font-black leading-[0.97] tracking-[-0.03em]"
          >
            Bewezen resultaat.
          </h2>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-rule border border-rule">
          {reviews.map((review) => (
            <article key={review.name} className="bg-paper p-6 sm:p-[34px_30px]">
              <div className="text-copper text-xs tracking-[2px] mb-3">
                <span aria-hidden="true">&#9733;&#9733;&#9733;&#9733;&#9733;</span>
              </div>
              <blockquote className="font-display italic text-[15px] sm:text-[16px] leading-[1.72] text-ink/80 mb-5">
                &ldquo;{review.text}&rdquo;
              </blockquote>
              <footer className="flex items-center gap-2.5 pt-4 border-t border-rule">
                {review.avatar ? (
                  <Image
                    src={review.avatar}
                    alt=""
                    width={36}
                    height={36}
                    unoptimized={review.avatar.startsWith("https://")}
                    className="w-9 h-9 rounded-full object-cover bg-warm shrink-0"
                    loading="lazy"
                  />
                ) : (
                  <InitialsAvatar name={review.name} />
                )}
                <div>
                  <cite className="text-[13px] font-medium not-italic text-ink">
                    {review.name}
                  </cite>
                  <div className="text-[12px] leading-[1.3] text-ink/50">
                    {review.role}
                  </div>
                </div>
              </footer>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
