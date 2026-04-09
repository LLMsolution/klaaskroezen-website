import { v } from "convex/values";
import { query, mutation, internalQuery, internalMutation, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { requireAdmin } from "./adminAuth";
import { requireTrainingAccess } from "./trainingProgress";

/* ─── Validators ─── */

const fieldTypeValidator = v.union(
  v.literal("text"),
  v.literal("textarea"),
  v.literal("radio"),
  v.literal("checkbox"),
  v.literal("scale"),
);

const localizedString = v.object({
  nl: v.string(),
  en: v.string(),
  de: v.optional(v.string()),
});

const fieldValidator = v.object({
  id: v.string(),
  type: fieldTypeValidator,
  label: localizedString,
  required: v.boolean(),
  options: v.optional(v.array(localizedString)),
  scaleMin: v.optional(v.number()),
  scaleMax: v.optional(v.number()),
});

/* ─── Public queries (cursist) ─── */

/** Fetch the active form for a lesson, if any. Access-gated. */
export const getForModule = query({
  args: { moduleId: v.id("trainingModules") },
  handler: async (ctx, { moduleId }) => {
    const mod = await ctx.db.get(moduleId);
    if (!mod) return null;
    await requireTrainingAccess(ctx, mod.trainingId);

    const form = await ctx.db
      .query("lessonForms")
      .withIndex("by_module", (q) => q.eq("moduleId", moduleId))
      .first();
    if (!form || !form.active) return null;
    return form;
  },
});

/** Get the current user's most recent submission for this lesson, if any. */
export const getMySubmission = query({
  args: { moduleId: v.id("trainingModules") },
  handler: async (ctx, { moduleId }) => {
    const mod = await ctx.db.get(moduleId);
    if (!mod) return null;
    const { userId } = await requireTrainingAccess(ctx, mod.trainingId);

    const subs = await ctx.db
      .query("lessonFormSubmissions")
      .withIndex("by_user_module", (q) =>
        q.eq("userId", userId).eq("moduleId", moduleId),
      )
      .order("desc")
      .take(1);
    return subs[0] ?? null;
  },
});

/* ─── Public mutations (cursist) ─── */

/** Submit form answers. Triggers email send via scheduler. */
export const submit = mutation({
  args: {
    moduleId: v.id("trainingModules"),
    answers: v.array(
      v.object({
        fieldId: v.string(),
        value: v.string(),
      }),
    ),
  },
  handler: async (ctx, { moduleId, answers }) => {
    const mod = await ctx.db.get(moduleId);
    if (!mod) throw new Error("Module niet gevonden.");
    const { userId } = await requireTrainingAccess(ctx, mod.trainingId);

    const form = await ctx.db
      .query("lessonForms")
      .withIndex("by_module", (q) => q.eq("moduleId", moduleId))
      .first();
    if (!form || !form.active) throw new Error("Geen actief formulier voor deze les.");

    // Validate required fields are present
    for (const field of form.fields) {
      if (!field.required) continue;
      const answer = answers.find((a) => a.fieldId === field.id);
      if (!answer || !answer.value || answer.value === "[]" || answer.value === "\"\"") {
        throw new Error(`Verplicht veld ontbreekt: ${field.label.nl}`);
      }
    }

    const submissionId = await ctx.db.insert("lessonFormSubmissions", {
      formId: form._id,
      moduleId,
      trainingId: mod.trainingId,
      userId,
      answers,
      createdAt: Date.now(),
    });

    // Schedule the email send (mutations cannot directly call actions).
    await ctx.scheduler.runAfter(0, internal.lessonForms.sendSubmissionEmail, {
      submissionId,
    });

    return submissionId;
  },
});

/* ─── Admin mutations ─── */

/** Create or replace the form for a lesson. */
export const upsertForm = mutation({
  args: {
    moduleId: v.id("trainingModules"),
    recipientEmail: v.string(),
    introText: localizedString,
    submitLabel: localizedString,
    fields: v.array(fieldValidator),
    active: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const existing = await ctx.db
      .query("lessonForms")
      .withIndex("by_module", (q) => q.eq("moduleId", args.moduleId))
      .first();

    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, {
        recipientEmail: args.recipientEmail,
        introText: args.introText,
        submitLabel: args.submitLabel,
        fields: args.fields,
        active: args.active,
        updatedAt: now,
      });
      return existing._id;
    }
    return await ctx.db.insert("lessonForms", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/** Delete the form for a lesson. Submissions are kept (they reference formId). */
export const deleteForm = mutation({
  args: { moduleId: v.id("trainingModules") },
  handler: async (ctx, { moduleId }) => {
    await requireAdmin(ctx);
    const existing = await ctx.db
      .query("lessonForms")
      .withIndex("by_module", (q) => q.eq("moduleId", moduleId))
      .first();
    if (existing) await ctx.db.delete(existing._id);
  },
});

/** Admin query: load the form for a lesson regardless of active state. */
export const getForModuleAdmin = query({
  args: { moduleId: v.id("trainingModules") },
  handler: async (ctx, { moduleId }) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("lessonForms")
      .withIndex("by_module", (q) => q.eq("moduleId", moduleId))
      .first();
  },
});

/* ─── Internal helpers (used by the email action) ─── */

export const getSubmissionForEmail = internalQuery({
  args: { submissionId: v.id("lessonFormSubmissions") },
  handler: async (ctx, { submissionId }) => {
    const submission = await ctx.db.get(submissionId);
    if (!submission) return null;

    const form = await ctx.db.get(submission.formId);
    if (!form) return null;

    const mod = await ctx.db.get(submission.moduleId);
    const training = await ctx.db.get(submission.trainingId);
    const user = await ctx.db.get(submission.userId);

    // Resolve email via authAccounts (email-based providers store it there)
    const accounts = await ctx.db
      .query("authAccounts")
      .filter((q) => q.eq(q.field("userId"), submission.userId))
      .collect();
    const emailAccount = accounts.find((a) =>
      a.providerAccountId?.includes("@"),
    );
    const userRec = user as unknown as { email?: string; name?: string };
    const userEmail = emailAccount?.providerAccountId ?? userRec?.email ?? "";

    return {
      submission,
      form,
      moduleTitleNl: mod?.title.nl ?? "",
      trainingTitleNl: training?.title.nl ?? "",
      userName: userRec?.name ?? "",
      userEmail,
    };
  },
});

export const markEmailSent = internalMutation({
  args: { submissionId: v.id("lessonFormSubmissions") },
  handler: async (ctx, { submissionId }) => {
    await ctx.db.patch(submissionId, { emailSentAt: Date.now() });
  },
});

/* ─── Email action ─── */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatAnswerHtml(
  field: { type: string; label: { nl: string }; options?: { nl: string }[] },
  value: string,
): string {
  if (!value) return "<em style='color:#999'>(leeg)</em>";

  if (field.type === "checkbox") {
    try {
      const arr = JSON.parse(value);
      if (Array.isArray(arr)) {
        const labels = arr
          .map((idx: number) => field.options?.[idx]?.nl ?? `optie ${idx + 1}`)
          .join(", ");
        return escapeHtml(labels || "(geen)");
      }
    } catch {
      // fall through
    }
  }
  if (field.type === "radio") {
    try {
      const idx = parseInt(value, 10);
      if (!Number.isNaN(idx)) {
        return escapeHtml(field.options?.[idx]?.nl ?? `optie ${idx + 1}`);
      }
    } catch {
      // fall through
    }
  }
  if (field.type === "textarea") {
    return escapeHtml(value).replace(/\n/g, "<br/>");
  }
  return escapeHtml(value);
}

export const sendSubmissionEmail = internalAction({
  args: { submissionId: v.id("lessonFormSubmissions") },
  handler: async (ctx, { submissionId }) => {
    const data = await ctx.runQuery(internal.lessonForms.getSubmissionForEmail, {
      submissionId,
    });
    if (!data) return;
    const { submission, form, moduleTitleNl, trainingTitleNl, userName, userEmail } = data;

    const fieldsById = new Map(form.fields.map((f) => [f.id, f]));
    const rows = submission.answers
      .map((a) => {
        const field = fieldsById.get(a.fieldId);
        if (!field) return "";
        return `
          <tr>
            <td style="padding:12px 16px;border-bottom:1px solid #EDE9E2;vertical-align:top;width:35%;font-size:13px;color:#666;font-weight:500;">
              ${escapeHtml(field.label.nl)}
            </td>
            <td style="padding:12px 16px;border-bottom:1px solid #EDE9E2;vertical-align:top;font-size:14px;color:#0E0C0A;">
              ${formatAnswerHtml(field, a.value)}
            </td>
          </tr>
        `;
      })
      .join("");

    const html = `
      <div style="font-family:'DM Sans',sans-serif;max-width:640px;margin:0 auto;padding:32px;color:#0E0C0A;">
        <p style="font-size:10px;font-weight:500;letter-spacing:0.2em;text-transform:uppercase;color:#B5622A;margin:0 0 16px;">Nieuw formulier ingevuld</p>
        <h1 style="font-size:24px;font-weight:900;color:#0E0C0A;margin:0 0 8px;line-height:1.1;">${escapeHtml(trainingTitleNl)}</h1>
        <p style="font-size:14px;color:#666;margin:0 0 24px;">${escapeHtml(moduleTitleNl)}</p>

        <div style="border:1px solid #EDE9E2;padding:16px;background:#F7F4EF;border-radius:2px;margin-bottom:24px;">
          <p style="font-size:12px;color:#666;margin:0 0 4px;">Ingevuld door</p>
          <p style="font-size:15px;color:#0E0C0A;margin:0;font-weight:500;">${escapeHtml(userName || userEmail || "Onbekend")}</p>
          ${userEmail ? `<p style="font-size:13px;color:#B5622A;margin:4px 0 0;"><a href="mailto:${escapeHtml(userEmail)}" style="color:#B5622A;text-decoration:none;">${escapeHtml(userEmail)}</a></p>` : ""}
        </div>

        <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;border:1px solid #EDE9E2;border-radius:2px;">
          ${rows}
        </table>
      </div>
    `;

    await ctx.runAction(internal.emails.sendEmail, {
      to: form.recipientEmail,
      subject: `Formulier: ${moduleTitleNl} — ${userName || userEmail || "anoniem"}`,
      html,
      template: "lesson-form-submission",
      replyTo: userEmail || undefined,
    });

    await ctx.runMutation(internal.lessonForms.markEmailSent, { submissionId });
  },
});
