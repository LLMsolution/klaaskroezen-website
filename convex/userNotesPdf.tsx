"use node";

import React from "react";
import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";

type JsonNode = {
  type?: string;
  attrs?: Record<string, unknown>;
  text?: string;
  content?: JsonNode[];
  [key: string]: unknown;
};

const COPPER = "#B5622A";
const INK = "#0E0C0A";
const INK_MUTED = "#6B6560";

const styles = StyleSheet.create({
  page: {
    paddingTop: 56,
    paddingBottom: 56,
    paddingHorizontal: 56,
    fontSize: 11,
    fontFamily: "Helvetica",
    color: INK,
    lineHeight: 1.5,
  },
  cover: {
    paddingTop: 200,
    paddingHorizontal: 56,
    paddingBottom: 56,
  },
  coverEyebrow: {
    fontSize: 9,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: COPPER,
    marginBottom: 12,
    fontFamily: "Helvetica-Bold",
  },
  coverTitle: {
    fontSize: 32,
    fontFamily: "Helvetica-Bold",
    marginBottom: 16,
    lineHeight: 1.1,
  },
  coverMeta: {
    fontSize: 11,
    color: INK_MUTED,
    marginTop: 6,
  },
  sectionHeader: {
    fontSize: 9,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: COPPER,
    marginBottom: 6,
    marginTop: 20,
    fontFamily: "Helvetica-Bold",
  },
  moduleTitle: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    marginBottom: 14,
    color: INK,
  },
  heading: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    marginTop: 10,
    marginBottom: 6,
    color: INK,
  },
  paragraph: {
    marginBottom: 8,
    color: INK,
  },
  listItem: {
    marginLeft: 12,
    marginBottom: 4,
    color: INK,
  },
  timestamp: {
    color: COPPER,
    fontFamily: "Helvetica-Bold",
  },
  empty: {
    fontSize: 11,
    color: INK_MUTED,
    fontStyle: "italic",
  },
});

type LocalizedStr = { nl: string; en: string; de?: string };
type Lang = "nl" | "en" | "de";

function loc(obj: LocalizedStr, lang: Lang): string {
  return obj[lang] || obj.nl || obj.en || "";
}

function formatTimestamp(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function formatDate(lang: Lang): string {
  const now = new Date();
  const locale = lang === "nl" ? "nl-NL" : lang === "de" ? "de-DE" : "en-GB";
  return now.toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const COPY: Record<
  Lang,
  { eyebrow: string; student: string; exported: string; emptyNote: string }
> = {
  nl: {
    eyebrow: "Mijn notities",
    student: "Cursist",
    exported: "Geexporteerd",
    emptyNote: "Geen notities voor deze les.",
  },
  en: {
    eyebrow: "My notes",
    student: "Student",
    exported: "Exported",
    emptyNote: "No notes for this lesson.",
  },
  de: {
    eyebrow: "Meine Notizen",
    student: "Teilnehmer",
    exported: "Exportiert",
    emptyNote: "Keine Notizen fur diese Lektion.",
  },
};

/**
 * Render the inline content of a paragraph or heading node as an array of
 * <Text> elements. Timestamp nodes become copper `[m:ss]` tokens.
 */
function renderInline(nodes: JsonNode[] | undefined): React.ReactNode[] {
  if (!nodes) return [];
  const out: React.ReactNode[] = [];
  nodes.forEach((n, idx) => {
    const key = `in-${idx}`;
    if (n.type === "text" && typeof n.text === "string") {
      out.push(<Text key={key}>{n.text}</Text>);
    } else if (n.type === "timestamp") {
      const s = Number(n.attrs?.seconds ?? 0);
      out.push(
        <Text key={key} style={styles.timestamp}>
          {`[${formatTimestamp(s)}] `}
        </Text>,
      );
    } else if (n.type === "hardBreak") {
      out.push(<Text key={key}>{"\n"}</Text>);
    } else if (Array.isArray(n.content)) {
      out.push(...renderInline(n.content));
    }
  });
  return out;
}

function renderBlock(node: JsonNode, idx: number): React.ReactNode {
  const key = `b-${idx}`;
  switch (node.type) {
    case "heading": {
      return (
        <Text key={key} style={styles.heading}>
          {renderInline(node.content)}
        </Text>
      );
    }
    case "bulletList":
    case "orderedList": {
      const items = node.content ?? [];
      return (
        <View key={key}>
          {items.map((li, i) => (
            <Text key={`${key}-${i}`} style={styles.listItem}>
              {node.type === "orderedList" ? `${i + 1}. ` : "• "}
              {renderInline(li.content?.[0]?.content)}
            </Text>
          ))}
        </View>
      );
    }
    case "paragraph":
    default: {
      const children = renderInline(node.content);
      if (children.length === 0) return null;
      return (
        <Text key={key} style={styles.paragraph}>
          {children}
        </Text>
      );
    }
  }
}

function renderSection(
  moduleTitle: string,
  moduleLabel: string,
  contentJson: JsonNode | null,
  plainContent: string,
  emptyNote: string,
): React.ReactNode {
  const doc = contentJson && contentJson.type === "doc" ? contentJson : null;
  const blocks = doc?.content ?? [];
  const hasBlocks = blocks.some((b) => {
    if (b.type === "paragraph") return (b.content?.length ?? 0) > 0;
    return true;
  });

  return (
    <View>
      <Text style={styles.sectionHeader}>{moduleLabel}</Text>
      <Text style={styles.moduleTitle}>{moduleTitle}</Text>
      {hasBlocks ? (
        blocks.map((b, i) => renderBlock(b, i))
      ) : plainContent ? (
        <Text style={styles.paragraph}>{plainContent}</Text>
      ) : (
        <Text style={styles.empty}>{emptyNote}</Text>
      )}
    </View>
  );
}

export const exportTrainingNotes = action({
  args: {
    trainingId: v.id("trainings"),
    lang: v.union(v.literal("nl"), v.literal("en"), v.literal("de")),
  },
  handler: async (ctx, { trainingId, lang }) => {
    const data = await ctx.runQuery(
      internal.userNotes.getNotesForTrainingExport,
      { trainingId },
    );

    if (!data.sections.length) {
      throw new Error("EMPTY_NOTES");
    }

    const copy = COPY[lang];
    const trainingTitle = loc(data.training.title, lang);
    const studentName = data.user.name || "—";
    const exportedAt = formatDate(lang);

    const doc = (
      <Document>
        {/* Cover page */}
        <Page size="A4" style={styles.cover}>
          <Text style={styles.coverEyebrow}>{copy.eyebrow}</Text>
          <Text style={styles.coverTitle}>{trainingTitle}</Text>
          <Text style={styles.coverMeta}>
            {copy.student}: {studentName}
          </Text>
          <Text style={styles.coverMeta}>
            {copy.exported}: {exportedAt}
          </Text>
        </Page>

        {/* One page per module section, allowing natural overflow */}
        <Page size="A4" style={styles.page}>
          {data.sections.map((sec, i) => {
            const label = sec.moduleDisplayNumber?.trim() || `#${i + 1}`;
            const title = loc(sec.moduleTitle, lang);
            return (
              <View key={sec.moduleId} wrap>
                {renderSection(
                  title,
                  label,
                  sec.contentJson as JsonNode | null,
                  sec.content,
                  copy.emptyNote,
                )}
              </View>
            );
          })}
        </Page>
      </Document>
    );

    const buffer = await renderToBuffer(doc);
    const bytes = new Uint8Array(buffer);
    const blob = new Blob([bytes], { type: "application/pdf" });
    const storageId = await ctx.storage.store(blob);
    const url = await ctx.storage.getUrl(storageId);
    return { url, storageId };
  },
});
