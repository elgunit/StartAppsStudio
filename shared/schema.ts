import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";
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
  amount: integer("amount").notNull(),
  type: text("type").notNull(), // 'purchase' | 'usage' | 'refund'
  description: text("description"),
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
export type HatType = "designer" | "developer" | "strategist" | "manager" | "analyst";
export type ProjectStatus = "brief_submitted" | "hat_selection" | "discovery" | "design_build" | "client_review" | "iteration" | "completed";
