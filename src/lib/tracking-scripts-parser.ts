/**
 * Parses a blob of HTML with one or more <script> and <noscript> tags
 * (such as a marketing-tracker snippet) into a list of blocks that can be
 * rendered as separate React elements.
 *
 * Used by `src/app/layout.tsx` to inject multiple trackers (GTM, Meta Pixel,
 * LinkedIn Insight, Leadinfo, etc.) from a single admin-managed setting.
 */

export type TrackingBlock =
  | { kind: "script-inline"; body: string; attrs: ScriptAttrs }
  | { kind: "script-src"; src: string; attrs: ScriptAttrs }
  | { kind: "noscript"; html: string };

export type ScriptAttrs = {
  type?: string;
  async?: boolean;
  defer?: boolean;
  id?: string;
  nonce?: string;
  crossOrigin?: "anonymous" | "use-credentials";
  integrity?: string;
};

const TAG_RE = /<(script|noscript)\b([^>]*)>([\s\S]*?)<\/\1>/gi;
const ATTR_RE = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*(?:=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
const COMMENT_RE = /<!--[\s\S]*?-->/g;

function parseAttrs(raw: string): ScriptAttrs & { src?: string } {
  const out: ScriptAttrs & { src?: string } = {};
  let m: RegExpExecArray | null;
  ATTR_RE.lastIndex = 0;
  while ((m = ATTR_RE.exec(raw)) !== null) {
    const name = m[1].toLowerCase();
    const value = m[2] ?? m[3] ?? m[4] ?? "";
    switch (name) {
      case "src":
        out.src = value;
        break;
      case "async":
        out.async = true;
        break;
      case "defer":
        out.defer = true;
        break;
      case "type":
        out.type = value || undefined;
        break;
      case "id":
        out.id = value || undefined;
        break;
      case "nonce":
        out.nonce = value || undefined;
        break;
      case "integrity":
        out.integrity = value || undefined;
        break;
      case "crossorigin":
        out.crossOrigin = value === "use-credentials" ? "use-credentials" : "anonymous";
        break;
    }
  }
  return out;
}

export function parseTrackingScripts(raw: string | undefined | null): TrackingBlock[] {
  if (!raw) return [];
  const cleaned = raw.replace(COMMENT_RE, "");
  const blocks: TrackingBlock[] = [];
  let m: RegExpExecArray | null;
  TAG_RE.lastIndex = 0;
  while ((m = TAG_RE.exec(cleaned)) !== null) {
    const tag = m[1].toLowerCase();
    const attrsRaw = m[2] ?? "";
    const inner = m[3] ?? "";
    if (tag === "noscript") {
      const html = inner.trim();
      if (html) blocks.push({ kind: "noscript", html });
      continue;
    }
    const attrs = parseAttrs(attrsRaw);
    if (attrs.src) {
      const { src, ...rest } = attrs;
      blocks.push({ kind: "script-src", src, attrs: rest });
    } else {
      const body = inner.trim();
      if (body) blocks.push({ kind: "script-inline", body, attrs });
    }
  }
  return blocks;
}
