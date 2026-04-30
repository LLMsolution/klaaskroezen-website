import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export const langValidator = v.union(v.literal("nl"), v.literal("en"), v.literal("de"));

export default defineSchema({
  ...authTables,

  // ── Purchases ──
  // One record per completed payment via Mollie
  purchases: defineTable({
    userId: v.optional(v.id("users")), // Optional — set when user account exists
    buyerEmail: v.string(), // Always available from pending order
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
    expiresAt: v.optional(v.number()), // When access expires (empty = forever)
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
    phone: v.optional(v.string()),
    product: v.string(),
    country: v.string(),
    lang: langValidator,
    isBusiness: v.boolean(),
    company: v.optional(v.string()),
    companyWebsite: v.optional(v.string()),
    vatNumber: v.optional(v.string()),
    // Shipping address (required for physical products)
    street: v.optional(v.string()),
    houseNumber: v.optional(v.string()),
    houseNumberSuffix: v.optional(v.string()),
    postalCode: v.optional(v.string()),
    city: v.optional(v.string()),
    quantity: v.optional(v.number()),
    mailingOptIn: v.optional(v.boolean()),
    bumps: v.array(v.string()),
    discountCode: v.optional(v.string()),
    discountAmount: v.optional(v.number()),
    installments: v.boolean(),
    userId: v.optional(v.id("users")),
    molliePaymentId: v.optional(v.string()),
    remindersSent: v.number(),
    crmNotified: v.optional(v.boolean()), // true after first CRM contact creation from draft
    convertedAt: v.optional(v.number()),
    abandonedAt: v.optional(v.number()),
    createdAt: v.number(),
    // Book orders: which language edition was purchased
    bookLang: v.optional(langValidator),
    // A/B testing: which experiment and variant this order belongs to
    experimentSlug: v.optional(v.string()),
    experimentVariant: v.optional(v.string()),
    // Digital products: explicit waiver of the right of withdrawal (Wet Consumentenkoop art. 6:230o lid 3)
    agreedDigitalWaiver: v.optional(v.boolean()),
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
    // Language edition. Optional for backwards compatibility — undefined = default (NL).
    lang: v.optional(langValidator),
    // Distribution format. e-book gets epub + pdf, audiobook is a separate
    // training (not stored here). Optional for backwards compatibility.
    format: v.optional(v.union(v.literal("epub"), v.literal("pdf"))),
  })
    .index("by_product", ["product"])
    .index("by_product_lang", ["product", "lang"])
    .index("by_product_lang_format", ["product", "lang", "format"]),

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
    lang: langValidator,
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
    lang: langValidator,
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
    // A/B testing for broadcasts
    abTestActive: v.optional(v.boolean()),
    subjectB: v.optional(v.string()),
    htmlBodyB: v.optional(v.string()),
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
    variant: v.optional(v.string()), // "A" or "B" for A/B testing
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

  // ── Admin Emails ──
  // Manages who has admin access (replaces hardcoded list)
  adminEmails: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    addedAt: v.number(),
  }).index("by_email", ["email"]),

  // ── Email Templates ──
  // Editable sequence email templates (admin can override defaults)
  emailTemplates: defineTable({
    templateKey: v.string(), // e.g. "training-welcome", "book-started"
    sequenceType: v.string(), // "training" or "book"
    stepIndex: v.number(),
    subjectNl: v.string(),
    subjectEn: v.string(),
    subjectDe: v.optional(v.string()),
    htmlNl: v.string(),
    htmlEn: v.string(),
    htmlDe: v.optional(v.string()),
    delayDays: v.number(),
    active: v.boolean(),
    updatedAt: v.number(),
    // A/B testing: variant B (variant A = default fields above)
    abTestActive: v.optional(v.boolean()),
    subjectNlB: v.optional(v.string()),
    subjectEnB: v.optional(v.string()),
    subjectDeB: v.optional(v.string()),
    htmlNlB: v.optional(v.string()),
    htmlEnB: v.optional(v.string()),
    htmlDeB: v.optional(v.string()),
  })
    .index("by_key", ["templateKey"])
    .index("by_sequence", ["sequenceType", "stepIndex"]),

  // ── Blog Posts ──
  blogPosts: defineTable({
    slug: v.string(),
    title: v.string(),
    excerpt: v.string(),
    body: v.string(), // HTML content
    imageUrl: v.optional(v.string()), // Legacy — use imageStorageId
    imageStorageId: v.optional(v.id("_storage")),
    videoUrl: v.optional(v.string()), // YouTube/Vimeo embed URL
    ctaText: v.optional(v.string()),
    ctaUrl: v.optional(v.string()),
    category: v.string(), // "training", "boek", "persoonlijk", "nieuws"
    published: v.boolean(),
    publishedAt: v.number(),
    likes: v.number(),
    lang: langValidator,
    sourcePostId: v.optional(v.id("blogPosts")),
    autoTranslated: v.optional(v.boolean()),
  })
    .index("by_slug", ["slug"])
    .index("by_published", ["published", "publishedAt"])
    .index("by_source_lang", ["sourcePostId", "lang"]),

  // ── Blog Likes ──
  // Track anonymous likes per session to prevent double-liking
  blogLikes: defineTable({
    postId: v.id("blogPosts"),
    sessionId: v.string(),
    createdAt: v.number(),
  })
    .index("by_post", ["postId"])
    .index("by_session_post", ["sessionId", "postId"]),

  // ── Unsubscribes ──
  // Email addresses that opted out of broadcast emails
  unsubscribes: defineTable({
    email: v.string(),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  // ── Site Settings ──
  // Single-row config for admin-adjustable values
  siteSettings: defineTable({
    key: v.string(),
    // Abandoned cart timing (minutes for first reminder, hours for escalations)
    abandonedCartDelayMinutes: v.optional(v.number()),
    escalationDelayHours: v.optional(v.array(v.number())),
    // Popup config
    popupEnabled: v.optional(v.boolean()),
    popupProduct: v.optional(v.string()), // checkout product slug
    popupImageStorageId: v.optional(v.id("_storage")),
    popupLabel: v.optional(v.object({ nl: v.string(), en: v.string(), de: v.optional(v.string()) })),
    popupTitle: v.optional(v.object({ nl: v.string(), en: v.string(), de: v.optional(v.string()) })),
    popupDescription: v.optional(v.object({ nl: v.string(), en: v.string(), de: v.optional(v.string()) })),
    popupCta: v.optional(v.object({ nl: v.string(), en: v.string(), de: v.optional(v.string()) })),
    popupPrice: v.optional(v.string()),
    popupPages: v.optional(v.array(v.string())), // pages where popup can show, empty = all except excluded
  }).index("by_key", ["key"]),

  // ── CRM: Contacts ──
  // Unified person record for all interactions (replaces virtual mailing list)
  contacts: defineTable({
    email: v.string(),
    firstName: v.string(),
    lastName: v.optional(v.string()),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
    jobTitle: v.optional(v.string()),
    website: v.optional(v.string()),
    linkedin: v.optional(v.string()),
    // Address (from checkout / Bol.com)
    street: v.optional(v.string()),
    postalCode: v.optional(v.string()),
    city: v.optional(v.string()),
    countryCode: v.optional(v.string()),
    userId: v.optional(v.id("users")),
    // Scoring
    engagementScore: v.number(), // email opens, clicks
    intentScore: v.number(), // form fills, checkout, purchases
    lastActivityAt: v.number(),
    lastScoreDecayAt: v.optional(v.number()),
    // Origin
    source: v.union(
      v.literal("contact_form"),
      v.literal("checkout"),
      v.literal("purchase"),
      v.literal("registration"),
      v.literal("bolcom"),
      v.literal("manual"),
      v.literal("import"),
      v.literal("referral"),
    ),
    sourceDetail: v.optional(v.string()),
    // Segmentation
    tags: v.array(v.string()),
    unsubscribed: v.boolean(),
    lang: langValidator,
    customFields: v.optional(v.array(v.object({ key: v.string(), value: v.string() }))),
    createdAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_user", ["userId"])
    .index("by_source", ["source"])
    .index("by_engagement", ["engagementScore"])
    .index("by_intent", ["intentScore"]),

  // ── CRM: Leads ──
  // Sales pipeline deals
  leads: defineTable({
    contactId: v.id("contacts"),
    stageId: v.id("pipelineStages"),
    title: v.string(),
    valueCents: v.optional(v.number()),
    probability: v.number(), // 0-100
    assignedTo: v.optional(v.string()), // admin email
    source: v.optional(v.string()),
    status: v.union(
      v.literal("open"),
      v.literal("won"),
      v.literal("lost"),
    ),
    nextAction: v.optional(v.string()),
    nextActionAt: v.optional(v.number()),
    purchaseId: v.optional(v.id("purchases")),
    lostReason: v.optional(v.string()),
    expectedCloseAt: v.optional(v.number()), // timestamp ms — first day of expected close month
    createdAt: v.number(),
    closedAt: v.optional(v.number()),
  })
    .index("by_contact", ["contactId"])
    .index("by_stage", ["stageId"])
    .index("by_assigned", ["assignedTo"])
    .index("by_status", ["status"])
    .index("by_next_action", ["nextActionAt"])
    .index("by_expected_close", ["expectedCloseAt"]),

  // ── CRM: Pipeline Stages ──
  // Configurable pipeline phases
  pipelineStages: defineTable({
    name: v.string(),
    slug: v.string(),
    order: v.number(),
    color: v.string(), // hex
    defaultProbability: v.number(), // 0-100
    isDefault: v.boolean(), // new leads go here
    createdAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_order", ["order"]),

  // ── CRM: Lead Activities ──
  // Unified timeline for contacts and leads
  leadActivities: defineTable({
    leadId: v.optional(v.id("leads")),
    contactId: v.id("contacts"),
    type: v.union(
      v.literal("note"),
      v.literal("call"),
      v.literal("meeting"),
      v.literal("email_sent"),
      v.literal("email_opened"),
      v.literal("email_clicked"),
      v.literal("stage_change"),
      v.literal("score_change"),
      v.literal("contact_form"),
      v.literal("checkout_started"),
      v.literal("checkout_abandoned"),
      v.literal("purchase"),
      v.literal("lead_created"),
      v.literal("lead_won"),
      v.literal("lead_lost"),
      v.literal("tag_added"),
      v.literal("tag_removed"),
    ),
    title: v.string(),
    description: v.optional(v.string()),
    performedBy: v.optional(v.string()), // admin email
    emailLogId: v.optional(v.id("emailLog")),
    purchaseId: v.optional(v.id("purchases")),
    metadata: v.optional(v.string()), // JSON for extra data
    createdAt: v.number(),
  })
    .index("by_lead", ["leadId"])
    .index("by_contact", ["contactId"])
    .index("by_type", ["type"]),

  // ── CRM: Automation Rules (legacy — kept for backward compat) ──
  automationRules: defineTable({
    name: v.string(),
    active: v.boolean(),
    trigger: v.union(
      v.literal("score_threshold"),
      v.literal("stage_change"),
      v.literal("inactivity"),
      v.literal("checkout_abandoned"),
      v.literal("contact_form"),
      v.literal("purchase"),
    ),
    action: v.union(
      v.literal("notify_team"),
      v.literal("send_email"),
      v.literal("start_sequence"),
      v.literal("move_stage"),
      v.literal("assign_lead"),
      v.literal("create_lead"),
    ),
    triggerConfig: v.string(),
    actionConfig: v.string(),
    executionCount: v.number(),
    lastExecutedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_trigger", ["trigger"])
    .index("by_active", ["active"]),

  // ── CRM: Nurturing (legacy — kept for backward compat) ──
  nurturingSequences: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    active: v.boolean(),
    totalSteps: v.number(),
    enrolledCount: v.number(),
    completedCount: v.number(),
    createdAt: v.number(),
  }),
  nurturingSteps: defineTable({
    sequenceId: v.id("nurturingSequences"),
    order: v.number(),
    templateKey: v.string(),
    delayDays: v.number(),
    createdAt: v.number(),
  }).index("by_sequence", ["sequenceId", "order"]),
  nurturingEnrollments: defineTable({
    sequenceId: v.id("nurturingSequences"),
    contactId: v.id("contacts"),
    currentStep: v.number(),
    status: v.union(v.literal("active"), v.literal("completed"), v.literal("cancelled")),
    cancelReason: v.optional(v.string()),
    lastSentAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_sequence", ["sequenceId"])
    .index("by_contact", ["contactId"])
    .index("by_status", ["status"]),

  // ── CRM: Workflows (replaces automationRules + nurturingSequences) ──
  // Multi-step if/then automations with branching
  workflows: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    trigger: v.union(
      v.literal("purchase"),
      v.literal("contact_form"),
      v.literal("checkout_abandoned"),
      v.literal("tag_added"),
      v.literal("tag_removed"),
      v.literal("email_opened"),
      v.literal("email_clicked"),
      v.literal("score_threshold"),
      v.literal("stage_change"),
      v.literal("manual"),
    ),
    triggerConfig: v.optional(v.string()), // JSON: { tag?, product?, scoreType?, threshold? }
    active: v.boolean(),
    allowReentry: v.boolean(),
    enrolledCount: v.number(),
    completedCount: v.number(),
    createdAt: v.number(),
  })
    .index("by_trigger", ["trigger", "active"])
    .index("by_active", ["active"]),

  // ── CRM: Workflow Steps ──
  // Linked list of steps — each points to next (and optionally else branch)
  workflowSteps: defineTable({
    workflowId: v.id("workflows"),
    type: v.union(
      v.literal("send_email"),
      v.literal("wait"),
      v.literal("if_else"),
      v.literal("add_tag"),
      v.literal("remove_tag"),
      v.literal("update_score"),
      v.literal("move_stage"),
      v.literal("notify_team"),
      v.literal("start_workflow"),
      v.literal("goal"),
      v.literal("webhook"),
    ),
    config: v.string(), // JSON per type
    nextStepId: v.optional(v.id("workflowSteps")),
    elseBranchStepId: v.optional(v.id("workflowSteps")), // only for if_else
    sortOrder: v.number(), // for admin UI display
    createdAt: v.number(),
  })
    .index("by_workflow", ["workflowId", "sortOrder"]),

  // ── CRM: Workflow Enrollments ──
  // Tracks each contact's position in a workflow
  workflowEnrollments: defineTable({
    workflowId: v.id("workflows"),
    contactId: v.id("contacts"),
    currentStepId: v.optional(v.id("workflowSteps")), // null = completed or not started
    status: v.union(
      v.literal("active"),
      v.literal("waiting"), // waiting for a delay/condition
      v.literal("paused"),
      v.literal("completed"),
      v.literal("cancelled"),
    ),
    nextRunAt: v.optional(v.number()), // when to execute next step (for wait steps)
    pausedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    cancelledAt: v.optional(v.number()),
    metadata: v.optional(v.string()), // JSON: trigger data passed at enrollment
    createdAt: v.number(),
  })
    .index("by_workflow", ["workflowId"])
    .index("by_contact", ["contactId"])
    .index("by_status", ["status"])
    .index("by_next_run", ["status", "nextRunAt"]),

  // ── OAuth Tokens ──
  // Stored tokens for auto-refresh (LinkedIn, Meta, etc.)
  oauthTokens: defineTable({
    provider: v.string(), // "linkedin", "meta"
    accessToken: v.string(),
    refreshToken: v.optional(v.string()),
    expiresAt: v.number(), // timestamp ms
    updatedAt: v.number(),
  }).index("by_provider", ["provider"]),

  // ── Ad Spend ──
  // Hourly snapshots (last 7 days, then cleaned up to daily)
  adSpendHourly: defineTable({
    platform: v.union(v.literal("linkedin"), v.literal("meta")),
    date: v.string(),     // YYYY-MM-DD
    hour: v.number(),     // 0-23
    spend: v.number(),    // EUR cents (cumulative for the day at this hour)
    impressions: v.number(),
    clicks: v.number(),
    capturedAt: v.number(),
  })
    .index("by_platform_date", ["platform", "date"])
    .index("by_date_hour", ["date", "hour"]),

  // Daily ad spend per platform (LinkedIn, Meta)
  adSpendDaily: defineTable({
    platform: v.union(v.literal("linkedin"), v.literal("meta")),
    date: v.string(),
    spend: v.number(), // EUR cents
    impressions: v.number(),
    clicks: v.number(),
    updatedAt: v.number(),
  })
    .index("by_platform_date", ["platform", "date"])
    .index("by_date", ["date"]),

  // ── Bol.com Orders ──
  // Orders imported from Bol.com Retailer API
  bolOrders: defineTable({
    orderId: v.string(),
    product: v.string(),
    sku: v.string(),
    quantity: v.number(),
    company: v.optional(v.string()),
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    street: v.string(),
    houseNumber: v.string(),
    postalCode: v.string(),
    city: v.string(),
    countryCode: v.string(),
    amountCents: v.number(),
    amountWithTaxCents: v.number(),
    vatRate: v.number(),
    shippingCostsCents: v.number(),
    paidAt: v.string(),
    crmNotified: v.boolean(),
    importedAt: v.number(),
  })
    .index("by_orderId", ["orderId"])
    .index("by_paidAt", ["paidAt"]),

  // ── Checkout Products ──
  // Single source of truth for all checkout product data
  checkoutProducts: defineTable({
    slug: v.string(),
    active: v.boolean(),
    sortOrder: v.number(),
    name: v.object({ nl: v.string(), en: v.string(), de: v.optional(v.string()) }),
    shortName: v.object({ nl: v.string(), en: v.string(), de: v.optional(v.string()) }),
    description: v.object({ nl: v.string(), en: v.string(), de: v.optional(v.string()) }),
    type: v.union(v.literal("training"), v.literal("book")),
    productType: v.union(
      v.literal("training"),
      v.literal("book"),
      v.literal("event"),
    ),
    priceCents: v.number(),
    priceInclBtw: v.boolean(),
    btwRate: v.number(), // 9 or 21
    features: v.object({
      nl: v.array(v.string()),
      en: v.array(v.string()),
      de: v.optional(v.array(v.string())),
    }),
    image: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
    bumps: v.array(v.string()), // slugs of other products
    bumpPriceOverrides: v.optional(
      v.array(v.object({ bumpSlug: v.string(), priceCents: v.number() })),
    ),
    installments: v.optional(
      v.object({ count: v.number(), amountPerTermCents: v.number() }),
    ),
    quantityTiers: v.optional(
      v.array(
        v.object({
          quantity: v.number(),
          unitPriceCents: v.number(),
          savingsPercent: v.number(),
        }),
      ),
    ),
    requiresShipping: v.boolean(),
    purchaseTag: v.optional(v.string()), // Tag for CRM contact + pipeline lead on purchase (empty = no pipeline)
    accessDurationDays: v.optional(v.number()), // Days of access after purchase (empty = forever)
    mockupType: v.optional(
      v.union(v.literal("tablet"), v.literal("phone"), v.literal("audio")),
    ),
    // Book-only: which language editions are available for purchase
    availableBookLanguages: v.optional(
      v.array(v.union(v.literal("nl"), v.literal("en"), v.literal("de"))),
    ),
  })
    .index("by_slug", ["slug"])
    .index("by_active", ["active", "sortOrder"])
    .index("by_type", ["type"]),

  // ── Account Catalog ──
  // Admin-configured per-language list of products shown on the user dashboard.
  // One row per language; each row holds an ordered array of checkout product references.
  accountCatalog: defineTable({
    lang: v.union(v.literal("nl"), v.literal("en"), v.literal("de")),
    items: v.array(
      v.object({
        checkoutProductId: v.id("checkoutProducts"),
        category: v.union(v.literal("training"), v.literal("book")),
        // What happens on the dashboard when the user owns this product.
        // Optional for backwards compat; defaults to category-based inference.
        dashboardAction: v.optional(v.union(
          v.literal("training"),   // show progress, link to training
          v.literal("download"),   // show download link (ebook PDF/EPUB)
          v.literal("audiobook"),  // link to audiobook/luisterboek page
          v.literal("physical"),   // show "Besteld" label
        )),
        // For training/audiobook: which training slug to link to
        linkedTrainingSlug: v.optional(v.string()),
        sortOrder: v.number(),
      }),
    ),
    updatedAt: v.number(),
  }).index("by_lang", ["lang"]),

  // ── Checkout Reviews ──
  // Editable testimonials for checkout pages
  checkoutReviews: defineTable({
    productType: v.union(v.literal("training"), v.literal("book")),
    productSlug: v.optional(v.string()),
    text: v.object({ nl: v.string(), en: v.string(), de: v.optional(v.string()) }),
    name: v.string(),
    role: v.object({ nl: v.string(), en: v.string(), de: v.optional(v.string()) }),
    avatar: v.optional(v.string()), // Legacy — use avatarStorageId
    avatarStorageId: v.optional(v.id("_storage")),
    rating: v.number(), // 1-5
    active: v.boolean(),
    sortOrder: v.number(),
  })
    .index("by_product_type", ["productType", "sortOrder"])
    .index("by_product_slug", ["productSlug"]),

  // ── Experiments ──
  // Checkout page A/B tests with conversion tracking
  experiments: defineTable({
    name: v.string(),
    slug: v.string(),
    product: v.string(), // product slug or "*" for all
    status: v.union(
      v.literal("draft"),
      v.literal("running"),
      v.literal("paused"),
      v.literal("completed"),
    ),
    variantALabel: v.string(),
    variantBLabel: v.string(),
    weight: v.number(), // percentage for variant B (e.g. 50)
    impressionsA: v.number(),
    impressionsB: v.number(),
    conversionsA: v.number(),
    conversionsB: v.number(),
    revenueA: v.number(), // cents
    revenueB: v.number(), // cents
    winner: v.optional(v.string()),
    createdAt: v.number(),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
  })
    .index("by_slug", ["slug"])
    .index("by_status", ["status"])
    .index("by_product_status", ["product", "status"]),

  // ── Training Platform ──

  // Main training record (SET, CST)
  trainings: defineTable({
    slug: v.string(),
    type: v.optional(v.union(v.literal("training"), v.literal("audiobook"))),
    title: v.object({ nl: v.string(), en: v.string(), de: v.optional(v.string()) }),
    description: v.object({ nl: v.string(), en: v.string(), de: v.optional(v.string()) }),
    coverImageStorageId: v.optional(v.id("_storage")), // For audiobooks: album/book cover
    thumbnailStorageId: v.optional(v.id("_storage")),
    // Werkboek: per-language downloadable PDF with metadata shown on training page.
    // Image is shared across languages (same visual), metadata/PDF are per-language.
    workbookNl: v.optional(
      v.object({
        storageId: v.id("_storage"),
        fileName: v.string(),
        title: v.optional(v.string()),
        description: v.optional(v.string()),
        buttonLabel: v.optional(v.string()),
      }),
    ),
    workbookEn: v.optional(
      v.object({
        storageId: v.id("_storage"),
        fileName: v.string(),
        title: v.optional(v.string()),
        description: v.optional(v.string()),
        buttonLabel: v.optional(v.string()),
      }),
    ),
    workbookDe: v.optional(
      v.object({
        storageId: v.id("_storage"),
        fileName: v.string(),
        title: v.optional(v.string()),
        description: v.optional(v.string()),
        buttonLabel: v.optional(v.string()),
      }),
    ),
    workbookImageStorageId: v.optional(v.id("_storage")),
    // Which checkout product slugs grant access to this training
    linkedProducts: v.optional(v.array(v.string())),
    active: v.boolean(),
    sortOrder: v.number(),
    createdAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_active", ["active", "sortOrder"]),

  // Modules within a training (chapters and lessons)
  // parentModuleId = undefined → chapter (e.g. "Module 7: Sales Strategy")
  // parentModuleId = set → lesson/video within that chapter (e.g. "7.1: Introduction")
  trainingModules: defineTable({
    trainingId: v.id("trainings"),
    parentModuleId: v.optional(v.id("trainingModules")),
    slug: v.string(),
    title: v.object({ nl: v.string(), en: v.string(), de: v.optional(v.string()) }),
    description: v.object({ nl: v.string(), en: v.string(), de: v.optional(v.string()) }),
    vimeoVideoId: v.optional(v.string()),
    audioStorageId: v.optional(v.id("_storage")),
    audioDurationSeconds: v.optional(v.number()),
    audioFileName: v.optional(v.string()),
    durationSeconds: v.optional(v.number()),
    sortOrder: v.number(),
    // Optional manual display label (e.g. "1.0" or "Intro"). Overrides auto-numbering.
    displayNumber: v.optional(v.string()),
    workbookStorageId: v.optional(v.id("_storage")),
    workbookFileName: v.optional(v.string()),
    discussionEnabled: v.boolean(),
    quizRequired: v.boolean(),
    active: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_training", ["trainingId", "sortOrder"])
    .index("by_parent", ["parentModuleId", "sortOrder"])
    .index("by_slug", ["slug"]),

  // Quiz per module
  quizzes: defineTable({
    moduleId: v.id("trainingModules"),
    passingScore: v.number(), // default 70
    active: v.boolean(),
    createdAt: v.number(),
  }).index("by_module", ["moduleId"]),

  // Questions within a quiz
  quizQuestions: defineTable({
    quizId: v.id("quizzes"),
    sortOrder: v.number(),
    type: v.union(
      v.literal("multiple_choice"),
      v.literal("multiple_select"),
      v.literal("open"),
      v.literal("scale"),
    ),
    question: v.object({ nl: v.string(), en: v.string(), de: v.optional(v.string()) }),
    options: v.optional(
      v.array(
        v.object({
          text: v.object({ nl: v.string(), en: v.string(), de: v.optional(v.string()) }),
          correct: v.boolean(),
        }),
      ),
    ),
    scaleMin: v.optional(v.number()),
    scaleMax: v.optional(v.number()),
    scaleLabels: v.optional(v.object({ nl: v.string(), en: v.string(), de: v.optional(v.string()) })),
    createdAt: v.number(),
  }).index("by_quiz", ["quizId", "sortOrder"]),

  // Submitted quiz attempts
  quizAttempts: defineTable({
    userId: v.id("users"),
    quizId: v.id("quizzes"),
    moduleId: v.id("trainingModules"),
    score: v.number(), // percentage 0-100
    passed: v.boolean(),
    answers: v.array(
      v.object({
        questionId: v.id("quizQuestions"),
        answer: v.string(), // JSON-encoded answer
        correct: v.optional(v.boolean()),
      }),
    ),
    createdAt: v.number(),
  })
    .index("by_user_module", ["userId", "moduleId"])
    .index("by_quiz", ["quizId"]),

  // Per-user per-module progress
  moduleProgress: defineTable({
    userId: v.id("users"),
    moduleId: v.id("trainingModules"),
    trainingId: v.id("trainings"),
    videoProgress: v.number(), // 0-100 percentage
    videoPosition: v.number(), // seconds
    quizPassed: v.boolean(),
    completedAt: v.optional(v.number()),
    lastAccessedAt: v.number(),
  })
    .index("by_user_training", ["userId", "trainingId"])
    .index("by_module", ["moduleId"]),

  // Video bookmarks/checkpoints
  bookmarks: defineTable({
    userId: v.id("users"),
    moduleId: v.id("trainingModules"),
    videoTimestamp: v.number(), // seconds
    note: v.optional(v.string()),
    createdAt: v.number(),
    // Set when this bookmark has been migrated into the matching userNotes
    // contentJson as an inline timestamp node. Read-only after migration.
    migratedAt: v.optional(v.number()),
  }).index("by_user_module", ["userId", "moduleId"]),

  // Personal notes per user per module (one per pair, upsert pattern).
  userNotes: defineTable({
    userId: v.id("users"),
    moduleId: v.id("trainingModules"),
    trainingId: v.id("trainings"),
    content: v.string(),
    // Tiptap JSON document. New canonical format; `content` remains as a
    // plain-text fallback for legacy rows and PDF export text-only mode.
    contentJson: v.optional(v.any()),
    updatedAt: v.number(),
  })
    .index("by_user_module", ["userId", "moduleId"])
    .index("by_user_training", ["userId", "trainingId"]),

  // Training completion tracking — one row per (user, training) the moment
  // the cursist passes the final required quiz. Used to send the completion
  // email exactly once and gate future celebration logic.
  trainingCompletions: defineTable({
    userId: v.id("users"),
    trainingId: v.id("trainings"),
    completedAt: v.number(),
    emailSentAt: v.optional(v.number()),
  }).index("by_user_training", ["userId", "trainingId"]),

  // Per-lesson form / questionnaire. Cursists fill it in; on submit the
  // answers are e-mailed to `recipientEmail` (typically Klaas).
  lessonForms: defineTable({
    moduleId: v.id("trainingModules"),
    recipientEmail: v.string(),
    // Optional hero image shown between the form header and the intro text.
    imageStorageId: v.optional(v.id("_storage")),
    introText: v.object({
      nl: v.string(),
      en: v.string(),
      de: v.optional(v.string()),
    }),
    submitLabel: v.object({
      nl: v.string(),
      en: v.string(),
      de: v.optional(v.string()),
    }),
    fields: v.array(
      v.object({
        // Stable per-field identifier so submissions survive field reordering.
        id: v.string(),
        type: v.union(
          v.literal("text"),
          v.literal("textarea"),
          v.literal("radio"),
          v.literal("checkbox"),
          v.literal("scale"),
        ),
        label: v.object({
          nl: v.string(),
          en: v.string(),
          de: v.optional(v.string()),
        }),
        required: v.boolean(),
        // Choice options for radio/checkbox.
        options: v.optional(
          v.array(
            v.object({
              nl: v.string(),
              en: v.string(),
              de: v.optional(v.string()),
            }),
          ),
        ),
        scaleMin: v.optional(v.number()),
        scaleMax: v.optional(v.number()),
      }),
    ),
    active: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_module", ["moduleId"]),

  // Submitted form responses. One row per (user, form) submission attempt.
  lessonFormSubmissions: defineTable({
    formId: v.id("lessonForms"),
    moduleId: v.id("trainingModules"),
    trainingId: v.id("trainings"),
    userId: v.id("users"),
    answers: v.array(
      v.object({
        fieldId: v.string(),
        // JSON-encoded for non-string answers (e.g. checkbox arrays, scale ints).
        value: v.string(),
      }),
    ),
    emailSentAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_user_module", ["userId", "moduleId"])
    .index("by_form", ["formId"]),

  // Discussion posts per module
  discussions: defineTable({
    moduleId: v.id("trainingModules"),
    userId: v.id("users"),
    userName: v.string(),
    text: v.string(),
    upvotes: v.number(),
    isTrainer: v.boolean(),
    parentId: v.optional(v.id("discussions")),
    createdAt: v.number(),
  })
    .index("by_module", ["moduleId", "createdAt"])
    .index("by_parent", ["parentId"]),

  // Upvote tracking for discussions
  discussionVotes: defineTable({
    discussionId: v.id("discussions"),
    userId: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_discussion", ["discussionId"])
    .index("by_user_discussion", ["userId", "discussionId"]),

  // ── Site Pages ──
  // Page definitions with ordered section list
  sitePages: defineTable({
    slug: v.string(),
    title: v.object({ nl: v.string(), en: v.string(), de: v.optional(v.string()) }),
    sections: v.array(
      v.object({
        id: v.string(),
        type: v.string(),
        active: v.boolean(),
        sortOrder: v.number(),
      }),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_slug", ["slug"]),

  // ── Site Content ──
  // Content per section, editable in admin
  siteContent: defineTable({
    pageSlug: v.string(),
    sectionId: v.string(),
    schema: v.string(), // JSON schema definition
    content: v.string(), // JSON content data
    lang: langValidator,
    updatedAt: v.number(),
  })
    .index("by_page_section", ["pageSlug", "sectionId", "lang"])
    .index("by_page", ["pageSlug"]),

  // ── Site Images ──
  // All site images stored in Convex storage, manageable via admin
  siteImages: defineTable({
    key: v.string(),
    storageId: v.id("_storage"),
    fileName: v.string(),
    alt: v.optional(v.string()),
    category: v.string(),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    lang: v.optional(langValidator), // null = universal, "nl"/"en"/"de" = language-specific
    createdAt: v.number(),
  })
    .index("by_key", ["key"])
    .index("by_key_lang", ["key", "lang"])
    .index("by_category", ["category"]),

  // ── Image Specs ──
  // Desired display dimensions per image key (used by admin crop tool)
  imageSpecs: defineTable({
    imageKey: v.string(),
    displayWidth: v.number(),
    displayHeight: v.number(),
    aspectRatio: v.string(), // "16:9", "4:3", "1:1"
    context: v.string(), // "TrainingHero — volledig scherm"
    pageSlug: v.optional(v.string()), // primary page (legacy)
    pageSlugs: v.optional(v.array(v.string())), // all pages that use this image
    objectPosition: v.optional(v.string()), // "top", "center", "bottom" — matches frontend
    updatedAt: v.number(),
  })
    .index("by_key", ["imageKey"])
    .index("by_page", ["pageSlug"]),

  // ── Layout Editor ──
  // Sessions for AI-powered layout editing
  layoutSessions: defineTable({
    status: v.union(
      v.literal("chatting"),
      v.literal("planning"),
      v.literal("locked"),
      v.literal("building"),
      v.literal("preview"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("failed"),
      v.literal("reverted"),
    ),
    userId: v.id("users"),
    userEmail: v.string(),
    targetPage: v.string(),
    branchName: v.string(),
    prNumber: v.optional(v.number()),
    previewUrl: v.optional(v.string()),
    plan: v.optional(v.string()),
    planVersion: v.optional(v.number()),
    messages: v.array(
      v.object({
        role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
        text: v.string(),
        createdAt: v.number(),
      }),
    ),
    errorMessage: v.optional(v.string()),
    // Uploaded images for AI to use in layout
    uploadedImages: v.optional(v.array(v.object({
      storageId: v.id("_storage"),
      url: v.string(),
      fileName: v.string(),
    }))),
    // Image spec updates (sent by layout-edit AI when aspect ratios change)
    imageSpecUpdates: v.optional(v.array(v.object({
      imageKey: v.string(),
      displayWidth: v.number(),
      displayHeight: v.number(),
      aspectRatio: v.string(),
      context: v.string(),
    }))),
    // Deploy monitoring (checked after merge)
    deployStatus: v.optional(v.union(v.literal("pending"), v.literal("success"), v.literal("failed"))),
    deployError: v.optional(v.string()),
    // Revert data (stored at approval, used for one-version-back undo)
    mergeCommitSha: v.optional(v.string()),
    sectionSnapshot: v.optional(v.string()), // JSON of page sections before sync
    lastActivityAt: v.number(),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_status", ["status"])
    .index("by_user", ["userId"]),

  // Layout editor config (single row)
  layoutConfig: defineTable({
    key: v.string(),
    allowedEmails: v.array(v.string()),
    sessionTimeoutMinutes: v.number(),
  })
    .index("by_key", ["key"]),

  // AI email editor sessions
  emailEditorSessions: defineTable({
    status: v.string(), // "pending" | "generating" | "completed" | "failed"
    mode: v.string(), // "new" | "edit"
    lang: v.string(), // "nl" | "en"
    prompt: v.string(),
    imageUrls: v.array(v.string()),
    existingHtml: v.optional(v.string()),
    generatedHtml: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
    templateId: v.optional(v.id("emailTemplates")),
    createdAt: v.number(),
  }),
});
