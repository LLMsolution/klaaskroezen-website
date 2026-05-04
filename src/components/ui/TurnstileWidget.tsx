"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: TurnstileOptions) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
    onloadTurnstileCallback?: () => void;
  }
}

type TurnstileOptions = {
  sitekey: string;
  callback?: (token: string) => void;
  "error-callback"?: () => void;
  "expired-callback"?: () => void;
  "timeout-callback"?: () => void;
  theme?: "light" | "dark" | "auto";
  size?: "normal" | "compact" | "flexible";
  appearance?: "always" | "execute" | "interaction-only";
};

const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

let scriptLoading = false;
let scriptLoaded = false;
const scriptLoadCallbacks: Array<() => void> = [];

function loadScript(): Promise<void> {
  return new Promise((resolve) => {
    if (scriptLoaded) {
      resolve();
      return;
    }
    scriptLoadCallbacks.push(resolve);
    if (scriptLoading) return;

    scriptLoading = true;
    const s = document.createElement("script");
    s.src = SCRIPT_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => {
      scriptLoaded = true;
      for (const cb of scriptLoadCallbacks) cb();
      scriptLoadCallbacks.length = 0;
    };
    document.head.appendChild(s);
  });
}

interface Props {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
  theme?: "light" | "dark" | "auto";
  className?: string;
}

/**
 * Cloudflare Turnstile widget. Reads sitekey from
 * NEXT_PUBLIC_TURNSTILE_SITE_KEY. Calls onVerify(token) when the user passes
 * the challenge; the parent should send that token to the server for
 * verification via api.turnstile.verify.
 */
export function TurnstileWidget({
  onVerify,
  onExpire,
  onError,
  theme = "light",
  className = "",
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [scriptError, setScriptError] = useState(false);
  const sitekey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (!sitekey) return;
    let cancelled = false;

    loadScript()
      .then(() => {
        if (cancelled) return;
        if (!containerRef.current || !window.turnstile) {
          setScriptError(true);
          return;
        }
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey,
          theme,
          callback: (token) => onVerify(token),
          "expired-callback": () => onExpire?.(),
          "error-callback": () => onError?.(),
        });
      })
      .catch(() => {
        if (!cancelled) setScriptError(true);
      });

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          /* widget already removed */
        }
        widgetIdRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sitekey, theme]);

  if (!sitekey) {
    return (
      <p className="text-[12px] text-red-500">
        Turnstile niet geconfigureerd (NEXT_PUBLIC_TURNSTILE_SITE_KEY ontbreekt).
      </p>
    );
  }
  if (scriptError) {
    return (
      <p className="text-[12px] text-red-500">
        Turnstile kon niet geladen worden. Vernieuw de pagina.
      </p>
    );
  }

  return <div ref={containerRef} className={className} />;
}
