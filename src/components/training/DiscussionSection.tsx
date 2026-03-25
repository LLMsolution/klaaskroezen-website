"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import type { Lang } from "@/lib/i18n";

const discussionI18n = {
  nl: { title: "Discussie", newest: "Nieuwst", mostVoted: "Meest gestemd", placeholder: "Stel een vraag of deel je inzicht...", post: "Plaatsen", trainer: "Trainer", reply: "Reageer", replyPlaceholder: "Je reactie...", cancel: "Annuleer", empty: "Nog geen berichten. Stel de eerste vraag!" },
  en: { title: "Discussion", newest: "Newest", mostVoted: "Most voted", placeholder: "Ask a question or share your insight...", post: "Post", trainer: "Trainer", reply: "Reply", replyPlaceholder: "Your reply...", cancel: "Cancel", empty: "No posts yet. Ask the first question!" },
  de: { title: "Diskussion", newest: "Neueste", mostVoted: "Meiste Stimmen", placeholder: "Stellen Sie eine Frage oder teilen Sie Ihre Erkenntnis...", post: "Posten", trainer: "Trainer", reply: "Antworten", replyPlaceholder: "Ihre Antwort...", cancel: "Abbrechen", empty: "Noch keine Beitrage. Stellen Sie die erste Frage!" },
};

interface Props {
  moduleId: Id<"trainingModules">;
  lang: Lang;
}

export function DiscussionSection({ moduleId, lang }: Props) {
  const [sortBy, setSortBy] = useState<"newest" | "upvoted">("newest");
  const posts = useQuery(api.discussions.listForModule, { moduleId, sortBy });
  const createPost = useMutation(api.discussions.create);
  const replyMutation = useMutation(api.discussions.reply);
  const toggleVote = useMutation(api.discussions.toggleVote);

  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<Id<"discussions"> | null>(null);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const di = discussionI18n[lang];

  async function handlePost() {
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      await createPost({ moduleId, text: text.trim() });
      setText("");
    } catch {
      // Handle error
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReply(parentId: Id<"discussions">) {
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      await replyMutation({ parentId, text: replyText.trim() });
      setReplyText("");
      setReplyTo(null);
    } catch {
      // Handle error
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="my-10">
      <div className="flex items-center justify-between mb-6">
        <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper">
          {di.title}
        </p>
        <div className="flex gap-2">
          <SortButton active={sortBy === "newest"} onClick={() => setSortBy("newest")}>
            {di.newest}
          </SortButton>
          <SortButton active={sortBy === "upvoted"} onClick={() => setSortBy("upvoted")}>
            {di.mostVoted}
          </SortButton>
        </div>
      </div>

      {/* Post form */}
      <div className="mb-6">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={di.placeholder}
          rows={3}
          className="w-full bg-transparent border border-rule px-4 py-3 text-[14px] text-ink focus:border-copper focus:outline-none rounded-[2px] mb-2"
        />
        <button
          onClick={handlePost}
          disabled={submitting || !text.trim()}
          className="bg-copper text-paper px-5 py-2.5 text-[12px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors rounded-[2px] disabled:opacity-50 cursor-pointer"
        >
          {di.post}
        </button>
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {(posts ?? []).map((post) => (
          <div key={post._id} className="border border-rule rounded-[2px]">
            {/* Main post */}
            <div className="p-5">
              <div className="flex items-start gap-3">
                <button
                  onClick={() => toggleVote({ discussionId: post._id })}
                  className="shrink-0 flex flex-col items-center gap-0.5 cursor-pointer text-ink/30 hover:text-copper transition-colors"
                >
                  <UpvoteIcon />
                  <span className="text-[12px] font-medium">{post.upvotes}</span>
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-[13px] font-medium text-ink">{post.userName}</p>
                    {post.isTrainer && (
                      <span className="text-[10px] font-medium text-copper bg-copper/10 px-1.5 py-0.5 rounded-[2px]">
                        {di.trainer}
                      </span>
                    )}
                    <span className="text-[11px] text-ink/30">
                      {formatTimeAgo(post.createdAt, lang)}
                    </span>
                  </div>
                  <p className="text-[14px] text-ink leading-[1.7] whitespace-pre-wrap">
                    {post.text}
                  </p>
                  <button
                    onClick={() => setReplyTo(replyTo === post._id ? null : post._id)}
                    className="mt-2 text-[12px] text-ink/30 hover:text-copper cursor-pointer"
                  >
                    {di.reply}
                  </button>
                </div>
              </div>
            </div>

            {/* Replies */}
            {post.replies.length > 0 && (
              <div className="border-t border-rule bg-warm/30">
                {post.replies.map((reply) => (
                  <div key={reply._id} className="px-5 py-3 ml-10 border-b border-rule/50 last:border-b-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-[12px] font-medium text-ink">{reply.userName}</p>
                      {reply.isTrainer && (
                        <span className="text-[10px] font-medium text-copper bg-copper/10 px-1.5 py-0.5 rounded-[2px]">
                          {di.trainer}
                        </span>
                      )}
                      <span className="text-[11px] text-ink/30">
                        {formatTimeAgo(reply.createdAt, lang)}
                      </span>
                    </div>
                    <p className="text-[13px] text-ink leading-[1.7] whitespace-pre-wrap">
                      {reply.text}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Reply form */}
            {replyTo === post._id && (
              <div className="border-t border-rule p-4 ml-10">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={di.replyPlaceholder}
                  rows={2}
                  className="w-full bg-transparent border border-rule px-3 py-2 text-[13px] text-ink focus:border-copper focus:outline-none rounded-[2px] mb-2"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleReply(post._id)}
                    disabled={submitting || !replyText.trim()}
                    className="bg-copper text-paper px-4 py-2 text-[11px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors rounded-[2px] disabled:opacity-50 cursor-pointer"
                  >
                    {di.reply}
                  </button>
                  <button
                    onClick={() => { setReplyTo(null); setReplyText(""); }}
                    className="text-[12px] text-ink/40 hover:text-ink cursor-pointer px-3"
                  >
                    {di.cancel}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {posts && posts.length === 0 && (
          <p className="text-[14px] text-ink/30 text-center py-8">
            {di.empty}
          </p>
        )}
      </div>
    </div>
  );
}

function SortButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`text-[12px] px-3 py-1.5 rounded-[2px] cursor-pointer transition-colors ${
        active ? "bg-copper/10 text-copper" : "text-ink/40 hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function UpvoteIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M7 3l4 5H3l4-5z" />
    </svg>
  );
}

const timeAgoI18n = {
  nl: { justNow: "zojuist", hour: "uur", day: "dag", days: "dagen" },
  en: { justNow: "just now", hour: "hr", day: "day", days: "days" },
  de: { justNow: "gerade eben", hour: "Std", day: "Tag", days: "Tage" },
};
const dateLocales: Record<Lang, string> = { nl: "nl-NL", en: "en-GB", de: "de-DE" };

function formatTimeAgo(timestamp: number, lang: Lang): string {
  const ta = timeAgoI18n[lang];
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return ta.justNow;
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ${ta.hour}`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ${days > 1 ? ta.days : ta.day}`;
  return new Date(timestamp).toLocaleDateString(dateLocales[lang], { day: "numeric", month: "short" });
}
