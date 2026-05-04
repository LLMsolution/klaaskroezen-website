"use node";

import { v } from "convex/values";
import { action, internalAction } from "./_generated/server";

const VERIFY_ENDPOINT = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

type CloudflareResponse = {
  success: boolean;
  "error-codes"?: string[];
  hostname?: string;
  challenge_ts?: string;
};

async function verifyToken(
  token: string,
  remoteIp?: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!token || token.trim().length === 0) {
    return { ok: false, error: "Geen Turnstile token ontvangen." };
  }

  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    return { ok: false, error: "TURNSTILE_SECRET_KEY niet geconfigureerd." };
  }

  const body = new URLSearchParams();
  body.set("secret", secret);
  body.set("response", token);
  if (remoteIp) body.set("remoteip", remoteIp);

  let res: Response;
  try {
    res = await fetch(VERIFY_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: `Turnstile bereikbaar fout: ${msg}` };
  }

  if (!res.ok) {
    return { ok: false, error: `Turnstile API ${res.status}` };
  }

  const data = (await res.json()) as CloudflareResponse;
  if (!data.success) {
    const codes = data["error-codes"]?.join(", ") ?? "unknown";
    return { ok: false, error: `Turnstile rejected: ${codes}` };
  }

  return { ok: true };
}

/**
 * Public verify action — used by login + registreren to gate the signIn call.
 * Returns ok+error structurally so the UI can show a message and reset the
 * widget without throwing.
 */
export const verify = action({
  args: { token: v.string() },
  handler: async (_ctx, { token }) => verifyToken(token),
});

/**
 * Internal verify — called from other Convex actions (e.g. contact form
 * submission wrapper) when they need to verify before proceeding.
 */
export const verifyInternal = internalAction({
  args: { token: v.string() },
  handler: async (_ctx, { token }) => verifyToken(token),
});
