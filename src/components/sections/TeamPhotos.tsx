import Image from "next/image";
import { Label } from "@/components/ui/Label";
import { FadeIn } from "@/components/ui/FadeIn";
import { loadSiteImages, imgUrl } from "@/lib/site-images";

const PHOTO_KEYS = [
  "hero/sales-excellence-group.jpeg",
  "team/heigo-group.jpeg",
  "hero/customer-success-group.jpg",
] as const;

const photoData = [
  {
    key: PHOTO_KEYS[0],
    alt: "Groep deelnemers met certificaten na de Sales Excellence Training bij Visma YouServe",
    company: "Visma YouServe",
    text: "30 sales- en marketingprofessionals getraind in Sales Excellence",
    result: "\"De training heeft ons salesteam fundamenteel veranderd\" — Simon Kornblum, Directeur",
  },
  {
    key: PHOTO_KEYS[1],
    alt: "Teamtraining bij Heigo Nederland — binnendienst, buitendienst en directie",
    company: "Heigo Nederland",
    text: "Binnendienst, buitendienst én directie samen getraind",
    result: "\"Trots op het team en de stappen die we blijven zetten\" — Heigo Nederland",
  },
  {
    key: PHOTO_KEYS[2],
    alt: "Deelnemers van de Customer Success Training",
    company: "Customer Success Training",
    text: "Van klantcontact naar fans — de hele organisatie profiteert",
    result: "Hogere klanttevredenheid en retentie",
  },
] as const;

type TeamPhotoInput = {
  image?: string;
  caption?: string;
  featured?: string;
};

type TeamPhotosProps = {
  content?: {
    eyebrow?: string;
    title?: string;
    titleAccent?: string;
    items?: TeamPhotoInput[];
  };
};

export async function TeamPhotos({ content }: TeamPhotosProps = {}) {
  const img = await loadSiteImages([...PHOTO_KEYS]);

  let photos: Array<{
    key: string;
    src: string;
    alt: string;
    company: string;
    text: string;
    result: string;
  }>;

  if (content?.items && content.items.length > 0) {
    photos = content.items.map((p, i) => ({
      key: `photo-${i}`,
      src: p.image || "",
      alt: p.caption || "",
      company: "",
      text: p.caption || "",
      result: "",
    }));
  } else {
    photos = photoData.map((p) => ({
      ...p,
      src: imgUrl(img, p.key),
    }));
  }
  return (
    <section aria-labelledby="team-heading" className="border-b border-rule">
      <div className="py-12 sm:py-20 px-7 sm:px-14 max-w-[1180px] mx-auto">
        <FadeIn>
          <Label className="mb-3">Eerder meegedaan</Label>
          <h2
            id="team-heading"
            className="font-display text-[clamp(30px,4vw,52px)] font-black leading-[0.97] tracking-[-0.03em]"
          >
            Teams die al
            <br />
            <em className="italic font-normal text-ink/40">vooroplopen.</em>
          </h2>
        </FadeIn>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-rule border-t border-rule">
        {photos.map((photo, i) => (
          <div
            key={photo.key}
            className={`group relative overflow-hidden bg-warm cursor-default ${
              i === 0
                ? "sm:row-span-2 h-[280px] sm:h-[500px]"
                : "h-[220px] sm:h-[249px]"
            }`}
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
              sizes="(max-width: 640px) 100vw, 50vw"
              loading="lazy"
            />

            {/* Default caption at bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-[26px] bg-gradient-to-t from-ink/75 to-transparent transition-opacity duration-300 group-hover:opacity-0">
              <div className="text-[10px] font-medium tracking-[0.18em] uppercase text-copper mb-1">
                {photo.company}
              </div>
              <div className="text-[13px] sm:text-[14px] text-paper/85 leading-[1.45]">
                {photo.text}
              </div>
            </div>

            {/* Hover overlay with full info */}
            <div className="absolute inset-0 bg-ink/85 flex flex-col justify-center items-center text-center p-6 sm:p-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper mb-3">
                {photo.company}
              </span>
              <p className="font-display text-[18px] sm:text-[22px] font-black text-paper leading-[1.15] mb-3 max-w-[320px]">
                {photo.text}
              </p>
              <p className="text-[13px] sm:text-[14px] text-paper/70 leading-[1.6] max-w-[300px]">
                {photo.result}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
