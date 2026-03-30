import { v } from "convex/values";
import { action, internalAction } from "./_generated/server";
import { internal, api } from "./_generated/api";

const GITHUB_OWNER = "LLMsolution";
const GITHUB_REPO = "klaaskroezen-website";

/** Check Vercel deploy status via GitHub deployments API */
export const checkDeployStatus = internalAction({
  args: {
    sessionId: v.id("layoutSessions"),
    mergeCommitSha: v.string(),
  },
  handler: async (ctx, { sessionId, mergeCommitSha }) => {
    const githubToken = process.env.GITHUB_PAT;
    if (!githubToken) return;

    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/commits/${mergeCommitSha}/status`,
      { headers: { Authorization: `Bearer ${githubToken}`, Accept: "application/vnd.github.v3+json" } },
    );
    if (!res.ok) return;
    const data = await res.json();

    // Check check-runs (Vercel uses these)
    const checksRes = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/commits/${mergeCommitSha}/check-runs`,
      { headers: { Authorization: `Bearer ${githubToken}`, Accept: "application/vnd.github.v3+json" } },
    );

    let deployFailed = false;
    let errorMsg = "";

    if (checksRes.ok) {
      const checksData = await checksRes.json();
      const vercelCheck = checksData.check_runs?.find(
        (r: { name: string }) => r.name?.toLowerCase().includes("vercel"),
      );
      if (vercelCheck) {
        if (vercelCheck.conclusion === "failure") {
          deployFailed = true;
          errorMsg = vercelCheck.output?.summary || "Vercel deploy mislukt.";
        } else if (vercelCheck.conclusion === "success") {
          await ctx.runMutation(internal.layoutEditor.updateDeployStatus, { sessionId, deployStatus: "success" });
          await ctx.runMutation(internal.layoutEditor.addMessageInternal, { sessionId, role: "system", text: "Deploy gelukt! De wijziging is live." });
          return;
        }
      }
    }

    if (!deployFailed && data.state === "failure") {
      deployFailed = true;
      const failedStatus = data.statuses?.find((s: { state: string }) => s.state === "failure");
      errorMsg = failedStatus?.description || "Deploy mislukt.";
    }

    if (deployFailed) {
      await ctx.runMutation(internal.layoutEditor.updateDeployStatus, { sessionId, deployStatus: "failed", deployError: errorMsg });
      await ctx.runMutation(internal.layoutEditor.addMessageInternal, {
        sessionId, role: "system",
        text: `Deploy mislukt: ${errorMsg}. Gebruik de "Fix probleem" knop om het automatisch te laten repareren.`,
      });
    } else if (data.state === "pending") {
      await ctx.runMutation(internal.layoutEditor.scheduleDeployCheck, { sessionId, mergeCommitSha, delayMs: 120_000 });
    } else {
      await ctx.runMutation(internal.layoutEditor.updateDeployStatus, { sessionId, deployStatus: "success" });
    }
  },
});

/** Trigger auto-fix: send deploy error logs to Claude to fix */
export const triggerAutoFix = action({
  args: { sessionId: v.id("layoutSessions") },
  handler: async (ctx, { sessionId }) => {
    await ctx.runMutation(api.layoutEditor.verifyAdmin);
    const githubToken = process.env.GITHUB_PAT;
    if (!githubToken) throw new Error("GITHUB_PAT niet geconfigureerd.");
    const callbackSecret = process.env.LAYOUT_CALLBACK_SECRET;
    if (!callbackSecret) throw new Error("LAYOUT_CALLBACK_SECRET niet geconfigureerd.");
    const convexUrl = process.env.CONVEX_SITE_URL;
    if (!convexUrl) throw new Error("CONVEX_SITE_URL niet geconfigureerd.");

    const session = await ctx.runQuery(api.layoutEditor.getSession, { sessionId });
    if (!session?.deployError) throw new Error("Geen deploy error gevonden.");

    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/dispatches`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${githubToken}`, Accept: "application/vnd.github.v3+json", "Content-Type": "application/json" },
        body: JSON.stringify({
          event_type: "layout-fix",
          client_payload: { sessionId, deployError: session.deployError, targetPage: session.targetPage, callbackUrl: `${convexUrl}/layout-callback`, callbackSecret },
        }),
      },
    );

    if (!response.ok) throw new Error("Kon fix niet starten.");

    await ctx.runMutation(internal.layoutEditor.updateDeployStatus, { sessionId, deployStatus: "pending", deployError: "Auto-fix wordt uitgevoerd..." });
    await ctx.runMutation(internal.layoutEditor.addMessageInternal, { sessionId, role: "system", text: "Auto-fix gestart. Claude analyseert de fout en probeert het te repareren." });
  },
});

/** Cleanup expired sessions (called by cron) */
export const cleanupExpiredSessions = internalAction({
  args: {},
  handler: async (ctx) => {
    const config = await ctx.runQuery(internal.layoutEditor.getConfigInternal);
    const timeoutMs = (config?.sessionTimeoutMinutes ?? 120) * 60 * 1000;
    const cutoff = Date.now() - timeoutMs;
    const sessions = await ctx.runQuery(internal.layoutEditor.listActiveSessions);

    for (const session of sessions) {
      if (session.lastActivityAt < cutoff) {
        await ctx.runMutation(internal.layoutEditor.updateSessionStatus, { sessionId: session._id, status: "failed", errorMessage: "Sessie verlopen door inactiviteit." });
        const githubToken = process.env.GITHUB_PAT;
        if (githubToken) {
          await fetch(
            `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/git/refs/heads/${session.branchName}`,
            { method: "DELETE", headers: { Authorization: `Bearer ${githubToken}`, Accept: "application/vnd.github.v3+json" } },
          ).catch(() => {});
        }
      }
    }
  },
});
