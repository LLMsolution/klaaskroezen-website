import { Container } from "@/components/ui/Container";
import { Label } from "@/components/ui/Label";
import { FadeIn } from "@/components/ui/FadeIn";

interface ProgramVideoProps {
  eyebrow?: string;
  vimeoUrl?: string;
}

/** Extract the numeric Vimeo ID from a full URL or accept a bare ID. */
function parseVimeoId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (/^\d+$/.test(trimmed)) return trimmed;
  const match = trimmed.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  return match?.[1] ?? null;
}

export function ProgramVideo({ eyebrow, vimeoUrl }: ProgramVideoProps) {
  if (!vimeoUrl) return null;
  const id = parseVimeoId(vimeoUrl);
  if (!id) return null;

  return (
    <section className="py-16 sm:py-[110px] border-b border-rule">
      <Container>
        <div className="max-w-[900px] mx-auto">
          <FadeIn>
            {eyebrow && <Label className="mb-4 block text-center">{eyebrow}</Label>}
            <div className="relative w-full overflow-hidden rounded-[2px] border border-rule" style={{ paddingTop: "56.25%" }}>
              <iframe
                src={`https://player.vimeo.com/video/${id}?byline=0&portrait=0&title=0`}
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
                title={eyebrow ?? "Programma video"}
              />
            </div>
          </FadeIn>
        </div>
      </Container>
    </section>
  );
}
