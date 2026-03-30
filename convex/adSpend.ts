import { v } from "convex/values";
import { query, internalQuery, internalAction, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { requireAdmin } from "./adminAuth";

// ── OAuth Token Management ──

async function refreshLinkedInToken(
  clientId: string,
  clientSecret: string,
  refreshToken: string,
): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
  const res = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });
  if (!res.ok) throw new Error(`LinkedIn token refresh failed (${res.status})`);
  const data = await res.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? refreshToken,
    expiresIn: data.expires_in ?? 5184000, // 60 days default
  };
}

export const getOAuthToken = internalQuery({
  args: { provider: v.string() },
  handler: async (ctx, { provider }) => {
    return await ctx.db.query("oauthTokens")
      .withIndex("by_provider", (q) => q.eq("provider", provider))
      .first();
  },
});

export const saveOAuthToken = internalMutation({
  args: {
    provider: v.string(),
    accessToken: v.string(),
    refreshToken: v.optional(v.string()),
    expiresAt: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("oauthTokens")
      .withIndex("by_provider", (q) => q.eq("provider", args.provider))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, {
        accessToken: args.accessToken,
        refreshToken: args.refreshToken ?? existing.refreshToken,
        expiresAt: args.expiresAt,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("oauthTokens", { ...args, updatedAt: Date.now() });
    }
  },
});

// ── LinkedIn API ──

async function fetchLinkedInSpend(
  accessToken: string,
  accountId: string,
  dateRange: { start: string; end: string },
): Promise<{ date: string; spend: number; impressions: number; clicks: number }[]> {
  const url = new URL("https://api.linkedin.com/rest/adAnalytics");
  url.searchParams.set("q", "analytics");
  url.searchParams.set("pivot", "CAMPAIGN");
  url.searchParams.set("dateRange.start.day", String(new Date(dateRange.start).getUTCDate()));
  url.searchParams.set("dateRange.start.month", String(new Date(dateRange.start).getUTCMonth() + 1));
  url.searchParams.set("dateRange.start.year", String(new Date(dateRange.start).getUTCFullYear()));
  url.searchParams.set("dateRange.end.day", String(new Date(dateRange.end).getUTCDate()));
  url.searchParams.set("dateRange.end.month", String(new Date(dateRange.end).getUTCMonth() + 1));
  url.searchParams.set("dateRange.end.year", String(new Date(dateRange.end).getUTCFullYear()));
  url.searchParams.set("timeGranularity", "DAILY");
  url.searchParams.set("accounts", `urn:li:sponsoredAccount:${accountId}`);
  url.searchParams.set("fields", "costInLocalCurrency,impressions,clicks,dateRange");

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "LinkedIn-Version": "202401",
      "X-Restli-Protocol-Version": "2.0.0",
    },
  });

  if (!res.ok) return [];
  const data = await res.json();

  const dailyMap = new Map<string, { spend: number; impressions: number; clicks: number }>();
  for (const el of data.elements ?? []) {
    const dr = el.dateRange?.start;
    if (!dr) continue;
    const date = `${dr.year}-${String(dr.month).padStart(2, "0")}-${String(dr.day).padStart(2, "0")}`;
    const existing = dailyMap.get(date) ?? { spend: 0, impressions: 0, clicks: 0 };
    existing.spend += Math.round((parseFloat(el.costInLocalCurrency) || 0) * 100);
    existing.impressions += el.impressions ?? 0;
    existing.clicks += el.clicks ?? 0;
    dailyMap.set(date, existing);
  }

  return Array.from(dailyMap.entries()).map(([date, data]) => ({ date, ...data }));
}

// ── Meta API ──

async function fetchMetaSpend(
  accessToken: string,
  adAccountId: string,
  dateRange: { start: string; end: string },
): Promise<{ date: string; spend: number; impressions: number; clicks: number }[]> {
  const results: { date: string; spend: number; impressions: number; clicks: number }[] = [];
  let nextUrl: string | null = `https://graph.facebook.com/v21.0/act_${adAccountId}/insights?fields=spend,impressions,clicks&time_range={"since":"${dateRange.start}","until":"${dateRange.end}"}&time_increment=1&limit=100&access_token=${accessToken}`;

  while (nextUrl) {
    const res: Response = await fetch(nextUrl);
    if (!res.ok) break;
    const data: { data?: { date_start: string; spend: string; impressions: string; clicks: string }[]; paging?: { next?: string } } = await res.json();

    for (const row of data.data ?? []) {
      results.push({
        date: row.date_start,
        spend: Math.round((parseFloat(row.spend) || 0) * 100),
        impressions: parseInt(row.impressions) || 0,
        clicks: parseInt(row.clicks) || 0,
      });
    }

    nextUrl = data.paging?.next ?? null;
  }

  return results;
}

// ── Sync actions (called by crons) ──

export const syncLinkedIn = internalAction({
  args: {},
  handler: async (ctx) => {
    const accountId = process.env.LINKEDIN_AD_ACCOUNT_ID;
    if (!accountId) return;

    // Get token: try DB first (auto-refreshed), fall back to env var
    let token = "";
    const stored = await ctx.runQuery(internal.adSpend.getOAuthToken, { provider: "linkedin" });

    if (stored) {
      // Check if token needs refresh (5 min buffer)
      if (stored.expiresAt < Date.now() + 300_000 && stored.refreshToken) {
        const clientId = process.env.LINKEDIN_CLIENT_ID;
        const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
        if (clientId && clientSecret) {
          try {
            const refreshed = await refreshLinkedInToken(clientId, clientSecret, stored.refreshToken);
            await ctx.runMutation(internal.adSpend.saveOAuthToken, {
              provider: "linkedin",
              accessToken: refreshed.accessToken,
              refreshToken: refreshed.refreshToken,
              expiresAt: Date.now() + refreshed.expiresIn * 1000,
            });
            token = refreshed.accessToken;
          } catch {
            token = stored.accessToken; // Try existing token anyway
          }
        } else {
          token = stored.accessToken;
        }
      } else {
        token = stored.accessToken;
      }
    } else {
      // First run: use env var and store it
      token = process.env.LINKEDIN_ACCESS_TOKEN ?? "";
      if (token) {
        await ctx.runMutation(internal.adSpend.saveOAuthToken, {
          provider: "linkedin",
          accessToken: token,
          refreshToken: process.env.LINKEDIN_REFRESH_TOKEN,
          expiresAt: Date.now() + 60 * 24 * 60 * 60 * 1000, // assume 60 days
        });
      }
    }

    if (!token) return;

    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 7);

    const data = await fetchLinkedInSpend(token, accountId, {
      start: start.toISOString().slice(0, 10),
      end: end.toISOString().slice(0, 10),
    });

    for (const day of data) {
      await ctx.runMutation(internal.adSpend.upsertDaily, {
        platform: "linkedin",
        date: day.date,
        spend: day.spend,
        impressions: day.impressions,
        clicks: day.clicks,
      });
    }
  },
});

export const syncMeta = internalAction({
  args: {},
  handler: async (ctx) => {
    const token = process.env.META_ACCESS_TOKEN;
    const accountId = process.env.META_AD_ACCOUNT_ID;
    if (!token || !accountId) return;

    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 7);

    const data = await fetchMetaSpend(token, accountId, {
      start: start.toISOString().slice(0, 10),
      end: end.toISOString().slice(0, 10),
    });

    for (const day of data) {
      await ctx.runMutation(internal.adSpend.upsertDaily, {
        platform: "meta",
        date: day.date,
        spend: day.spend,
        impressions: day.impressions,
        clicks: day.clicks,
      });
    }
  },
});

// ── Mutations ──

export const upsertDaily = internalMutation({
  args: {
    platform: v.union(v.literal("linkedin"), v.literal("meta")),
    date: v.string(),
    spend: v.number(),
    impressions: v.number(),
    clicks: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("adSpendDaily")
      .withIndex("by_platform_date", (q) => q.eq("platform", args.platform).eq("date", args.date))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        spend: args.spend,
        impressions: args.impressions,
        clicks: args.clicks,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("adSpendDaily", {
        ...args,
        updatedAt: Date.now(),
      });
    }
  },
});

// ── Admin queries ──

export const getDailySpend = query({
  args: {
    days: v.optional(v.number()),
    platform: v.optional(v.union(v.literal("linkedin"), v.literal("meta"), v.literal("all"))),
  },
  handler: async (ctx, { days, platform }) => {
    await requireAdmin(ctx);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - (days ?? 30));
    const cutoffStr = cutoff.toISOString().slice(0, 10);

    const all = await ctx.db.query("adSpendDaily").collect();
    const filtered = all.filter((r) => {
      if (r.date < cutoffStr) return false;
      if (platform && platform !== "all" && r.platform !== platform) return false;
      return true;
    });

    return filtered.sort((a, b) => a.date.localeCompare(b.date));
  },
});

export const getSpendSummary = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const all = await ctx.db.query("adSpendDaily").collect();

    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthStr = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, "0")}`;

    let linkedinTotal = 0, metaTotal = 0;
    let linkedinMonth = 0, metaMonth = 0;
    let linkedinLastMonth = 0, metaLastMonth = 0;
    let linkedinClicks = 0, metaClicks = 0;

    for (const r of all) {
      if (r.platform === "linkedin") {
        linkedinTotal += r.spend;
        linkedinClicks += r.clicks;
        if (r.date.startsWith(thisMonth)) linkedinMonth += r.spend;
        if (r.date.startsWith(lastMonthStr)) linkedinLastMonth += r.spend;
      } else {
        metaTotal += r.spend;
        metaClicks += r.clicks;
        if (r.date.startsWith(thisMonth)) metaMonth += r.spend;
        if (r.date.startsWith(lastMonthStr)) metaLastMonth += r.spend;
      }
    }

    return {
      linkedin: { total: linkedinTotal, thisMonth: linkedinMonth, lastMonth: linkedinLastMonth, clicks: linkedinClicks },
      meta: { total: metaTotal, thisMonth: metaMonth, lastMonth: metaLastMonth, clicks: metaClicks },
      combined: {
        total: linkedinTotal + metaTotal,
        thisMonth: linkedinMonth + metaMonth,
        lastMonth: linkedinLastMonth + metaLastMonth,
      },
    };
  },
});
