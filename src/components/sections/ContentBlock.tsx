import Image from "next/image";
import { Label } from "@/components/ui/Label";
import { FadeIn } from "@/components/ui/FadeIn";

interface ContentBlockProps {
  eyebrow?: string;
  title: string;
  titleAccent?: string;
  paragraphs: string[];
  image: string;
  imageAlt: string;
  imagePosition?: "left" | "right";
  objectPosition?: string;
  children?: React.ReactNode;
}

export function ContentBlock({
  eyebrow,
  title,
  titleAccent,
  paragraphs,
  image,
  imageAlt,
  imagePosition = "right",
  objectPosition = "center center",
  children,
}: ContentBlockProps) {
  const imgBlock = (
    <div className="relative aspect-[4/5] sm:aspect-[3/4] lg:aspect-[4/3] overflow-hidden bg-warm">
      <Image
        src={image}
        alt={imageAlt}
        fill
       
        className="object-cover"
        style={{ objectPosition }}
        sizes="(max-width: 1024px) 100vw, 50vw"
        loading="lazy"
      />
    </div>
  );

  // Push the text content towards the image: when image is right the text
  // floats to the right edge of its grid cell (ml-auto), and vice versa.
  const alignCls = imagePosition === "right" ? "ml-auto" : "mr-auto";

  const textBlock = (
    <div className="flex flex-col justify-center py-10 sm:py-16 lg:py-20 px-7 sm:px-10 lg:px-16">
      <FadeIn>
      <div className={`max-w-[520px] ${alignCls}`}>
      {eyebrow && <Label className="mb-3">{eyebrow}</Label>}
      <h2 className="font-display text-[clamp(28px,3.4vw,44px)] font-black leading-[0.97] tracking-[-0.03em] mb-5">
        {title}
        {titleAccent && (
          <>
            <br />
            <em className="italic font-normal text-ink/40">{titleAccent}</em>
          </>
        )}
      </h2>
      <div className="space-y-4">
        {paragraphs.map((p, i) => (
          <p
            key={i}
            className="text-[15px] sm:text-[16px] text-ink/80 leading-[1.8]"
          >
            {p}
          </p>
        ))}
      </div>
      {children && <div className="mt-7">{children}</div>}
      </div>
      </FadeIn>
    </div>
  );

  return (
    <section className="border-b border-rule">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {imagePosition === "left" ? (
          <>
            {imgBlock}
            {textBlock}
          </>
        ) : (
          <>
            {textBlock}
            {imgBlock}
          </>
        )}
      </div>
    </section>
  );
}
