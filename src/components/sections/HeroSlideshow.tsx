"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const SLIDE_KEYS = [
  "hero/sales-excellence-group.jpeg",
  "spreker/klaas-flipchart.jpeg",
  "training/visma-youserve-session.jpg",
  "team/heigo-group.jpeg",
  "hero/customer-success-group.jpg",
] as const;

const slideData = [
  {
    key: SLIDE_KEYS[0],
    fallback: "/images/hero/sales-excellence-group.jpeg",
    alt: "Groep deelnemers tijdens de Sales Excellence Training met certificaten",
    objectPosition: "center 20%",
    quote: "Direct meer resultaat. De training heeft ons salesteam fundamenteel veranderd.",
    author: "Simon Kornblum",
    role: "Directeur Visma YouServe",
    detail: "30\u00A0deelnemers",
  },
  {
    key: SLIDE_KEYS[1],
    fallback: "/images/spreker/klaas-flipchart.jpeg",
    alt: "Klaas Kroezen geeft training bij een flipchart",
    objectPosition: "center 25%",
    quote: "Van 10 leads werden 1 tot 2 klant. Nu zijn dat er 7 tot 8. Niet door harder te pushen, maar door oprecht geïnteresseerd te zijn.",
    author: "Max de Weijer",
    role: "Ondernemer",
    detail: "",
  },
  {
    key: SLIDE_KEYS[2],
    fallback: "/images/training/visma-youserve-session.jpg",
    alt: "Training sessie bij Visma YouServe",
    objectPosition: "center 30%",
    quote: "Echte sales begint bij wie je bént. Mindset, rust en oprechte intentie leiden tot verbinding.",
    author: "Michael Pilarczyk",
    role: "Oprichter MasterMind Academy",
    detail: "",
  },
  {
    key: SLIDE_KEYS[3],
    fallback: "/images/team/heigo-group.jpeg",
    alt: "Teamtraining bij Heigo Nederland",
    objectPosition: "center 25%",
    quote: "Trots op het team en de stappen die we binnen Heigo blijven zetten.",
    author: "Heigo Nederland",
    role: "Sales Excellence Training",
    detail: "",
  },
  {
    key: SLIDE_KEYS[4],
    fallback: "/images/hero/customer-success-group.jpg",
    alt: "Deelnemers van de Customer Success Training",
    objectPosition: "center center",
    quote: "Klaas laat zien dat verkopen niet gaat over trucjes maar over écht contact maken.",
    author: "Mark Tigchelaar",
    role: "Psycholoog · Focus AAN/UIT",
    detail: "",
  },
] as const;

export { SLIDE_KEYS };

export function HeroSlideshow({ images }: { images?: Record<string, string> }) {
  const slides = slideData.map((s) => ({
    ...s,
    src: images?.[s.key] ?? s.fallback,
  }));

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="relative overflow-hidden bg-ink h-[50vh] sm:h-[55vh] lg:h-auto lg:border-r lg:border-paper/[0.07] order-1">
      {/* Stacked images with crossfade */}
      {slides.map((slide, i) => (
        <Image
          key={slide.key}
          src={slide.src}
          alt={slide.alt}
          fill
          className="object-cover opacity-0 transition-opacity duration-[1500ms] ease-in-out"
          style={{
            objectPosition: slide.objectPosition,
            opacity: i === current ? 0.68 : 0,
          }}
          priority={i === 0}
          loading={i === 0 ? undefined : "lazy"}
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
      ))}

      {/* Gradient overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ink/85 z-10"
        aria-hidden="true"
      />

      {/* Quote with crossfade */}
      <figure className="absolute bottom-0 left-0 right-0 p-7 sm:p-[44px_48px] z-20">
        <div
          className="font-display text-[48px] sm:text-[58px] font-black text-copper leading-[0.6] mb-2.5"
          aria-hidden="true"
        >
          &ldquo;
        </div>
        {slides.map((slide, i) => (
          <div
            key={slide.author}
            className="transition-opacity duration-[800ms] ease-in-out"
            style={{
              opacity: i === current ? 1 : 0,
              position: i === current ? "relative" : "absolute",
              bottom: i === current ? undefined : 0,
              left: i === current ? undefined : 0,
              right: i === current ? undefined : 0,
            }}
            aria-hidden={i !== current}
          >
            <blockquote className="font-display italic text-[16px] sm:text-[17px] text-paper/90 leading-[1.65]">
              {slide.quote}
            </blockquote>
            <figcaption className="mt-3 text-[11px] font-medium tracking-[0.14em] uppercase text-paper/50">
              {slide.author}&nbsp;&mdash; {slide.role}
              {slide.detail && <> &middot; {slide.detail}</>}
            </figcaption>
          </div>
        ))}
      </figure>

      {/* Slide indicators */}
      <div className="absolute bottom-7 right-7 sm:bottom-11 sm:right-12 z-20 flex gap-2" role="group" aria-label="Slide navigatie">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setCurrent(i)}
            className={`h-6 flex items-center justify-center cursor-pointer ${
              i === current ? "w-7" : "w-6"
            }`}
            aria-label={`Ga naar slide ${i + 1}`}
          >
            <span className={`block h-2 rounded-full transition-all duration-300 ${
              i === current
                ? "bg-copper w-5"
                : "bg-paper/30 hover:bg-paper/50 w-2"
            }`} />
          </button>
        ))}
      </div>
    </div>
  );
}
