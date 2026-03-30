import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// CRM: Decay engagement/intent scores by 10% per month of inactivity
// Runs daily at 03:00 UTC
crons.daily(
  "crm-score-decay",
  { hourUTC: 3, minuteUTC: 0 },
  internal.crmScoring.decayScores,
);

// CRM: Check score threshold automation rules
// Runs daily at 08:00 UTC (morning in NL)
crons.daily(
  "crm-score-thresholds",
  { hourUTC: 8, minuteUTC: 0 },
  internal.crmScoring.checkScoreThresholds,
);

// CRM: Check inactivity automation rules
// Runs daily at 09:00 UTC
crons.daily(
  "crm-inactivity-check",
  { hourUTC: 9, minuteUTC: 0 },
  internal.crmAutomation.checkInactivityRules,
);

// Workflows: Process waiting enrollments (execute next step when delay is over)
// Runs every 5 minutes
crons.interval(
  "workflow-process-waiting",
  { minutes: 5 },
  internal.workflowEngine.processWaitingEnrollments,
);

// Layout editor: Clean up expired sessions
// Runs every 30 minutes
crons.interval(
  "layout-session-cleanup",
  { minutes: 30 },
  internal.layoutEditorOps.cleanupExpiredSessions,
);

// Bol.com: Sync new orders every 5 minutes
crons.interval(
  "bolcom-sync-orders",
  { minutes: 5 },
  internal.bolOrders.syncOrders,
);

export default crons;
