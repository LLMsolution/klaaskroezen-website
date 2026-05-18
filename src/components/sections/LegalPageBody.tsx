import { Container } from "@/components/ui/Container";
import { Label } from "@/components/ui/Label";
import { FadeIn } from "@/components/ui/FadeIn";
import { RichTextRenderer } from "@/components/ui/RichTextRenderer";

interface Props {
  label: string;
  title: string;
  noticeBadge?: string;
  body: string;
  fallback?: React.ReactNode;
}

export function LegalPageBody({ label, title, noticeBadge, body, fallback }: Props) {
  const hasContent = body && body.trim().length > 0;
  return (
    <section className="py-16 sm:py-[110px] border-b border-rule">
      <Container>
        <FadeIn>
          <Label className="mb-3">{label}</Label>
          <h1 className="font-display text-[clamp(32px,4.2vw,54px)] font-black leading-[0.97] tracking-[-0.03em] mb-4">
            {title}
          </h1>

          {noticeBadge && (
            <div className="mb-10 inline-block bg-copper/10 border border-copper/30 rounded-[2px] px-4 py-2">
              <p className="text-[12px] text-copper font-medium tracking-[0.05em] uppercase">
                {noticeBadge}
              </p>
            </div>
          )}

          {hasContent ? (
            <RichTextRenderer
              html={body}
              className="prose prose-lg max-w-[760px] prose-headings:font-display prose-headings:text-ink prose-p:text-ink/70 prose-p:leading-[1.8] prose-li:text-ink/70 prose-a:text-copper"
            />
          ) : (
            fallback
          )}
        </FadeIn>
      </Container>
    </section>
  );
}
