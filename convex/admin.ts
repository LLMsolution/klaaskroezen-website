/**
 * Admin module — re-exports from domain-specific sub-modules.
 *
 * All frontend code uses `api.admin.*`, so this file re-exports everything
 * to keep existing imports working. Implementation lives in:
 *   - adminOrders.ts      (stats, orders, carts, invoices, discounts, cohorts)
 *   - adminBroadcasts.ts  (broadcasts, segment preview)
 *   - adminEmails.ts      (sequences, templates, email log, previews)
 *   - adminContacts.ts    (mailing list, contact email history)
 */

// ── Orders, Stats, Discounts, Cohorts ──
export {
  getStats,
  getOrders,
  getPendingCarts,
  getInvoices,
  getDiscountCodes,
  createDiscountCode,
  deleteDiscountCode,
  getCohorts,
} from "./adminOrders";

// ── Broadcasts ──
export {
  getBroadcasts,
  previewSegmentCount,
  saveBroadcast,
  triggerBroadcast,
  deleteBroadcast,
} from "./adminBroadcasts";

// ── Email Sequences, Templates, Activity ──
export {
  getSequences,
  getEmailTemplates,
  initEmailTemplates,
  updateEmailTemplate,
  getEmailLog,
  getEmailLogEnhanced,
  getEmailPreview,
  previewTemplate,
} from "./adminEmails";

// ── Mailing List & Contacts ──
export {
  getMailingList,
  getContactEmails,
} from "./adminContacts";
