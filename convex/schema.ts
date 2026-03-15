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

  // ── Invoices ──
  // Generated after successful payment, sequential numbering per year
  invoices: defineTable({
    invoiceNumber: v.string(), // e.g. "KK-2026-0001"
    purchaseId: v.id("purchases"),
    pendingOrderId: v.optional(v.id("pendingOrders")),

    // Buyer info (snapshot at time of purchase)
    buyerEmail: v.string(),
    buyerName: v.string(),
    buyerCountry: v.string(),
    buyerIsBusiness: v.boolean(),
    buyerCompany: v.optional(v.string()),
    buyerVatNumber: v.optional(v.string()),

    // Line items
    lineItems: v.array(
      v.object({
        description: v.string(),
        quantity: v.number(),
        unitPriceCents: v.number(),
        btwRate: v.number(), // 0, 9, or 21
        btwCents: v.number(),
        totalCents: v.number(),
      }),
    ),

    // Totals
    subtotalCents: v.number(),
    totalBtwCents: v.number(),
    totalCents: v.number(),
    currency: v.string(), // "EUR"

    // BTW status
    btwReversed: v.boolean(), // EU B2B reverse charge
    noBtw: v.boolean(), // Non-EU, no BTW

    // Metadata
    lang: v.union(v.literal("nl"), v.literal("en")),
    molliePaymentId: v.string(),
    paidAt: v.number(),
    createdAt: v.number(),

    // PDF storage
    pdfStorageId: v.optional(v.id("_storage")),
    emailSent: v.boolean(),
  })
    .index("by_purchase", ["purchaseId"])
    .index("by_email", ["buyerEmail"])
    .index("by_number", ["invoiceNumber"]),

  // ── Invoice Counter ──
  // Tracks the last invoice number per year for sequential numbering
  invoiceCounters: defineTable({
    year: v.number(),
    lastNumber: v.number(),
  }).index("by_year", ["year"]),

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

  // ── Email Sequences ──
  // Automated follow-up email flows triggered after purchase
  emailSequences: defineTable({
    purchaseId: v.id("purchases"),
    userId: v.id("users"),
    email: v.string(),
    product: v.string(),
    productType: v.string(),
    lang: v.union(v.literal("nl"), v.literal("en")),
    // Which steps have been sent (0-indexed)
    stepsSent: v.number(),
    totalSteps: v.number(),
    // Timestamps for each sent step
    lastSentAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    cancelledAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_purchase", ["purchaseId"])
    .index("by_user", ["userId"]),

  // ── Broadcasts ──
  // One-off email campaigns sent by Klaas from admin dashboard
  broadcasts: defineTable({
    subject: v.string(),
    htmlBody: v.string(), // Raw HTML from Klaas (Canva export or admin editor)
    plainBody: v.optional(v.string()),
    // Segment filter
    segment: v.union(
      v.literal("all"), // Everyone with a purchase
      v.literal("training-buyers"), // Training purchasers
      v.literal("book-buyers"), // Book purchasers
      v.literal("set-buyers"), // SET specifically
      v.literal("cst-buyers"), // CST specifically
    ),
    // Status
    status: v.union(
      v.literal("draft"),
      v.literal("sending"),
      v.literal("sent"),
      v.literal("failed"),
    ),
    recipientCount: v.number(),
    sentCount: v.number(),
    failedCount: v.number(),
    scheduledFor: v.optional(v.number()), // If scheduled for later
    sentAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_status", ["status"]),

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
    trackingId: v.optional(v.string()), // Unique ID for open/click tracking
    htmlBody: v.optional(v.string()), // Stored HTML for preview
    openCount: v.optional(v.number()),
    clickCount: v.optional(v.number()),
    lastOpenedAt: v.optional(v.number()),
    lastClickedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_tracking", ["trackingId"])
    .index("by_to", ["to"]),

  // ── Email Events ──
  // Individual open/click events for detailed analytics
  emailEvents: defineTable({
    emailLogId: v.id("emailLog"),
    type: v.union(v.literal("open"), v.literal("click")),
    url: v.optional(v.string()), // Target URL for clicks
    ip: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_email", ["emailLogId"])
    .index("by_type", ["type"]),

  // ── Email Templates ──
  // Editable sequence email templates (admin can override defaults)
  emailTemplates: defineTable({
    templateKey: v.string(), // e.g. "training-welcome", "book-started"
    sequenceType: v.string(), // "training" or "book"
    stepIndex: v.number(),
    subjectNl: v.string(),
    subjectEn: v.string(),
    htmlNl: v.string(),
    htmlEn: v.string(),
    delayDays: v.number(),
    active: v.boolean(),
    updatedAt: v.number(),
  }).index("by_key", ["templateKey"]),
});
