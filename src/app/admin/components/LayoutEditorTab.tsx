"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { Loading } from "./shared";


export function LayoutEditorTab() {
  const pages = useQuery(api.siteContent.listPages);
  const activeSession = useQuery(api.layoutEditor.getActiveSession);
  const revertableSession = useQuery(api.layoutEditor.getRevertableSession);
  const startSession = useMutation(api.layoutEditor.startSession);
  const addMessage = useMutation(api.layoutEditor.addMessage);
  const triggerPlanUpdate = useAction(api.layoutEditorActions.triggerPlanUpdate);
  const triggerBuild = useAction(api.layoutEditorActions.triggerBuild);
  const approveSession = useAction(api.layoutEditorActions.approveSession);
  const rejectSession = useAction(api.layoutEditorActions.rejectSession);
  const revertSessionAction = useAction(api.layoutEditorActions.revertSession);

  const [selectedPage, setSelectedPage] = useState("");
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession?.messages?.length]);

  if (pages === undefined || activeSession === undefined) return <Loading />;

  const isActive = activeSession && !["approved", "rejected", "failed", "reverted"].includes(activeSession.status);
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
      await triggerPlanUpdate({
        sessionId: session._id,
        message: text,
        targetPage: session.targetPage,
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Fout bij verzenden.");
    } finally {
      setSending(false);
    }
  }

  async function handleBuild() {
    if (!session?.plan) return;
    if (!confirm("Weet je zeker dat je wilt bouwen op basis van dit plan?")) return;
    try {
      await triggerBuild({
        sessionId: session._id,
        targetPage: session.targetPage,
        branchName: session.branchName,
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Fout bij starten build.");
    }
  }

  async function handleApprove() {
    if (!session) return;
    if (!confirm("Goedkeuren en live zetten? De content wordt na ~5 min bewerkbaar in het Content tabblad.")) return;
    try {
      await approveSession({ sessionId: session._id, syncContent: true });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Fout bij goedkeuren.");
    }
  }

  async function handleReject() {
    if (!session) return;
    if (!confirm("Afkeuren? De branch wordt verwijderd.")) return;
    try {
      await rejectSession({ sessionId: session._id });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Fout bij afkeuren.");
    }
  }

  // Lock by another user
  if (activeSession && !["approved", "rejected", "failed", "reverted"].includes(activeSession.status) && !session) {
    return (
      <div className="text-center py-16">
        <p className="text-[15px] text-ink/60">Er is een actieve sessie van <strong>{activeSession.userEmail}</strong>.</p>
        <p className="text-[13px] text-ink/40 mt-2">Wacht tot deze sessie is afgesloten.</p>
      </div>
    );
  }

  if (!session) {
    return (
      <StartScreen
        pages={pages}
        selectedPage={selectedPage}
        onPageChange={setSelectedPage}
        onStart={handleStartSession}
        revertable={revertableSession ?? null}
        onRevert={async (id) => {
          if (!confirm("Weet je zeker dat je de laatste layout wijziging wilt terugdraaien? Dit kan niet ongedaan worden.")) return;
          try {
            await revertSessionAction({ sessionId: id });
          } catch (err) {
            alert(err instanceof Error ? err.message : "Fout bij terugdraaien.");
          }
        }}
      />
    );
  }

  const showPreview = session.status === "preview" || session.status === "building";
  const previewUrl = session.previewUrl ? `${session.previewUrl}/${session.targetPage}` : null;

  return (
    <div className="flex gap-0 h-[calc(100dvh-180px)] -mx-6 lg:-mx-10 -my-8">
      {/* Left: Chat */}
      <ChatPanel
        session={session}
        inputText={inputText}
        sending={sending}
        onInputChange={setInputText}
        onSend={handleSendMessage}
        onBuild={handleBuild}
        onApprove={handleApprove}
        onReject={handleReject}
        onBack={async () => {
          if (!confirm("Sessie afsluiten? De branch en eventuele PR worden verwijderd.")) return;
          try {
            await rejectSession({ sessionId: session._id });
          } catch { /* ignore */ }
        }}
        messagesEndRef={messagesEndRef}
      />
      {/* Right: Plan or Preview */}
      {showPreview ? (
        <PreviewPanel previewUrl={previewUrl} status={session.status} />
      ) : (
        <PlanPanel plan={session.plan} planVersion={session.planVersion} status={session.status} />
      )}
    </div>
  );
}

/* ─── Start screen ─── */

function StartScreen({ pages, selectedPage, onPageChange, onStart, revertable, onRevert }: {
  pages: { slug: string; title: { nl: string; en: string } }[];
  selectedPage: string;
  onPageChange: (v: string) => void;
  onStart: () => void;
  revertable: { _id: Id<"layoutSessions">; targetPage: string; completedAt?: number; userEmail: string; plan?: string } | null;
  onRevert: (sessionId: Id<"layoutSessions">) => void;
}) {
  const [newPageMode, setNewPageMode] = useState(false);
  const [newPageName, setNewPageName] = useState("");

  return (
    <div className="max-w-[500px] mx-auto py-16">
      <h2 className="font-display text-[24px] font-black tracking-[-0.02em] mb-2">Layout Editor</h2>
      <p className="text-[14px] text-ink/60 leading-[1.7] mb-8">
        Chat met de AI over welke wijzigingen je wilt maken. Het plan wordt automatisch bijgewerkt. Als je tevreden bent, klik je op &quot;Bouwen&quot; om de code te laten schrijven.
      </p>
      <div className="space-y-4">
        <div>
          <label className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/40 mb-2 block">Pagina</label>
          {newPageMode ? (
            <div className="space-y-2">
              <input
                type="text"
                value={newPageName}
                onChange={(e) => { setNewPageName(e.target.value); onPageChange(`new:${e.target.value}`); }}
                placeholder="Naam van de nieuwe pagina"
                className="w-full bg-transparent border border-rule px-3 py-2.5 text-[13px] text-ink focus:border-copper focus:outline-none rounded-[2px]"
                autoFocus
              />
              <button onClick={() => { setNewPageMode(false); setNewPageName(""); onPageChange(""); }}
                className="text-[12px] text-ink/40 hover:text-ink cursor-pointer">
                Bestaande pagina kiezen
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <select value={selectedPage} onChange={(e) => onPageChange(e.target.value)}
                className="w-full bg-transparent border border-rule px-3 py-2.5 text-[13px] text-ink focus:border-copper focus:outline-none rounded-[2px] cursor-pointer">
                <option value="">Selecteer een pagina...</option>
                {pages.map((p) => (<option key={p.slug} value={p.slug}>{p.title.nl}</option>))}
              </select>
              <button onClick={() => setNewPageMode(true)}
                className="text-[12px] text-copper hover:text-copper-light cursor-pointer">
                + Nieuwe pagina aanmaken
              </button>
            </div>
          )}
        </div>
        <button onClick={onStart} disabled={!selectedPage}
          className="w-full bg-copper text-paper px-6 py-3 text-[13px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors rounded-[2px] cursor-pointer disabled:opacity-40">
          Sessie starten
        </button>
      </div>

      {/* Revert last approved change */}
      {revertable && (
        <div className="mt-10 pt-8 border-t border-rule">
          <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/40 mb-3">Laatste wijziging</p>
          <div className="border border-rule rounded-[2px] p-4 bg-warm/20">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[13px] font-medium text-ink">{revertable.targetPage}</p>
              <span className="text-[11px] text-ink/40">
                {revertable.completedAt ? new Date(revertable.completedAt).toLocaleDateString("nl-NL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : ""}
              </span>
            </div>
            <p className="text-[12px] text-ink/50 mb-3 line-clamp-2">
              {revertable.plan ? revertable.plan.slice(0, 150) + (revertable.plan.length > 150 ? "..." : "") : "Geen plan beschikbaar"}
            </p>
            <button
              onClick={() => onRevert(revertable._id)}
              className="text-[11px] font-medium tracking-[0.1em] uppercase text-red-600 hover:text-red-700 cursor-pointer"
            >
              Terugdraaien
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Chat panel (left) ─── */

function ChatPanel({ session, inputText, sending, onInputChange, onSend, onBuild, onApprove, onReject, onBack, messagesEndRef }: {
  session: { _id: string; targetPage: string; status: string; plan?: string; messages: { role: string; text: string; createdAt: number }[]; errorMessage?: string };
  inputText: string;
  sending: boolean;
  onInputChange: (v: string) => void;
  onSend: () => void;
  onBuild: () => void;
  onApprove: () => void;
  onReject: () => void;
  onBack: () => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}) {
  const isPlanning = session.status === "planning";
  const isPreview = session.status === "preview";
  const canChat = session.status === "chatting";
  const hasPlan = !!session.plan;

  return (
    <div className="w-[40%] min-w-[320px] border-r border-rule flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-rule bg-warm/20">
        <div className="flex items-center justify-between mb-1">
          <button onClick={onBack} className="text-[11px] text-ink/40 hover:text-ink cursor-pointer">
            ← Terug
          </button>
          <StatusBadge status={session.status} />
        </div>
        <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper">{session.targetPage}</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {session.messages.length === 0 && (
          <p className="text-[13px] text-ink/30 text-center py-8">
            Beschrijf wat je wilt veranderen. De AI maakt automatisch een plan.
          </p>
        )}
        {session.messages.map((msg, i) => (<MessageBubble key={i} message={msg} />))}
        {isPlanning && (
          <div className="flex justify-start">
            <div className="bg-warm border border-rule rounded-[2px] px-3.5 py-2.5 text-[13px] text-ink/50 flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-copper/30 border-t-copper rounded-full animate-spin" />
              Claude denkt na...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error */}
      {session.errorMessage && (
        <div className="mx-5 mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded-[2px]">
          <p className="text-[12px] text-red-700">{session.errorMessage}</p>
        </div>
      )}

      {/* Action buttons */}
      {isPreview && (
        <div className="px-5 py-3 border-t border-rule flex gap-2">
          <button onClick={onApprove} className="flex-1 bg-green-700 text-white px-4 py-2.5 text-[12px] font-medium tracking-[0.1em] uppercase hover:bg-green-800 transition-colors rounded-[2px] cursor-pointer">
            Goedkeuren
          </button>
          <button onClick={onReject} className="flex-1 bg-ink/10 text-ink px-4 py-2.5 text-[12px] font-medium tracking-[0.1em] uppercase hover:bg-ink/20 transition-colors rounded-[2px] cursor-pointer">
            Afkeuren
          </button>
        </div>
      )}

      {/* Input + build button */}
      <div className="px-5 py-4 border-t border-rule space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && onSend()}
            placeholder="Beschrijf je wijziging..."
            disabled={!canChat || sending}
            className="flex-1 border border-rule px-3 py-2.5 text-[13px] text-ink placeholder:text-ink/30 focus:border-copper focus:outline-none rounded-[2px] disabled:opacity-40"
          />
          <button onClick={onSend} disabled={!canChat || sending || !inputText.trim()}
            className="bg-copper text-paper px-4 py-2.5 text-[12px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors rounded-[2px] cursor-pointer disabled:opacity-40">
            {sending ? "..." : "Stuur"}
          </button>
        </div>
        {hasPlan && canChat && (
          <button onClick={onBuild}
            className="w-full bg-green-700 text-white px-4 py-2.5 text-[12px] font-medium tracking-[0.1em] uppercase hover:bg-green-800 transition-colors rounded-[2px] cursor-pointer">
            Bouwen op basis van plan
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Plan panel (right, shown during chat) ─── */

function PlanPanel({ plan, planVersion, status }: { plan?: string; planVersion?: number; status: string }) {
  return (
    <div className="flex-1 flex flex-col bg-warm/10">
      <div className="px-5 py-3 border-b border-rule flex items-center justify-between">
        <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/40">
          Plan {planVersion ? `v${planVersion}` : ""}
        </p>
        {status === "planning" && (
          <span className="text-[11px] text-copper flex items-center gap-1.5">
            <div className="w-2 h-2 border border-copper/30 border-t-copper rounded-full animate-spin" />
            Wordt bijgewerkt...
          </span>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-5">
        {plan ? (
          <div className="max-w-none text-[13px] leading-[1.8] text-ink/70" dangerouslySetInnerHTML={{ __html: renderMarkdown(plan) }} />
        ) : (
          <div className="flex items-center justify-center h-full text-ink/20 text-[14px]">
            <div className="text-center">
              <p>Het plan verschijnt hier</p>
              <p className="text-[12px] mt-1">Stuur een bericht om te beginnen</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Preview panel (right, shown during build/preview) ─── */

function PreviewPanel({ previewUrl, status }: {
  previewUrl: string | null;
  status: string;
}) {
  return (
    <div className="flex-1 flex flex-col bg-warm/10">
      <div className="px-5 py-3 border-b border-rule">
        <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/40">Preview</p>
      </div>
      <div className="flex-1 flex items-center justify-center p-8">
        {previewUrl ? (
          <div className="text-center max-w-[400px]">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-50 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="font-display text-[18px] font-bold text-ink mb-2">Preview is klaar</h3>
            <p className="text-[13px] text-ink/50 leading-[1.7] mb-6">
              De wijziging staat op een preview URL. Bekijk het resultaat en keur goed of af.
            </p>
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-copper text-paper px-8 py-3 text-[13px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors rounded-[2px]"
            >
              Preview bekijken ↗
            </a>
            <p className="text-[11px] text-ink/30 mt-4 break-all">{previewUrl}</p>
          </div>
        ) : (
          <div className="text-center text-ink/30 text-[14px]">
            {status === "building" ? (
              <div>
                <div className="inline-block w-5 h-5 border-2 border-copper/30 border-t-copper rounded-full animate-spin mb-3" />
                <p>Build wordt uitgevoerd...</p>
                <p className="text-[12px] text-ink/20 mt-1">Dit duurt 3-5 minuten</p>
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

/* ─── UI components ─── */

function StatusBadge({ status }: { status: string }) {
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

function MessageBubble({ message }: { message: { role: string; text: string; createdAt: number } }) {
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
function renderMarkdown(md: string): string {
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
