import { Node, mergeAttributes } from "@tiptap/core";
import { formatTimestamp, getVimeoPlayer } from "./vimeoPlayer";

/**
 * Custom inline atom node representing a clickable video timestamp chip.
 * Renders as `<button data-timestamp="123">[2:03]</button>`. On click, it
 * seeks and plays the nearest Vimeo iframe on the page.
 *
 * Serializes to `{ type: "timestamp", attrs: { seconds } }` in JSON.
 */
export const TimestampNode = Node.create({
  name: "timestamp",
  group: "inline",
  inline: true,
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      seconds: {
        default: 0,
        parseHTML: (el) => {
          const raw = (el as HTMLElement).getAttribute("data-timestamp");
          const n = raw ? parseInt(raw, 10) : 0;
          return Number.isFinite(n) ? n : 0;
        },
        renderHTML: (attrs) => ({ "data-timestamp": String(attrs.seconds) }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "button[data-timestamp]" }];
  },

  renderHTML({ HTMLAttributes, node }) {
    const seconds = (node.attrs.seconds as number) ?? 0;
    return [
      "button",
      mergeAttributes(HTMLAttributes, {
        type: "button",
        class:
          "tiptap-timestamp inline-flex items-center px-2 py-0.5 mx-0.5 rounded-[2px] bg-copper/10 text-copper text-[12px] font-medium tabular-nums hover:bg-copper/20 transition-colors cursor-pointer select-none",
        contenteditable: "false",
      }),
      `[${formatTimestamp(seconds)}]`,
    ];
  },

  addNodeView() {
    return ({ node }) => {
      const seconds = (node.attrs.seconds as number) ?? 0;
      const dom = document.createElement("button");
      dom.type = "button";
      dom.dataset.timestamp = String(seconds);
      dom.className =
        "tiptap-timestamp inline-flex items-center px-2 py-0.5 mx-0.5 rounded-[2px] bg-copper/10 text-copper text-[12px] font-medium tabular-nums hover:bg-copper/20 transition-colors cursor-pointer select-none";
      dom.contentEditable = "false";
      dom.textContent = `[${formatTimestamp(seconds)}]`;
      dom.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const player = await getVimeoPlayer();
        if (!player) return;
        try {
          await player.setCurrentTime(seconds);
          await player.play();
        } catch {
          /* player not ready */
        }
      });
      return { dom };
    };
  },
});
