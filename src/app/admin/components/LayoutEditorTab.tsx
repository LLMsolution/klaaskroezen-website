"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Loading } from "./shared";

type ViewportSize = "desktop" | "tablet" | "mobile";
const VIEWPORT_WIDTHS: Record<ViewportSize, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "375px",
};

export function LayoutEditorTab() {
  const pages = useQuery(api.siteContent.listPages);
  const activeSession = useQuery(api.layoutEditor.getActiveSession);
  const startSession = useMutation(api.layoutEditor.startSession);
  const addMessage = useMutation(api.layoutEditor.addMessage);
  const triggerBuild = useAction(api.layoutEditorActions.triggerBuild);
  const approveSession = useAction(api.layoutEditorActions.approveSession);
  const rejectSession = useAction(api.layoutEditorActions.rejectSession);

  const [selectedPage, setSelectedPage] = useState("");
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [viewport, setViewport] = useState<ViewportSize>("desktop");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession?.messages?.length]);

  if (pages === undefined || activeSession === undefined) return <Loading />;

  const isActive =
    activeSession &&
    !["approved", "rejected", "failed"].includes(activeSession.status);
  const session = isActive ? activeSession : null;

  async function handleStartSession() {
    if (!selectedPage) return;
    try {
      await startSession({ targetPage: selectedPage });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Fout bij starten sessie.");
    }
  }

  async function handleSendMessage() {
    if (!session || !inputText.trim()) return;
    const text = inputText.trim();
    setInputText("");
    setSending(true);
    try {
      await addMessage({ sessionId: session._id, role: "user", text });
      await triggerBuild({
        sessionId: session._id,
        prompt: text,
        targetPage: session.targetPage,
        branchName: session.branchName,
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Fout bij verzenden.");
    } finally {
      setSending(false);
    }
  }

  async function handleApprove() {
    if (!session) return;
    if (
      !confirm(
        "Weet je zeker dat je deze wijziging wilt goedkeuren en live wilt zetten?",
      )
    )
      return;
    try {
      await approveSession({ sessionId: session._id });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Fout bij goedkeuren.");
    }
  }

  async function handleReject() {
    if (!session) return;
    if (
      !confirm(
        "Weet je zeker dat je deze wijziging wilt afkeuren? De branch wordt verwijderd.",
      )
    )
      return;
    try {
      await rejectSession({ sessionId: session._id });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Fout bij afkeuren.");
    }
  }

  // Lock by another user
  if (
    activeSession &&
    !["approved", "rejected", "failed"].includes(activeSession.status) &&
    !session
  ) {
    return (
      <div className="text-center py-16">
        <p className="text-[15px] text-ink/60">
          Er is een actieve sessie van{" "}
          <strong>{activeSession.userEmail}</strong>.
        </p>
        <p className="text-[13px] text-ink/40 mt-2">
          Wacht tot deze sessie is afgesloten.
        </p>
      </div>
    );
  }

  // No active session — start screen
  if (!session) {
    return <StartScreen pages={pages} selectedPage={selectedPage} onPageChange={setSelectedPage} onStart={handleStartSession} />;
  }

  // Active session — chat + preview
  const previewUrl = session.previewUrl
    ? `${session.previewUrl}/${session.targetPage}`
    : null;

  return (
    <div className="flex gap-0 h-[calc(100dvh-180px)] -mx-6 lg:-mx-10 -my-8">
      <ChatPanel
        session={session}
        inputText={inputText}
        sending={sending}
        onInputChange={setInputText}
        onSend={handleSendMessage}
        onApprove={handleApprove}
        onReject={handleReject}
        messagesEndRef={messagesEndRef}
      />
      <PreviewPanel
        previewUrl={previewUrl}
        status={session.status}
        viewport={viewport}
        onViewportChange={setViewport}
      />
    </div>
  );
}

// ── Sub-components ──

function StartScreen({
  pages,
  selectedPage,
  onPageChange,
  onStart,
}: {
  pages: { slug: string; title: { nl: string; en: string } }[];
  selectedPage: string;
  onPageChange: (v: string) => void;
  onStart: () => void;
}) {
  return (
    <div className="max-w-[500px] mx-auto py-16">
      <h2 className="font-display text-[24px] font-black tracking-[-0.02em] mb-2">
        Layout Editor
      </h2>
      <p className="text-[14px] text-ink/60 leading-[1.7] mb-8">
        Beschrijf in natuurlijke taal welke visuele wijzigingen je wilt maken.
        De AI past de code aan en je ziet een preview voordat het live gaat.
      </p>
      <div className="space-y-4">
        <div>
          <label className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/40 mb-2 block">
            Pagina
          </label>
          <select
            value={selectedPage}
            onChange={(e) => onPageChange(e.target.value)}
            className="w-full bg-transparent border border-rule px-3 py-2.5 text-[13px] text-ink focus:border-copper focus:outline-none rounded-[2px] cursor-pointer"
          >
            <option value="">Selecteer een pagina...</option>
            {pages.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.title.nl}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={onStart}
          disabled={!selectedPage}
          className="w-full bg-copper text-paper px-6 py-3 text-[13px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors rounded-[2px] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Sessie starten
        </button>
      </div>
    </div>
  );
}

function ChatPanel({
  session,
  inputText,
  sending,
  onInputChange,
  onSend,
  onApprove,
  onReject,
  messagesEndRef,
}: {
  session: {
    targetPage: string;
    status: string;
    messages: { role: string; text: string; createdAt: number }[];
    errorMessage?: string;
  };
  inputText: string;
  sending: boolean;
  onInputChange: (v: string) => void;
  onSend: () => void;
  onApprove: () => void;
  onReject: () => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className="w-[40%] min-w-[320px] border-r border-rule flex flex-col">
      {/* Session header */}
      <div className="px-5 py-4 border-b border-rule bg-warm/20">
        <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper">
          {session.targetPage}
        </p>
        <SessionStatusBadge status={session.status} />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {session.messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Error */}
      {session.errorMessage && (
        <div className="mx-5 mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded-[2px]">
          <p className="text-[12px] text-red-700">{session.errorMessage}</p>
        </div>
      )}

      {/* Approve / Reject buttons */}
      {session.status === "preview" && (
        <div className="px-5 py-3 border-t border-rule flex gap-2">
          <button
            onClick={onApprove}
            className="flex-1 bg-green-700 text-white px-4 py-2.5 text-[12px] font-medium tracking-[0.1em] uppercase hover:bg-green-800 transition-colors rounded-[2px] cursor-pointer"
          >
            Goedkeuren
          </button>
          <button
            onClick={onReject}
            className="flex-1 bg-ink/10 text-ink px-4 py-2.5 text-[12px] font-medium tracking-[0.1em] uppercase hover:bg-ink/20 transition-colors rounded-[2px] cursor-pointer"
          >
            Afkeuren
          </button>
        </div>
      )}

      {/* Input */}
      <div className="px-5 py-4 border-t border-rule">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && !e.shiftKey && onSend()
            }
            placeholder="Beschrijf je wijziging..."
            disabled={sending || session.status === "building"}
            className="flex-1 border border-rule px-3 py-2.5 text-[13px] text-ink placeholder:text-ink/30 focus:border-copper focus:outline-none rounded-[2px] disabled:opacity-40"
          />
          <button
            onClick={onSend}
            disabled={sending || !inputText.trim() || session.status === "building"}
            className="bg-copper text-paper px-4 py-2.5 text-[12px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors rounded-[2px] cursor-pointer disabled:opacity-40"
          >
            {sending ? "..." : "Stuur"}
          </button>
        </div>
      </div>
    </div>
  );
}

function PreviewPanel({
  previewUrl,
  status,
  viewport,
  onViewportChange,
}: {
  previewUrl: string | null;
  status: string;
  viewport: ViewportSize;
  onViewportChange: (v: ViewportSize) => void;
}) {
  return (
    <div className="flex-1 flex flex-col bg-warm/10">
      {/* Preview header */}
      <div className="px-5 py-3 border-b border-rule flex items-center justify-between">
        <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/40">
          Preview
        </p>
        <div className="flex items-center gap-1">
          {(["desktop", "tablet", "mobile"] as ViewportSize[]).map((size) => (
            <button
              key={size}
              onClick={() => onViewportChange(size)}
              className={`text-[11px] px-2.5 py-1 rounded-[2px] cursor-pointer transition-colors ${
                viewport === size
                  ? "bg-copper text-paper"
                  : "text-ink/40 hover:text-ink hover:bg-ink/5"
              }`}
            >
              {size === "desktop"
                ? "Desktop"
                : size === "tablet"
                  ? "Tablet"
                  : "Mobile"}
            </button>
          ))}
          {previewUrl && (
            <button
              onClick={() => {
                const iframe =
                  document.querySelector<HTMLIFrameElement>("#preview-frame");
                if (iframe) iframe.src = iframe.src;
              }}
              className="ml-2 text-[11px] text-ink/40 hover:text-ink cursor-pointer"
            >
              Vernieuwen
            </button>
          )}
        </div>
      </div>

      {/* Preview iframe */}
      <div className="flex-1 flex items-start justify-center p-4 overflow-auto">
        {previewUrl ? (
          <iframe
            id="preview-frame"
            src={previewUrl}
            style={{ width: VIEWPORT_WIDTHS[viewport], height: "100%" }}
            className="border border-rule rounded-[2px] bg-white transition-all duration-300"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-ink/30 text-[14px]">
            {status === "building" ? (
              <div className="text-center">
                <div className="inline-block w-5 h-5 border-2 border-copper/30 border-t-copper rounded-full animate-spin mb-3" />
                <p>Build wordt uitgevoerd...</p>
                <p className="text-[12px] text-ink/20 mt-1">
                  Dit duurt 3-5 minuten
                </p>
              </div>
            ) : (
              <p>Preview verschijnt hier na de build</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SessionStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    locked: { label: "Klaar", className: "bg-blue-50 text-blue-700" },
    building: { label: "Bezig...", className: "bg-amber-50 text-amber-700" },
    preview: {
      label: "Preview klaar",
      className: "bg-green-50 text-green-700",
    },
    approved: {
      label: "Goedgekeurd",
      className: "bg-green-100 text-green-800",
    },
    rejected: { label: "Afgewezen", className: "bg-ink/5 text-ink/40" },
    failed: { label: "Mislukt", className: "bg-red-50 text-red-700" },
  };
  const c = config[status] ?? {
    label: status,
    className: "bg-ink/5 text-ink/40",
  };

  return (
    <span
      className={`inline-block text-[11px] font-medium px-2.5 py-1 rounded-[2px] mt-1 ${c.className}`}
    >
      {c.label}
    </span>
  );
}

function MessageBubble({
  message,
}: {
  message: { role: string; text: string; createdAt: number };
}) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] px-3.5 py-2.5 rounded-[2px] text-[13px] leading-[1.6] ${
          isUser
            ? "bg-copper text-paper"
            : isSystem
              ? "bg-ink/5 text-ink/60 italic"
              : "bg-warm border border-rule text-ink"
        }`}
      >
        {message.text}
      </div>
    </div>
  );
}
