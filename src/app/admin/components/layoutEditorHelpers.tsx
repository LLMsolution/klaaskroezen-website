/** Resize image to max 1920px and convert to WebP */
export async function resizeImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      let { width, height } = img;
      const MAX = 1920;
      if (width > MAX || height > MAX) {
        const ratio = Math.min(MAX / width, MAX / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas not supported"));
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Blob failed"))),
        "image/webp",
        0.85,
      );
    };
    img.onerror = () => reject(new Error("Image load failed"));
    img.src = URL.createObjectURL(file);
  });
}

export function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    chatting: { label: "Chat", className: "bg-blue-50 text-blue-700" },
    planning: { label: "Plan bijwerken...", className: "bg-amber-50 text-amber-700" },
    locked: { label: "Klaar", className: "bg-blue-50 text-blue-700" },
    building: { label: "Bouwen...", className: "bg-amber-50 text-amber-700" },
    preview: { label: "Preview klaar", className: "bg-green-50 text-green-700" },
    approved: { label: "Goedgekeurd", className: "bg-green-100 text-green-800" },
    rejected: { label: "Afgewezen", className: "bg-ink/5 text-ink/40" },
    failed: { label: "Mislukt", className: "bg-red-50 text-red-700" },
  };
  const c = config[status] ?? { label: status, className: "bg-ink/5 text-ink/40" };
  return <span className={`inline-block text-[11px] font-medium px-2.5 py-1 rounded-[2px] mt-1 ${c.className}`}>{c.label}</span>;
}

export function MessageBubble({ message }: { message: { role: string; text: string; createdAt: number } }) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";
  const isAssistant = message.role === "assistant";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[85%] px-3.5 py-2.5 rounded-[2px] text-[13px] leading-[1.6] ${
        isUser ? "bg-copper text-paper" : isSystem ? "bg-ink/5 text-ink/60 italic" : "bg-warm border border-rule text-ink"
      }`}>
        {isAssistant ? (
          <div dangerouslySetInnerHTML={{ __html: renderMarkdown(message.text) }} />
        ) : (
          message.text
        )}
      </div>
    </div>
  );
}

/** Simple markdown → HTML renderer for plan and chat */
export function renderMarkdown(md: string): string {
  return md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    // Headings
    .replace(/^### (.+)$/gm, '<h4 style="font-size:13px;font-weight:700;color:#0E0C0A;margin:12px 0 4px;">$1</h4>')
    .replace(/^## (.+)$/gm, '<h3 style="font-size:14px;font-weight:700;color:#0E0C0A;margin:16px 0 6px;">$1</h3>')
    .replace(/^# (.+)$/gm, '<h2 style="font-size:16px;font-weight:700;color:#0E0C0A;margin:20px 0 8px;">$1</h2>')
    // Bold + italic
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#0E0C0A;">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code style="background:#EDE9E2;padding:1px 4px;border-radius:2px;font-size:12px;">$1</code>')
    // List items
    .replace(/^[*\-] (.+)$/gm, '<div style="padding-left:16px;margin:2px 0;">• $1</div>')
    // Line breaks
    .replace(/\n\n/g, '<div style="height:8px;"></div>')
    .replace(/\n/g, '<br />');
}
