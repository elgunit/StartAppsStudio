import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, pgEnum, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum("user_role", ["client", "designer"]);
export const projectStatusEnum = pgEnum("project_status", [
  "brief_submitted",
  "hat_selection",
  "discovery",
  "design_build",
  "client_review",
  "iteration",
  "completed"
]);
export const hatTypeEnum = pgEnum("hat_type", [
  "designer",
  "developer",
  "strategist",
  "manager",
  "analyst"
]);

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: userRoleEnum("role").notNull().default("client"),
  avatarUrl: text("avatar_url"),
  credits: integer("credits").notNull().default(0),
  isOnline: boolean("is_online").notNull().default(false),
  sessionToken: text("session_token"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Projects table
export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description").notNull(),
  status: projectStatusEnum("status").notNull().default("brief_submitted"),
  currentHat: hatTypeEnum("current_hat"),
  previewUrl: text("preview_url"),
  planTier: text("plan_tier"),
  estimatedCredits: integer("estimated_credits").notNull().default(0),
  usedCredits: integer("used_credits").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Project hats (which expertise is needed)
export const projectHats = pgTable("project_hats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id),
  hatType: hatTypeEnum("hat_type").notNull(),
});

// Messages table
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  fileUrl: text("file_url"),
  fileName: text("file_name"),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Work sessions table
export const workSessions = pgTable("work_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id),
  startTime: timestamp("start_time").notNull().defaultNow(),
  endTime: timestamp("end_time"),
  promptCount: integer("prompt_count").notNull().default(0),
  notes: text("notes"),
  isActive: boolean("is_active").notNull().default(true),
});

// Project versions/iterations
export const projectVersions = pgTable("project_versions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id),
  versionNumber: integer("version_number").notNull(),
  previewUrl: text("preview_url"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Credit packages
export const creditPackages = pgTable("credit_packages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  credits: integer("credits").notNull(),
  priceInCents: integer("price_in_cents").notNull(),
  description: text("description"),
  isPopular: boolean("is_popular").notNull().default(false),
});

// Credit transactions
export const creditTransactions = pgTable("credit_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  projectId: varchar("project_id").references(() => projects.id),
  amount: integer("amount").notNull(),
  type: text("type").notNull(), // 'purchase' | 'usage' | 'refund'
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Marketing services
export const serviceOrderStatusEnum = pgEnum("service_order_status", [
  "submitted",
  "in_progress",
  "delivered",
]);

export const marketingServices = pgTable("marketing_services", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  category: text("category").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  creditsRequired: integer("credits_required").notNull(),
  deliverables: text("deliverables").array().notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const serviceOrders = pgTable("service_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").notNull().references(() => users.id),
  serviceId: varchar("service_id").notNull().references(() => marketingServices.id),
  status: serviceOrderStatusEnum("status").notNull().default("submitted"),
  goals: text("goals").notNull(),
  websiteUrl: text("website_url"),
  creditsCharged: integer("credits_charged").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const serviceOrdersRelations = relations(serviceOrders, ({ one }) => ({
  client: one(users, {
    fields: [serviceOrders.clientId],
    references: [users.id],
  }),
  service: one(marketingServices, {
    fields: [serviceOrders.serviceId],
    references: [marketingServices.id],
  }),
}));

// Section views — anonymous-friendly tracking of when sections become visible
export const sectionViews = pgTable("section_views", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sectionName: text("section_name").notNull(),
  visitorId: varchar("visitor_id").notNull(),
  userAgent: text("user_agent"),
  referrerUrl: text("referrer_url"),
  pageLoadAt: timestamp("page_load_at").notNull().defaultNow(),
  durationMs: integer("duration_ms"),
  userId: varchar("user_id").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Visitor events — generic event log (clicks, scroll depth, route changes, etc.)
export const visitorEvents = pgTable("visitor_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  visitorId: varchar("visitor_id").notNull(),
  eventType: text("event_type").notNull(),
  pagePath: text("page_path"),
  eventData: text("event_data"),
  userId: varchar("user_id").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Journal leads — guest emails captured from in-app Journal article CTAs
export const journalLeads = pgTable("journal_leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  slug: text("slug").notNull(),
  title: text("title"),
  email: text("email").notNull(),
  source: text("source").notNull().default("journal_signup"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  slugEmailUnique: uniqueIndex("journal_leads_slug_email_unique").on(table.slug, table.email),
}));

// Contact form submissions
export const contactSubmissions = pgTable("contact_submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  company: text("company"),
  budget: text("budget"),
  interests: text("interests").array(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
  messages: many(messages),
  creditTransactions: many(creditTransactions),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  client: one(users, {
    fields: [projects.clientId],
    references: [users.id],
  }),
  messages: many(messages),
  workSessions: many(workSessions),
  versions: many(projectVersions),
  hats: many(projectHats),
}));

export const projectHatsRelations = relations(projectHats, ({ one }) => ({
  project: one(projects, {
    fields: [projectHats.projectId],
    references: [projects.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  project: one(projects, {
    fields: [messages.projectId],
    references: [projects.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));

export const workSessionsRelations = relations(workSessions, ({ one }) => ({
  project: one(projects, {
    fields: [workSessions.projectId],
    references: [projects.id],
  }),
}));

export const projectVersionsRelations = relations(projectVersions, ({ one }) => ({
  project: one(projects, {
    fields: [projectVersions.projectId],
    references: [projects.id],
  }),
}));

export const creditTransactionsRelations = relations(creditTransactions, ({ one }) => ({
  user: one(users, {
    fields: [creditTransactions.userId],
    references: [users.id],
  }),
}));

// Schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertWorkSessionSchema = createInsertSchema(workSessions).omit({
  id: true,
});

export const insertProjectVersionSchema = createInsertSchema(projectVersions).omit({
  id: true,
  createdAt: true,
});

export const insertCreditPackageSchema = createInsertSchema(creditPackages).omit({
  id: true,
});

export const insertCreditTransactionSchema = createInsertSchema(creditTransactions).omit({
  id: true,
  createdAt: true,
});

export const insertContactSubmissionSchema = createInsertSchema(contactSubmissions).omit({
  id: true,
  createdAt: true,
});

export const insertJournalLeadSchema = createInsertSchema(journalLeads).omit({
  id: true,
  createdAt: true,
});

export const insertMarketingServiceSchema = createInsertSchema(marketingServices).omit({
  id: true,
  createdAt: true,
});

export const insertServiceOrderSchema = createInsertSchema(serviceOrders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type WorkSession = typeof workSessions.$inferSelect;
export type InsertWorkSession = z.infer<typeof insertWorkSessionSchema>;
export type ProjectVersion = typeof projectVersions.$inferSelect;
export type InsertProjectVersion = z.infer<typeof insertProjectVersionSchema>;
export type CreditPackage = typeof creditPackages.$inferSelect;
export type InsertCreditPackage = z.infer<typeof insertCreditPackageSchema>;
export type CreditTransaction = typeof creditTransactions.$inferSelect;
export type InsertCreditTransaction = z.infer<typeof insertCreditTransactionSchema>;
export type ProjectHat = typeof projectHats.$inferSelect;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;
export type InsertContactSubmission = z.infer<typeof insertContactSubmissionSchema>;
export type JournalLead = typeof journalLeads.$inferSelect;
export type InsertJournalLead = z.infer<typeof insertJournalLeadSchema>;
export type MarketingService = typeof marketingServices.$inferSelect;
export type InsertMarketingService = z.infer<typeof insertMarketingServiceSchema>;
export type ServiceOrder = typeof serviceOrders.$inferSelect;
export type InsertServiceOrder = z.infer<typeof insertServiceOrderSchema>;
export type HatType = "designer" | "developer" | "strategist" | "manager" | "analyst";
export type ProjectStatus = "brief_submitted" | "hat_selection" | "discovery" | "design_build" | "client_review" | "iteration" | "completed";
export type ServiceOrderStatus = "submitted" | "in_progress" | "delivered";

// App launch waitlist — pre-registration emails
export const appWaitlist = pgTable("app_waitlist", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  source: text("source").default("landing"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
export type AppWaitlist = typeof appWaitlist.$inferSelect;

// Journal report schedules — recurring CSV email delivery
export const journalReportSchedules = pgTable("journal_report_schedules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  frequency: text("frequency").notNull().default("weekly"), // "weekly" | "monthly"
  recipientEmail: text("recipient_email").notNull(),
  enabled: boolean("enabled").notNull().default(true),
  lastSentAt: timestamp("last_sent_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertJournalReportScheduleSchema = createInsertSchema(journalReportSchedules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastSentAt: true,
});
export type JournalReportSchedule = typeof journalReportSchedules.$inferSelect;
export type InsertJournalReportSchedule = z.infer<typeof insertJournalReportScheduleSchema>;

// AI assistant / crawler traffic — request-level log of hits from AI bots
// (GPTBot, ChatGPT-User, ClaudeBot, PerplexityBot, etc.). Used so we can
// see which assistants actually drive traffic to the site, since GA4
// lumps these into "Direct" or "Other" because they don't send referrers.
export const aiCrawlerHits = pgTable("ai_crawler_hits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  botName: text("bot_name").notNull(),
  pagePath: text("page_path").notNull(),
  userAgent: text("user_agent"),
  referrerUrl: text("referrer_url"),
  ipHash: text("ip_hash"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAiCrawlerHitSchema = createInsertSchema(aiCrawlerHits).omit({
  id: true,
  createdAt: true,
});
export type AiCrawlerHit = typeof aiCrawlerHits.$inferSelect;
export type InsertAiCrawlerHit = z.infer<typeof insertAiCrawlerHitSchema>;

// Visitor analytics
export const insertSectionViewSchema = createInsertSchema(sectionViews).omit({
  id: true,
  createdAt: true,
});
export const insertVisitorEventSchema = createInsertSchema(visitorEvents).omit({
  id: true,
  createdAt: true,
});
export type SectionView = typeof sectionViews.$inferSelect;
export type InsertSectionView = z.infer<typeof insertSectionViewSchema>;
export type VisitorEvent = typeof visitorEvents.$inferSelect;
export type InsertVisitorEvent = z.infer<typeof insertVisitorEventSchema>;
