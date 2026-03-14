import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

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

  // ── Pending Orders ──
  // Created at checkout step 1 (before payment), used for abandoned cart recovery
  pendingOrders: defineTable({
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    product: v.string(),
    country: v.string(),
    lang: v.union(v.literal("nl"), v.literal("en")),
    isBusiness: v.boolean(),
    company: v.optional(v.string()),
    vatNumber: v.optional(v.string()),
    bumps: v.array(v.string()),
    discountCode: v.optional(v.string()),
    discountAmount: v.optional(v.number()),
    installments: v.boolean(),
    userId: v.optional(v.id("users")),
    molliePaymentId: v.optional(v.string()),
    remindersSent: v.number(),
    convertedAt: v.optional(v.number()),
    abandonedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_mollie", ["molliePaymentId"])
    .index("by_converted", ["convertedAt"]),

  // ── Cohorts ──
  // For coaching/team trainings with start dates and limited spots
  cohorts: defineTable({
    training: v.string(),
    name: v.string(),
    startDate: v.number(),
    enrollmentDeadline: v.number(),
    maxParticipants: v.number(),
    currentParticipants: v.number(),
    active: v.boolean(),
  }).index("by_training", ["training"]),

  // ── Discount Codes ──
  discountCodes: defineTable({
    code: v.string(),
    type: v.union(v.literal("percentage"), v.literal("fixed")),
    value: v.number(),
    validUntil: v.optional(v.number()),
    maxUses: v.optional(v.number()),
    currentUses: v.number(),
    products: v.optional(v.array(v.string())),
  }).index("by_code", ["code"]),

  // ── Page Presence ──
  // Track live visitors on checkout pages (realtime)
  pagePresence: defineTable({
    sessionId: v.string(),
    page: v.string(),
    lastSeen: v.number(),
  })
    .index("by_page", ["page"])
    .index("by_session", ["sessionId"]),

  // ── Digital Files ──
  // E-book and audiobook files for download after purchase
  digitalFiles: defineTable({
    product: v.string(),
    fileName: v.string(),
    storageId: v.id("_storage"),
    fileType: v.string(),
  }).index("by_product", ["product"]),

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
