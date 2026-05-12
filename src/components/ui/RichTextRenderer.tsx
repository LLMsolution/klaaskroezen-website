import DOMPurify from "isomorphic-dompurify";

interface Props {
  html: string;
  className?: string;
}

const ALLOWED_TAGS = [
  "p", "br", "strong", "b", "em", "i", "u", "s",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li",
  "a", "blockquote", "code", "pre", "hr",
];
const ALLOWED_ATTR = ["href", "target", "rel"];

export function RichTextRenderer({ html, className }: Props) {
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
  });
  return (
    <div
      className={className ?? "prose prose-lg max-w-none"}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
