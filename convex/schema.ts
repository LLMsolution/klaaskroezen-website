import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ── Users ──
  // Created on first purchase (magic link) or manual signup
  users: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
    passwordHash: v.optional(v.string()),
    role: v.union(v.literal("customer"), v.literal("admin")),
    circleUserId: v.optional(v.string()),
    createdAt: v.number(),
    lastLoginAt: v.optional(v.number()),
  })
    .index("by_email", ["email"])
    .index("by_role", ["role"]),

  // ── Purchases ──
  // One record per completed payment via Mollie
  purchases: defineTable({
    userId: v.id("users"),
    product: v.string(), // e.g. "set-online", "set-coaching", "cst-teams", "boek-hardcopy"
    productType: v.union(
      v.literal("training"),
      v.literal("book"),
      v.literal("event"),
    ),
    amount: v.number(), // in cents
    currency: v.string(), // "EUR"
    molliePaymentId: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("failed"),
      v.literal("refunded"),
    ),
    invoiceNumber: v.optional(v.string()),
    createdAt: v.number(),
    paidAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_mollie", ["molliePaymentId"])
    .index("by_status", ["status"]),

  // ── Access Rights ──
  // Which Circle spaces/courses a user has access to
  accessRights: defineTable({
    userId: v.id("users"),
    purchaseId: v.id("purchases"),
    circleSpaceId: v.optional(v.string()),
    resource: v.string(), // e.g. "sales-excellence-training", "customer-success-training"
    grantedAt: v.number(),
    revokedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_resource", ["resource"]),

  // ── Contact Form Submissions ──
  contactSubmissions: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
    subject: v.string(),
    message: v.string(),
    turnstileVerified: v.boolean(),
    emailSent: v.boolean(),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  // ── Email Log ──
  // Track all sent emails for debugging and re-sending
  emailLog: defineTable({
    userId: v.optional(v.id("users")),
    to: v.string(),
    subject: v.string(),
    template: v.string(), // e.g. "purchase-confirmation", "contact-form", "welcome"
    status: v.union(
      v.literal("sent"),
      v.literal("failed"),
      v.literal("queued"),
    ),
    resendId: v.optional(v.string()),
    error: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),
});
