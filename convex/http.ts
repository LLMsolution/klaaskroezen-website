import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { auth } from "./auth";

const http = httpRouter();

auth.addHttpRoutes(http);

// Layout editor callback from GitHub Actions
http.route({
  path: "/layout-callback",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    // Validate callback secret
    const secret = request.headers.get("X-Callback-Secret");
    const expectedSecret = process.env.LAYOUT_CALLBACK_SECRET;

    if (!expectedSecret || secret !== expectedSecret) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { sessionId, status, previewUrl, prNumber, errorMessage, imageSpecUpdates } = body;

    if (!sessionId || !status) {
      return new Response("Missing sessionId or status", { status: 400 });
    }

    // Update session
    await ctx.runMutation(internal.layoutEditor.updateSessionStatus, {
      sessionId,
      status,
      previewUrl,
      prNumber,
      errorMessage,
    });

    // Store image spec updates if provided by AI
    if (imageSpecUpdates && Array.isArray(imageSpecUpdates) && imageSpecUpdates.length > 0) {
      await ctx.runMutation(internal.layoutEditor.storeImageSpecUpdates, {
        sessionId,
        imageSpecUpdates,
      });
    }

    // Add system message based on status
    let systemMessage = "";
    if (status === "preview" && previewUrl) {
      systemMessage = "Preview is klaar! Bekijk je wijziging in het preview paneel.";
    } else if (status === "failed") {
      systemMessage = `Build mislukt: ${errorMessage || "Onbekende fout"}`;
    }

    if (systemMessage) {
      await ctx.runMutation(internal.layoutEditor.addMessageInternal, {
        sessionId,
        role: "system",
        text: systemMessage,
      });
    }

    return new Response("OK", { status: 200 });
  }),
});

// Layout plan callback from GitHub Actions (chat + plan update)
http.route({
  path: "/plan-callback",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const secret = request.headers.get("X-Callback-Secret");
    const expectedSecret = process.env.LAYOUT_CALLBACK_SECRET;

    if (!expectedSecret || secret !== expectedSecret) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { sessionId, aiResponse, updatedPlan, errorMessage } = body;

    if (!sessionId) {
      return new Response("Missing sessionId", { status: 400 });
    }

    if (errorMessage) {
      await ctx.runMutation(internal.layoutEditor.updateSessionStatus, {
        sessionId,
        status: "chatting",
        errorMessage,
      });
      await ctx.runMutation(internal.layoutEditor.addMessageInternal, {
        sessionId,
        role: "system",
        text: `Plan update mislukt: ${errorMessage}`,
      });
      return new Response("OK", { status: 200 });
    }

    // Get current session to calculate plan version
    const session = await ctx.runQuery(internal.layoutEditor.getSessionInternal, { sessionId });
    const newVersion = ((session?.planVersion as number) ?? 0) + 1;

    // Update session: back to chatting + updated plan
    await ctx.runMutation(internal.layoutEditor.updateSessionStatus, {
      sessionId,
      status: "chatting",
      plan: updatedPlan || session?.plan,
      planVersion: newVersion,
    });

    // Add AI response as message
    if (aiResponse) {
      await ctx.runMutation(internal.layoutEditor.addMessageInternal, {
        sessionId,
        role: "assistant",
        text: aiResponse,
      });
    }

    return new Response("OK", { status: 200 });
  }),
});

// Email editor callback from GitHub Actions
http.route({
  path: "/email-callback",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const secret = request.headers.get("X-Callback-Secret");
    const expectedSecret = process.env.LAYOUT_CALLBACK_SECRET;

    if (!expectedSecret || secret !== expectedSecret) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { sessionId, status, generatedHtml, errorMessage } = body;

    if (!sessionId || !status) {
      return new Response("Missing sessionId or status", { status: 400 });
    }

    await ctx.runMutation(internal.emailEditor.updateSessionHtml, {
      sessionId,
      status,
      generatedHtml,
      errorMessage,
    });

    return new Response("OK", { status: 200 });
  }),
});

export default http;
