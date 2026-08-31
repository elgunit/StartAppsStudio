import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Section views — anonymous-friendly tracking of when sections become visible
export const sectionViews = pgTable("section_views", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sectionName: text("section_name").notNull(),
  visitorId: varchar("visitor_id").notNull(),
  userAgent: text("user_agent"),
  referrerUrl: text("referrer_url"),
  pageLoadAt: timestamp("page_load_at").notNull().defaultNow(),
  durationMs: integer("duration_ms"),
  userId: varchar("user_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Visitor events — generic event log (clicks, scroll depth, route changes, etc.)
export const visitorEvents = pgTable("visitor_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  visitorId: varchar("visitor_id").notNull(),
  eventType: text("event_type").notNull(),
  pagePath: text("page_path"),
  eventData: text("event_data"),
  userId: varchar("user_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Journal leads — guest emails captured from Journal article CTAs
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
  timeline: text("timeline"),
  businessStage: text("business_stage"),
  digitalPresence: text("digital_presence"),
  desiredOutcome: text("desired_outcome"),
  attributionSource: text("attribution_source"),
  attributionCampaign: text("attribution_campaign"),
  attributionPage: text("attribution_page"),
  attributionSection: text("attribution_section"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

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

// AI assistant / crawler traffic — request-level log of hits from AI bots
export const aiCrawlerHits = pgTable("ai_crawler_hits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  botName: text("bot_name").notNull(),
  pagePath: text("page_path").notNull(),
  userAgent: text("user_agent"),
  referrerUrl: text("referrer_url"),
  ipHash: text("ip_hash"),
  verification: text("verification").notNull().default("unverifiable"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Toolkit reveals — visitors hover/tap a blurred toolkit chip to reveal the tool name
export const toolkitReveals = pgTable("toolkit_reveals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  toolName: text("tool_name").notNull(),
  toolGroup: text("tool_group"),
  source: text("source"),
  userAgent: text("user_agent"),
  ipHash: text("ip_hash"),
  // true when the same ipHash+toolName was already recorded within the prior 24 h
  // (raw row is preserved; stats queries filter this out for unique-visitor counts)
  isDuplicate: boolean("is_duplicate").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Schemas
export const insertJournalLeadSchema = createInsertSchema(journalLeads).omit({
  id: true,
  createdAt: true,
});

export const insertContactSubmissionSchema = createInsertSchema(contactSubmissions).omit({
  id: true,
  createdAt: true,
});

export const insertJournalReportScheduleSchema = createInsertSchema(journalReportSchedules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastSentAt: true,
});

export const insertAiCrawlerHitSchema = createInsertSchema(aiCrawlerHits).omit({
  id: true,
  createdAt: true,
});

export const insertToolkitRevealSchema = createInsertSchema(toolkitReveals).omit({
  id: true,
  createdAt: true,
});

export const insertSectionViewSchema = createInsertSchema(sectionViews).omit({
  id: true,
  createdAt: true,
});

export const insertVisitorEventSchema = createInsertSchema(visitorEvents).omit({
  id: true,
  createdAt: true,
});

// Types
export type JournalLead = typeof journalLeads.$inferSelect;
export type InsertJournalLead = z.infer<typeof insertJournalLeadSchema>;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;
export type InsertContactSubmission = z.infer<typeof insertContactSubmissionSchema>;
export type JournalReportSchedule = typeof journalReportSchedules.$inferSelect;
export type InsertJournalReportSchedule = z.infer<typeof insertJournalReportScheduleSchema>;
export type AiCrawlerHit = typeof aiCrawlerHits.$inferSelect;
export type InsertAiCrawlerHit = z.infer<typeof insertAiCrawlerHitSchema>;
export type ToolkitReveal = typeof toolkitReveals.$inferSelect;
export type InsertToolkitReveal = z.infer<typeof insertToolkitRevealSchema>;
export type SectionView = typeof sectionViews.$inferSelect;
export type InsertSectionView = z.infer<typeof insertSectionViewSchema>;
export type VisitorEvent = typeof visitorEvents.$inferSelect;
export type InsertVisitorEvent = z.infer<typeof insertVisitorEventSchema>;
