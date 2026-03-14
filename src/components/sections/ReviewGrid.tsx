import Image from "next/image";
import { Label } from "@/components/ui/Label";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/ui/FadeIn";

const reviews = [
  {
    text: "Van 10 leads werden 1 tot 2 klant. Nu zijn dat er 7 tot 8. Niet door harder te pushen, maar door oprecht geïnteresseerd te zijn.",
    name: "Max de Weijer",
    role: "Ondernemer",
    avatar: null,
    dark: false,
  },
  {
    text: "Direct meer resultaat. Klaas heeft ons salesteam fundamenteel veranderd — niet met trucjes maar met een aanpak die écht werkt en blijft hangen.",
    name: "Simon Kornblum",
    role: "Directeur Visma YouServe",
    avatar: "/images/reviews/simon-kornblum.jpg",
    dark: true,
  },
  {
    text: "Echte sales begint bij wie je bént. Mindset, rust en oprechte intentie leiden tot verbinding. Een must voor wie klanten wil veranderen in fans.",
    name: "Michael Pilarczyk",
    role: "Oprichter MasterMind Academy",
    avatar: "/images/reviews/michael-pilarczyk.jpeg",
    dark: false,
  },
  {
    text: "Dit boek gaat helemaal niet over sales. Het gaat over gedrag. Over hoe je oprechte verbinding maakt.",
    name: "Roderick Göttgens",
    role: "Oprichter Behavior Boost",
    avatar: null,
    dark: true,
  },
  {
    text: "Sales kan ook rustig. Oprecht. En ijzersterk. Het brengt sales terug naar de basis: vertrouwen, vakmanschap en relaties die blijven.",
    name: "Hendrika Willemse-Vreugdenhil",
    role: "Expert Review Managementboek.nl",
    avatar: null,
    dark: false,
  },
  {
    text: "Klaas laat zien dat verkopen niet gaat over trucjes maar over écht contact maken. Een aanpak die werkt — ook als je jezelf geen verkoper vindt.",
    name: "Mark Tigchelaar",
    role: "Psycholoog · Focus AAN/UIT",
    avatar: "/images/reviews/mark-tigchelaar.jpeg",
    dark: true,
  },
] as const;

function Stars() {
  return (
    <div
      className="text-copper text-xs tracking-[2px] mb-[13px]"
      role="img"
      aria-label="5 van 5 sterren"
    >
      <span aria-hidden="true">★★★★★</span>
    </div>
  );
}

function InitialsAvatar({ name, dark }: { name: string; dark: boolean }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);
  return (
    <div
      className={`w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold tracking-wider shrink-0 ${
        dark ? "bg-paper/10 text-paper/60" : "bg-ink/[0.06] text-ink/50"
      }`}
    >
      {initials}
    </div>
  );
}

export function ReviewGrid() {
  return (
    <section
      aria-labelledby="reviews-heading"
      className="py-16 sm:py-[110px] bg-warm border-b border-rule"
    >
      <Container>
        <FadeIn className="mb-10 sm:mb-[60px]">
          <Label className="mb-3">Wat deelnemers zeggen</Label>
          <h2
            id="reviews-heading"
            className="font-display text-[clamp(32px,4.2vw,58px)] font-black leading-[0.97] tracking-[-0.03em]"
          >
            Resultaat dat
            <br />
            <em className="italic font-normal text-ink/40">
              voor zich spreekt.
            </em>
          </h2>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-rule border border-rule">
          {reviews.map((review) => {
            const isDark = review.dark;
            return (
              <article
                key={review.name}
                className={`p-6 sm:p-[34px_30px] ${
                  isDark ? "bg-ink" : "bg-paper"
                }`}
              >
                <Stars />
                <div
                  className={`font-display text-[42px] sm:text-[50px] font-black leading-[0.65] mb-[11px] ${
                    isDark ? "text-copper-light" : "text-copper"
                  }`}
                  aria-hidden="true"
                >
                  &ldquo;
                </div>
                <blockquote
                  className={`font-display italic text-[15px] sm:text-[16px] leading-[1.72] mb-5 ${
                    isDark ? "text-paper/80" : "text-ink/80"
                  }`}
                >
                  {review.text}
                </blockquote>
                <footer
                  className={`flex items-center gap-2.5 pt-4 border-t ${
                    isDark ? "border-paper/[0.07]" : "border-rule"
                  }`}
                >
                  {review.avatar ? (
                    <Image
                      src={review.avatar}
                      alt=""
                      width={36}
                      height={36}
                      className="w-9 h-9 rounded-full object-cover bg-warm shrink-0"
                      loading="lazy"
                    />
                  ) : (
                    <InitialsAvatar name={review.name} dark={isDark} />
                  )}
                  <div>
                    <cite
                      className={`text-[13px] font-medium not-italic ${
                        isDark ? "text-paper" : "text-ink"
                      }`}
                    >
                      {review.name}
                    </cite>
                    <div
                      className={`text-[12px] leading-[1.3] ${
                        isDark ? "text-paper/50" : "text-ink/50"
                      }`}
                    >
                      {review.role}
                    </div>
                  </div>
                </footer>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
