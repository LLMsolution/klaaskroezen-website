"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import type { Lang } from "@/lib/i18n";

interface Props {
  postId: Id<"blogPosts">;
  initialLikes: number;
  title: string;
  lang: Lang;
}

export function BlogInteractions({ postId, initialLikes, title, lang }: Props) {
  const likePost = useMutation(api.blog.likePost);
  const [sessionId, setSessionId] = useState("");
  const [justLiked, setJustLiked] = useState(false);

  useEffect(() => {
    const id = sessionStorage.getItem("kk-session") || Math.random().toString(36).slice(2);
    sessionStorage.setItem("kk-session", id);
    setSessionId(id);
  }, []);

  const hasLiked = useQuery(
    api.blog.hasLiked,
    sessionId ? { postId, sessionId } : "skip",
  );

  async function handleLike() {
    if (hasLiked || justLiked || !sessionId) return;
    await likePost({ postId, sessionId });
    setJustLiked(true);
  }

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const liked = !!hasLiked || justLiked;

  return (
    <div className="flex items-center justify-between py-6 border-t border-b border-rule">
      <button
        onClick={handleLike}
        disabled={liked}
        className={`flex items-center gap-2 text-[13px] transition-colors cursor-pointer ${
          liked ? "text-copper" : "text-ink/40 hover:text-copper"
        }`}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
        </svg>
        {initialLikes + (justLiked ? 1 : 0)} {{ nl: "vind ik leuk", en: "likes", de: "Gefällt mir" }[lang]}
      </button>

      <div className="flex items-center gap-3">
        <span className="text-[11px] text-ink/30 mr-1">{{ nl: "Delen:", en: "Share:", de: "Teilen:" }[lang]}</span>
        <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="text-ink/30 hover:text-[#0077B5] transition-colors" title="LinkedIn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" /></svg>
        </a>
        <a href={`https://wa.me/?text=${encodeURIComponent(title + " " + shareUrl)}`} target="_blank" rel="noopener noreferrer" className="text-ink/30 hover:text-[#25D366] transition-colors" title="WhatsApp">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.47 14.38c-.3-.15-1.77-.87-2.04-.97-.28-.1-.48-.15-.68.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.49-.9-.8-1.5-1.78-1.68-2.08-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.53.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.68-1.64-.93-2.25-.25-.59-.5-.51-.68-.52-.18-.01-.38-.01-.58-.01-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.47 1.07 2.89 1.22 3.09.15.2 2.1 3.21 5.1 4.5.71.31 1.27.49 1.7.63.72.23 1.37.2 1.88.12.58-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.58-.35z" /><path d="M12 2C6.48 2 2 6.48 2 12c0 1.82.49 3.53 1.34 5L2 22l5.14-1.35A9.94 9.94 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.7 0-3.28-.52-4.6-1.4l-.33-.2-3.04.8.81-2.97-.21-.34A7.96 7.96 0 0 1 4 12c0-4.42 3.58-8 8-8s8 3.58 8 8-3.58 8-8 8z" /></svg>
        </a>
        <a href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(shareUrl)}`} className="text-ink/30 hover:text-ink transition-colors" title="Email">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 4L12 13 2 4" /></svg>
        </a>
      </div>
    </div>
  );
}
