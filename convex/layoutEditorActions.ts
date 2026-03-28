import { v } from "convex/values";
import { action, internalAction } from "./_generated/server";
import { internal, api } from "./_generated/api";

const GITHUB_OWNER = "LLMsolution";
const GITHUB_REPO = "klaaskroezen-website";

/** Trigger a plan update via GitHub Actions — Claude reads chat + updates plan */
export const triggerPlanUpdate = action({
  args: {
    sessionId: v.id("layoutSessions"),
    message: v.string(),
    targetPage: v.string(),
  },
  handler: async (ctx, { sessionId, message, targetPage }) => {
    await ctx.runMutation(api.layoutEditor.verifyAdmin);

    const githubToken = process.env.GITHUB_PAT;
    if (!githubToken) throw new Error("GITHUB_PAT niet geconfigureerd.");
    const callbackSecret = process.env.LAYOUT_CALLBACK_SECRET;
    if (!callbackSecret) throw new Error("LAYOUT_CALLBACK_SECRET niet geconfigureerd.");
    const convexUrl = process.env.CONVEX_SITE_URL;
    if (!convexUrl) throw new Error("CONVEX_SITE_URL niet geconfigureerd.");

    // Get current session for chat history and plan
    const session = await ctx.runQuery(api.layoutEditor.getSession, { sessionId });
    if (!session) throw new Error("Sessie niet gevonden.");

    const chatHistory = session.messages
      .map((m: { role: string; text: string }) => `[${m.role}]: ${m.text}`)
      .join("\n\n");

    // Update status to planning
    await ctx.runMutation(internal.layoutEditor.updateSessionStatus, {
      sessionId,
      status: "planning",
    });

    // Dispatch GitHub Action
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/dispatches`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event_type: "layout-plan",
          client_payload: {
            sessionId,
            message,
            chatHistory,
            currentPlan: session.plan || "",
            targetPage,
            callbackUrl: `${convexUrl}/plan-callback`,
            callbackSecret,
          },
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      await ctx.runMutation(internal.layoutEditor.updateSessionStatus, {
        sessionId,
        status: "chatting",
        errorMessage: `GitHub API fout: ${response.status} ${errorText}`,
      });
      throw new Error(`GitHub dispatch failed: ${response.status}`);
    }
  },
});

/** Trigger a layout build via GitHub Actions repository_dispatch */
export const triggerBuild = action({
  args: {
    sessionId: v.id("layoutSessions"),
    prompt: v.optional(v.string()),
    targetPage: v.string(),
    branchName: v.string(),
  },
  handler: async (ctx, { sessionId, prompt, targetPage, branchName }) => {
    // Verify caller is admin before proceeding
    await ctx.runMutation(api.layoutEditor.verifyAdmin);

    const githubToken = process.env.GITHUB_PAT;
    if (!githubToken) throw new Error("GITHUB_PAT niet geconfigureerd.");

    const callbackSecret = process.env.LAYOUT_CALLBACK_SECRET;
    if (!callbackSecret) throw new Error("LAYOUT_CALLBACK_SECRET niet geconfigureerd.");

    const convexUrl = process.env.CONVEX_SITE_URL;
    if (!convexUrl) throw new Error("CONVEX_SITE_URL niet geconfigureerd.");

    const callbackUrl = `${convexUrl}/layout-callback`;

    // Update session to building
    await ctx.runMutation(internal.layoutEditor.updateSessionStatus, {
      sessionId,
      status: "building",
    });

    // Get plan from session if no prompt provided
    const session = await ctx.runQuery(api.layoutEditor.getSession, { sessionId });
    const buildPrompt = prompt || session?.plan || "No plan available";

    // Add system message
    await ctx.runMutation(internal.layoutEditor.addMessageInternal, {
      sessionId,
      role: "system",
      text: "Build gestart... Claude Code voert het plan uit.",
    });

    // Trigger GitHub Actions
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/dispatches`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event_type: "layout-edit",
          client_payload: {
            prompt: buildPrompt,
            targetPage,
            branchName,
            callbackUrl,
            callbackSecret,
            sessionId,
          },
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      await ctx.runMutation(internal.layoutEditor.updateSessionStatus, {
        sessionId,
        status: "failed",
        errorMessage: `GitHub API fout: ${response.status} ${errorText}`,
      });
      throw new Error(`GitHub dispatch failed: ${response.status}`);
    }
  },
});

/** Approve session: merge PR via GitHub API */
export const approveSession = action({
  args: {
    sessionId: v.id("layoutSessions"),
    syncContent: v.optional(v.boolean()),
  },
  handler: async (ctx, { sessionId, syncContent }) => {
    await ctx.runMutation(api.layoutEditor.verifyAdmin);
    const githubToken = process.env.GITHUB_PAT;
    if (!githubToken) throw new Error("GITHUB_PAT niet geconfigureerd.");

    // Get session info BEFORE closing (need prNumber + targetPage)
    const session = await ctx.runQuery(api.layoutEditor.getSession, { sessionId });
    if (!session?.prNumber) {
      throw new Error("Geen PR nummer gevonden.");
    }

    // Merge PR FIRST — only close session after successful merge
    const mergeResponse = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/pulls/${session.prNumber}/merge`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          merge_method: "squash",
        }),
      },
    );

    if (!mergeResponse.ok) {
      const errorText = await mergeResponse.text();
      await ctx.runMutation(internal.layoutEditor.addMessageInternal, {
        sessionId,
        role: "system",
        text: `Merge mislukt: ${mergeResponse.status}. Probeer opnieuw.`,
      });
      throw new Error(`PR merge failed: ${mergeResponse.status} ${errorText}`);
    }

    // Get merge commit SHA for revert capability
    let mergeCommitSha = "";
    try {
      const mergeData = await mergeResponse.json();
      mergeCommitSha = mergeData.sha || "";
    } catch {
      // Non-critical — revert just won't be available
    }

    // Snapshot current page sections (before sync changes them)
    let sectionSnapshot = "[]";
    try {
      const pageData = await ctx.runQuery(api.siteContent.getPage, { slug: session.targetPage });
      if (pageData?.sections) {
        sectionSnapshot = JSON.stringify(pageData.sections);
      }
    } catch {
      // Non-critical
    }

    // Merge succeeded — now close session
    const result = await ctx.runMutation(api.layoutEditor.closeSession, {
      sessionId,
      action: "approve",
    });

    // Store revert data on session
    if (mergeCommitSha) {
      try {
        await ctx.runMutation(internal.layoutEditor.storeRevertData, {
          sessionId,
          mergeCommitSha,
          sectionSnapshot,
        });
      } catch {
        // Non-critical
      }
    }

    // Schedule content sync after Convex redeploy (~3 min)
    try {
      await ctx.runMutation(internal.layoutEditor.scheduleSync, {
        pageSlug: session.targetPage,
        overwriteContent: syncContent ?? false,
      });
    } catch {
      // Non-critical
    }

    // Delete branch (best-effort)
    await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/git/refs/heads/${result.branchName}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      },
    );

    // Add system message
    const syncMsg = syncContent
      ? "Goedgekeurd! PR is gemerged. Content wordt over ~3 minuten gesynchroniseerd na de deploy."
      : "Goedgekeurd! PR is gemerged. Je kunt de content invullen via het Content tabblad.";

    await ctx.runMutation(internal.layoutEditor.addMessageInternal, {
      sessionId,
      role: "system",
      text: syncMsg,
    });
  },
});

/** Reject session: close PR + delete branch */
export const rejectSession = action({
  args: { sessionId: v.id("layoutSessions") },
  handler: async (ctx, { sessionId }) => {
    await ctx.runMutation(api.layoutEditor.verifyAdmin);
    const githubToken = process.env.GITHUB_PAT;
    if (!githubToken) throw new Error("GITHUB_PAT niet geconfigureerd.");

    const result = await ctx.runMutation(api.layoutEditor.closeSession, {
      sessionId,
      action: "reject",
    });

    // Close PR if exists
    if (result.prNumber) {
      await fetch(
        `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/pulls/${result.prNumber}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${githubToken}`,
            Accept: "application/vnd.github.v3+json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ state: "closed" }),
        },
      );
    }

    // Delete branch (best-effort)
    await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/git/refs/heads/${result.branchName}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      },
    );

    // Add system message
    await ctx.runMutation(internal.layoutEditor.addMessageInternal, {
      sessionId,
      role: "system",
      text: "Afgewezen. De branch en PR zijn verwijderd.",
    });
  },
});

/** Revert the last approved session: dispatch git revert + restore page sections */
export const revertSession = action({
  args: { sessionId: v.id("layoutSessions") },
  handler: async (ctx, { sessionId }) => {
    await ctx.runMutation(api.layoutEditor.verifyAdmin);
    const githubToken = process.env.GITHUB_PAT;
    if (!githubToken) throw new Error("GITHUB_PAT niet geconfigureerd.");

    const session = await ctx.runQuery(api.layoutEditor.getSession, { sessionId });
    if (!session) throw new Error("Sessie niet gevonden.");
    if (session.status !== "approved") throw new Error("Alleen goedgekeurde sessies kunnen worden teruggedraaid.");
    if (!session.mergeCommitSha) throw new Error("Geen merge commit SHA beschikbaar voor revert.");

    // 1. Dispatch git revert via GitHub Actions (reliable git revert --no-edit + push)
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/dispatches`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event_type: "layout-revert",
          client_payload: {
            commitSha: session.mergeCommitSha,
            targetPage: session.targetPage,
            sessionId,
          },
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Revert dispatch mislukt: ${response.status} ${errorText}`);
    }

    // 2. Restore page sections from snapshot (remove AI-added sections)
    if (session.sectionSnapshot) {
      try {
        await ctx.runMutation(internal.layoutEditor.restorePageSections, {
          pageSlug: session.targetPage,
          sectionSnapshot: session.sectionSnapshot,
        });
      } catch {
        // Non-critical — sections can be fixed manually
      }
    }

    // 3. Mark session as reverted
    await ctx.runMutation(internal.layoutEditor.updateSessionStatus, {
      sessionId,
      status: "reverted",
    });

    await ctx.runMutation(internal.layoutEditor.addMessageInternal, {
      sessionId,
      role: "system",
      text: "Teruggedraaid! De code wordt hersteld via GitHub. Vercel deployt opnieuw (~2 min).",
    });
  },
});

/** Cleanup expired sessions (called by cron) */
export const cleanupExpiredSessions = internalAction({
  args: {},
  handler: async (ctx) => {
    // Get config for timeout (internal query — no auth needed)
    const config = await ctx.runQuery(internal.layoutEditor.getConfigInternal);
    const timeoutMs = (config?.sessionTimeoutMinutes ?? 120) * 60 * 1000;
    const cutoff = Date.now() - timeoutMs;

    // Get active sessions (internal query — no auth needed)
    const sessions = await ctx.runQuery(internal.layoutEditor.listActiveSessions);

    for (const session of sessions) {
      if (session.lastActivityAt < cutoff) {
        // Expire the session
        await ctx.runMutation(internal.layoutEditor.updateSessionStatus, {
          sessionId: session._id,
          status: "failed",
          errorMessage: "Sessie verlopen door inactiviteit.",
        });

        // Try to delete the branch (best-effort)
        const githubToken = process.env.GITHUB_PAT;
        if (githubToken) {
          await fetch(
            `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/git/refs/heads/${session.branchName}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${githubToken}`,
                Accept: "application/vnd.github.v3+json",
              },
            },
          ).catch(() => {
            // Ignore errors — branch might not exist
          });
        }
      }
    }
  },
});
