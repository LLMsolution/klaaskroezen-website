/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as abtest from "../abtest.js";
import type * as adSpend from "../adSpend.js";
import type * as admin from "../admin.js";
import type * as adminAuth from "../adminAuth.js";
import type * as adminBroadcasts from "../adminBroadcasts.js";
import type * as adminContacts from "../adminContacts.js";
import type * as adminEmails from "../adminEmails.js";
import type * as adminOrders from "../adminOrders.js";
import type * as auth from "../auth.js";
import type * as automationSeed from "../automationSeed.js";
import type * as blog from "../blog.js";
import type * as blogSeed from "../blogSeed.js";
import type * as blogSeedArchive from "../blogSeedArchive.js";
import type * as blogTranslate from "../blogTranslate.js";
import type * as bolOrders from "../bolOrders.js";
import type * as bookmarks from "../bookmarks.js";
import type * as checkout from "../checkout.js";
import type * as checkoutProductSeed from "../checkoutProductSeed.js";
import type * as checkoutProducts from "../checkoutProducts.js";
import type * as checkoutReviews from "../checkoutReviews.js";
import type * as cleanup from "../cleanup.js";
import type * as contactForm from "../contactForm.js";
import type * as crm from "../crm.js";
import type * as crmAutomation from "../crmAutomation.js";
import type * as crmHooks from "../crmHooks.js";
import type * as crmLeads from "../crmLeads.js";
import type * as crmMigration from "../crmMigration.js";
import type * as crmNurturing from "../crmNurturing.js";
import type * as crmPipeline from "../crmPipeline.js";
import type * as crmReporting from "../crmReporting.js";
import type * as crmScoring from "../crmScoring.js";
import type * as crons from "../crons.js";
import type * as cstTrainingSeed from "../cstTrainingSeed.js";
import type * as discussions from "../discussions.js";
import type * as emailAdmin from "../emailAdmin.js";
import type * as emailBroadcasts from "../emailBroadcasts.js";
import type * as emailEditor from "../emailEditor.js";
import type * as emailHelpers from "../emailHelpers.js";
import type * as emailSequences from "../emailSequences.js";
import type * as emailTemplates from "../emailTemplates.js";
import type * as emailTracking from "../emailTracking.js";
import type * as emails from "../emails.js";
import type * as http from "../http.js";
import type * as imageSpecs from "../imageSpecs.js";
import type * as imageSpecsSeed from "../imageSpecsSeed.js";
import type * as invoices from "../invoices.js";
import type * as layoutEditor from "../layoutEditor.js";
import type * as layoutEditorActions from "../layoutEditorActions.js";
import type * as layoutEditorConfig from "../layoutEditorConfig.js";
import type * as layoutEditorOps from "../layoutEditorOps.js";
import type * as mollie from "../mollie.js";
import type * as payments from "../payments.js";
import type * as presence from "../presence.js";
import type * as quizzes from "../quizzes.js";
import type * as rateLimits from "../rateLimits.js";
import type * as setTrainingSeed from "../setTrainingSeed.js";
import type * as settings from "../settings.js";
import type * as siteContent from "../siteContent.js";
import type * as siteImages from "../siteImages.js";
import type * as siteImagesMigrateContent from "../siteImagesMigrateContent.js";
import type * as siteImagesMigration from "../siteImagesMigration.js";
import type * as siteSchemas from "../siteSchemas.js";
import type * as siteSeed from "../siteSeed.js";
import type * as siteSeedBoek from "../siteSeedBoek.js";
import type * as siteSeedContact from "../siteSeedContact.js";
import type * as siteSeedCst from "../siteSeedCst.js";
import type * as siteSeedHome from "../siteSeedHome.js";
import type * as siteSeedOverOns from "../siteSeedOverOns.js";
import type * as siteSeedSet from "../siteSeedSet.js";
import type * as siteSeedSpreker from "../siteSeedSpreker.js";
import type * as trainingContentSeed from "../trainingContentSeed.js";
import type * as trainingMigration from "../trainingMigration.js";
import type * as trainingModules from "../trainingModules.js";
import type * as trainingProgress from "../trainingProgress.js";
import type * as trainingSeed from "../trainingSeed.js";
import type * as trainings from "../trainings.js";
import type * as userNotes from "../userNotes.js";
import type * as users from "../users.js";
import type * as workflowEngine from "../workflowEngine.js";
import type * as workflows from "../workflows.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  abtest: typeof abtest;
  adSpend: typeof adSpend;
  admin: typeof admin;
  adminAuth: typeof adminAuth;
  adminBroadcasts: typeof adminBroadcasts;
  adminContacts: typeof adminContacts;
  adminEmails: typeof adminEmails;
  adminOrders: typeof adminOrders;
  auth: typeof auth;
  automationSeed: typeof automationSeed;
  blog: typeof blog;
  blogSeed: typeof blogSeed;
  blogSeedArchive: typeof blogSeedArchive;
  blogTranslate: typeof blogTranslate;
  bolOrders: typeof bolOrders;
  bookmarks: typeof bookmarks;
  checkout: typeof checkout;
  checkoutProductSeed: typeof checkoutProductSeed;
  checkoutProducts: typeof checkoutProducts;
  checkoutReviews: typeof checkoutReviews;
  cleanup: typeof cleanup;
  contactForm: typeof contactForm;
  crm: typeof crm;
  crmAutomation: typeof crmAutomation;
  crmHooks: typeof crmHooks;
  crmLeads: typeof crmLeads;
  crmMigration: typeof crmMigration;
  crmNurturing: typeof crmNurturing;
  crmPipeline: typeof crmPipeline;
  crmReporting: typeof crmReporting;
  crmScoring: typeof crmScoring;
  crons: typeof crons;
  cstTrainingSeed: typeof cstTrainingSeed;
  discussions: typeof discussions;
  emailAdmin: typeof emailAdmin;
  emailBroadcasts: typeof emailBroadcasts;
  emailEditor: typeof emailEditor;
  emailHelpers: typeof emailHelpers;
  emailSequences: typeof emailSequences;
  emailTemplates: typeof emailTemplates;
  emailTracking: typeof emailTracking;
  emails: typeof emails;
  http: typeof http;
  imageSpecs: typeof imageSpecs;
  imageSpecsSeed: typeof imageSpecsSeed;
  invoices: typeof invoices;
  layoutEditor: typeof layoutEditor;
  layoutEditorActions: typeof layoutEditorActions;
  layoutEditorConfig: typeof layoutEditorConfig;
  layoutEditorOps: typeof layoutEditorOps;
  mollie: typeof mollie;
  payments: typeof payments;
  presence: typeof presence;
  quizzes: typeof quizzes;
  rateLimits: typeof rateLimits;
  setTrainingSeed: typeof setTrainingSeed;
  settings: typeof settings;
  siteContent: typeof siteContent;
  siteImages: typeof siteImages;
  siteImagesMigrateContent: typeof siteImagesMigrateContent;
  siteImagesMigration: typeof siteImagesMigration;
  siteSchemas: typeof siteSchemas;
  siteSeed: typeof siteSeed;
  siteSeedBoek: typeof siteSeedBoek;
  siteSeedContact: typeof siteSeedContact;
  siteSeedCst: typeof siteSeedCst;
  siteSeedHome: typeof siteSeedHome;
  siteSeedOverOns: typeof siteSeedOverOns;
  siteSeedSet: typeof siteSeedSet;
  siteSeedSpreker: typeof siteSeedSpreker;
  trainingContentSeed: typeof trainingContentSeed;
  trainingMigration: typeof trainingMigration;
  trainingModules: typeof trainingModules;
  trainingProgress: typeof trainingProgress;
  trainingSeed: typeof trainingSeed;
  trainings: typeof trainings;
  userNotes: typeof userNotes;
  users: typeof users;
  workflowEngine: typeof workflowEngine;
  workflows: typeof workflows;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  rateLimiter: {
    lib: {
      checkRateLimit: FunctionReference<
        "query",
        "internal",
        {
          config:
            | {
                capacity?: number;
                kind: "token bucket";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: null;
              }
            | {
                capacity?: number;
                kind: "fixed window";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: number;
              };
          count?: number;
          key?: string;
          name: string;
          reserve?: boolean;
          throws?: boolean;
        },
        { ok: true; retryAfter?: number } | { ok: false; retryAfter: number }
      >;
      clearAll: FunctionReference<
        "mutation",
        "internal",
        { before?: number },
        null
      >;
      getServerTime: FunctionReference<"mutation", "internal", {}, number>;
      getValue: FunctionReference<
        "query",
        "internal",
        {
          config:
            | {
                capacity?: number;
                kind: "token bucket";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: null;
              }
            | {
                capacity?: number;
                kind: "fixed window";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: number;
              };
          key?: string;
          name: string;
          sampleShards?: number;
        },
        {
          config:
            | {
                capacity?: number;
                kind: "token bucket";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: null;
              }
            | {
                capacity?: number;
                kind: "fixed window";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: number;
              };
          shard: number;
          ts: number;
          value: number;
        }
      >;
      rateLimit: FunctionReference<
        "mutation",
        "internal",
        {
          config:
            | {
                capacity?: number;
                kind: "token bucket";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: null;
              }
            | {
                capacity?: number;
                kind: "fixed window";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: number;
              };
          count?: number;
          key?: string;
          name: string;
          reserve?: boolean;
          throws?: boolean;
        },
        { ok: true; retryAfter?: number } | { ok: false; retryAfter: number }
      >;
      resetRateLimit: FunctionReference<
        "mutation",
        "internal",
        { key?: string; name: string },
        null
      >;
    };
    time: {
      getServerTime: FunctionReference<"mutation", "internal", {}, number>;
    };
  };
};
