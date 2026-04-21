import {
  users, projects, messages, workSessions, projectVersions,
  creditPackages, creditTransactions, projectHats, contactSubmissions,
  marketingServices, serviceOrders, sectionViews, visitorEvents, journalLeads,
  journalReportSchedules, aiCrawlerHits, toolkitReveals,
  type User, type InsertUser, type Project, type InsertProject,
  type Message, type InsertMessage, type WorkSession, type InsertWorkSession,
  type ProjectVersion, type InsertProjectVersion, type CreditPackage,
  type InsertCreditPackage, type CreditTransaction, type InsertCreditTransaction,
  type ProjectHat, type HatType, type ContactSubmission, type InsertContactSubmission,
  type MarketingService, type InsertMarketingService, type ServiceOrder, type InsertServiceOrder,
  type SectionView, type InsertSectionView, type VisitorEvent, type InsertVisitorEvent,
  type JournalLead, type InsertJournalLead,
  type JournalReportSchedule,
  type AiCrawlerHit, type InsertAiCrawlerHit,
  type ToolkitReveal, type InsertToolkitReveal,
} from "@shared/schema";

export interface JournalConversionRow {
  slug: string;
  title: string | null;
  views: number;
  ctaClicks: number;
  createAccountChoices: number;
  openContactChoices: number;
  guestEmails: number;
}

export interface TrendBucket {
  label: string;
  views: number;
  ctaClicks: number;
  createAccountChoices: number;
  openContactChoices: number;
  guestEmails: number;
}

export interface AiCrawlerStatRow {
  botName: string;
  // `hits` excludes suspected spoofs so it's the trustworthy headline.
  // `spoofedHits` is reported separately so designers can see attempted
  // impersonation without it polluting the main count.
  hits: number;
  verifiedHits: number;
  unverifiableHits: number;
  spoofedHits: number;
  uniquePages: number;
  lastSeenAt: Date | null;
  topPagePath: string | null;
}

export interface JournalTrendRow {
  slug: string;
  title: string | null;
  bucketSize: "day" | "week" | "month";
  buckets: TrendBucket[];
}
import { db } from "./db";
import { eq, desc, and, or, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;
  getDesigner(): Promise<User | undefined>;

  // Projects
  getProject(id: string): Promise<Project | undefined>;
  getProjectsByClient(clientId: string): Promise<Project[]>;
  getAllProjects(): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, data: Partial<Project>): Promise<Project | undefined>;
  deleteProject(id: string): Promise<void>;
  getProjectWithDetails(id: string): Promise<any>;

  // Project Hats
  addProjectHat(projectId: string, hatType: HatType): Promise<ProjectHat>;
  getProjectHats(projectId: string): Promise<ProjectHat[]>;

  // Messages
  getMessage(id: string): Promise<Message | undefined>;
  getMessagesByProject(projectId: string): Promise<Message[]>;
  getConversations(userId: string): Promise<any[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessagesAsRead(projectId: string, userId: string): Promise<void>;

  // Work Sessions
  getWorkSession(id: string): Promise<WorkSession | undefined>;
  getActiveWorkSession(): Promise<WorkSession | undefined>;
  getWorkSessionsByProject(projectId: string): Promise<WorkSession[]>;
  createWorkSession(session: InsertWorkSession): Promise<WorkSession>;
  updateWorkSession(id: string, data: Partial<WorkSession>): Promise<WorkSession | undefined>;
  getTotalWorkTimeForProject(projectId: string): Promise<number>;

  // Project Versions
  getProjectVersions(projectId: string): Promise<ProjectVersion[]>;
  createProjectVersion(version: InsertProjectVersion): Promise<ProjectVersion>;

  // Credit Packages
  getCreditPackages(): Promise<CreditPackage[]>;
  getCreditPackage(id: string): Promise<CreditPackage | undefined>;
  createCreditPackage(pkg: InsertCreditPackage): Promise<CreditPackage>;

  // Credit Transactions
  getCreditTransactionsByUser(userId: string): Promise<CreditTransaction[]>;
  createCreditTransaction(transaction: InsertCreditTransaction): Promise<CreditTransaction>;
  addCreditsToUser(userId: string, amount: number, description: string, projectId?: string): Promise<void>;
  useCredits(userId: string, amount: number, description: string): Promise<boolean>;

  // Clients
  getClientUsers(): Promise<User[]>;

  // Contact Submissions
  createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission>;
  getContactSubmissions(): Promise<ContactSubmission[]>;

  // Journal Leads
  createJournalLead(lead: InsertJournalLead): Promise<{ lead: JournalLead; created: boolean }>;
  getJournalLeads(limit?: number): Promise<JournalLead[]>;

  // Visitor Analytics
  createSectionView(view: InsertSectionView): Promise<SectionView>;
  createVisitorEvent(event: InsertVisitorEvent): Promise<VisitorEvent>;
  getSectionViews(limit?: number): Promise<SectionView[]>;
  getVisitorEvents(limit?: number): Promise<VisitorEvent[]>;
  getJournalConversionStats(from?: Date, to?: Date): Promise<JournalConversionRow[]>;
  getJournalConversionTrends(from?: Date, to?: Date): Promise<JournalTrendRow[]>;

  // AI assistant traffic
  recordAiCrawlerHit(hit: InsertAiCrawlerHit): Promise<AiCrawlerHit>;
  getAiCrawlerStats(from?: Date, to?: Date): Promise<AiCrawlerStatRow[]>;
  getRecentAiCrawlerHits(limit?: number): Promise<AiCrawlerHit[]>;

  // Toolkit reveals (which tools visitors hovered/tapped to unblur)
  recordToolkitReveal(reveal: InsertToolkitReveal): Promise<ToolkitReveal>;
  getToolkitRevealStats(from?: Date, to?: Date): Promise<{ toolName: string; toolGroup: string | null; reveals: number; lastSeen: Date }[]>;

  // Marketing Services
  getMarketingServices(): Promise<MarketingService[]>;
  getMarketingService(id: string): Promise<MarketingService | undefined>;
  createMarketingService(service: InsertMarketingService): Promise<MarketingService>;

  // Service Orders
  getServiceOrdersByClient(clientId: string): Promise<any[]>;
  getServiceOrder(id: string): Promise<ServiceOrder | undefined>;
  createServiceOrder(order: InsertServiceOrder): Promise<ServiceOrder>;
  updateServiceOrder(id: string, data: Partial<ServiceOrder>): Promise<ServiceOrder | undefined>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    const [user] = await db.update(users).set({ ...data, updatedAt: new Date() }).where(eq(users.id, id)).returning();
    return user || undefined;
  }

  async getDesigner(): Promise<User | undefined> {
    const [designer] = await db.select().from(users).where(eq(users.role, "designer"));
    return designer || undefined;
  }

  // Projects
  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project || undefined;
  }

  async getProjectsByClient(clientId: string): Promise<Project[]> {
    return db.select().from(projects).where(eq(projects.clientId, clientId)).orderBy(desc(projects.updatedAt));
  }

  async getAllProjects(): Promise<Project[]> {
    return db.select().from(projects).orderBy(desc(projects.updatedAt));
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const [project] = await db.insert(projects).values(insertProject).returning();
    return project;
  }

  async updateProject(id: string, data: Partial<Project>): Promise<Project | undefined> {
    const [project] = await db.update(projects).set({ ...data, updatedAt: new Date() }).where(eq(projects.id, id)).returning();
    return project || undefined;
  }

  async deleteProject(id: string): Promise<void> {
    // Cascade-delete child rows in FK-safe order before removing the project itself.
    await db.delete(messages).where(eq(messages.projectId, id));
    await db.delete(projectHats).where(eq(projectHats.projectId, id));
    await db.delete(workSessions).where(eq(workSessions.projectId, id));
    await db.delete(projectVersions).where(eq(projectVersions.projectId, id));
    await db.update(creditTransactions).set({ projectId: null }).where(eq(creditTransactions.projectId, id));
    await db.delete(projects).where(eq(projects.id, id));
  }

  async getProjectWithDetails(id: string): Promise<any> {
    const project = await this.getProject(id);
    if (!project) return undefined;

    const [client, hats, versions, sessions] = await Promise.all([
      this.getUser(project.clientId),
      this.getProjectHats(id),
      this.getProjectVersions(id),
      this.getWorkSessionsByProject(id),
    ]);

    const totalWorkTime = await this.getTotalWorkTimeForProject(id);
    const totalPrompts = sessions.reduce((sum, s) => sum + s.promptCount, 0);

    return {
      ...project,
      client,
      hats: hats.map(h => h.hatType),
      versions,
      totalWorkTime,
      totalPrompts,
    };
  }

  // Project Hats
  async addProjectHat(projectId: string, hatType: HatType): Promise<ProjectHat> {
    const [hat] = await db.insert(projectHats).values({ projectId, hatType }).returning();
    return hat;
  }

  async getProjectHats(projectId: string): Promise<ProjectHat[]> {
    return db.select().from(projectHats).where(eq(projectHats.projectId, projectId));
  }

  // Messages
  async getMessage(id: string): Promise<Message | undefined> {
    const [message] = await db.select().from(messages).where(eq(messages.id, id));
    return message || undefined;
  }

  async getMessagesByProject(projectId: string): Promise<Message[]> {
    return db.select().from(messages).where(eq(messages.projectId, projectId)).orderBy(messages.createdAt);
  }

  async getConversations(userId: string): Promise<any[]> {
    // Get all projects for a user (either as client or designer gets all)
    const user = await this.getUser(userId);
    if (!user) return [];

    let projectList: Project[];
    if (user.role === "designer") {
      projectList = await this.getAllProjects();
    } else {
      projectList = await this.getProjectsByClient(userId);
    }

    const conversations = await Promise.all(
      projectList.map(async (project) => {
        const projectMessages = await this.getMessagesByProject(project.id);
        const lastMessage = projectMessages[projectMessages.length - 1];
        const unreadCount = projectMessages.filter(m => !m.isRead && m.senderId !== userId).length;
        const client = await this.getUser(project.clientId);

        return {
          projectId: project.id,
          projectName: project.name,
          clientName: client?.name || "Unknown",
          lastMessage: lastMessage?.content || "No messages yet",
          lastMessageTime: lastMessage?.createdAt || project.createdAt,
          unreadCount,
        };
      })
    );

    return conversations.sort((a, b) => 
      new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
    );
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(insertMessage).returning();
    return message;
  }

  async markMessagesAsRead(projectId: string, userId: string): Promise<void> {
    await db.update(messages)
      .set({ isRead: true })
      .where(and(
        eq(messages.projectId, projectId),
        sql`${messages.senderId} != ${userId}`
      ));
  }

  // Work Sessions
  async getWorkSession(id: string): Promise<WorkSession | undefined> {
    const [session] = await db.select().from(workSessions).where(eq(workSessions.id, id));
    return session || undefined;
  }

  async getActiveWorkSession(): Promise<WorkSession | undefined> {
    const [session] = await db.select().from(workSessions).where(eq(workSessions.isActive, true));
    return session || undefined;
  }

  async getWorkSessionsByProject(projectId: string): Promise<WorkSession[]> {
    return db.select().from(workSessions).where(eq(workSessions.projectId, projectId)).orderBy(desc(workSessions.startTime));
  }

  async createWorkSession(insertSession: InsertWorkSession): Promise<WorkSession> {
    const [session] = await db.insert(workSessions).values(insertSession).returning();
    return session;
  }

  async updateWorkSession(id: string, data: Partial<WorkSession>): Promise<WorkSession | undefined> {
    const [session] = await db.update(workSessions).set(data).where(eq(workSessions.id, id)).returning();
    return session || undefined;
  }

  async getTotalWorkTimeForProject(projectId: string): Promise<number> {
    const sessions = await this.getWorkSessionsByProject(projectId);
    let total = 0;
    for (const session of sessions) {
      if (session.endTime) {
        total += new Date(session.endTime).getTime() - new Date(session.startTime).getTime();
      } else if (session.isActive) {
        total += Date.now() - new Date(session.startTime).getTime();
      }
    }
    return Math.floor(total / 1000 / 60); // Return minutes
  }

  // Project Versions
  async getProjectVersions(projectId: string): Promise<ProjectVersion[]> {
    return db.select().from(projectVersions).where(eq(projectVersions.projectId, projectId)).orderBy(desc(projectVersions.versionNumber));
  }

  async createProjectVersion(insertVersion: InsertProjectVersion): Promise<ProjectVersion> {
    const [version] = await db.insert(projectVersions).values(insertVersion).returning();
    return version;
  }

  // Credit Packages
  async getCreditPackages(): Promise<CreditPackage[]> {
    return db.select().from(creditPackages).orderBy(creditPackages.priceInCents);
  }

  async getCreditPackage(id: string): Promise<CreditPackage | undefined> {
    const [pkg] = await db.select().from(creditPackages).where(eq(creditPackages.id, id));
    return pkg || undefined;
  }

  async createCreditPackage(insertPkg: InsertCreditPackage): Promise<CreditPackage> {
    const [pkg] = await db.insert(creditPackages).values(insertPkg).returning();
    return pkg;
  }

  // Credit Transactions
  async getCreditTransactionsByUser(userId: string): Promise<CreditTransaction[]> {
    return db.select().from(creditTransactions).where(eq(creditTransactions.userId, userId)).orderBy(desc(creditTransactions.createdAt));
  }

  async createCreditTransaction(insertTransaction: InsertCreditTransaction): Promise<CreditTransaction> {
    const [transaction] = await db.insert(creditTransactions).values(insertTransaction).returning();
    return transaction;
  }

  async addCreditsToUser(userId: string, amount: number, description: string, projectId?: string): Promise<void> {
    await db.update(users).set({
      credits: sql`${users.credits} + ${amount}`,
      updatedAt: new Date(),
    }).where(eq(users.id, userId));

    await this.createCreditTransaction({
      userId,
      projectId: projectId || null,
      amount,
      type: "purchase",
      description,
    });
  }

  async useCredits(userId: string, amount: number, description: string): Promise<boolean> {
    const user = await this.getUser(userId);
    if (!user || user.credits < amount) return false;

    await db.update(users).set({
      credits: sql`${users.credits} - ${amount}`,
      updatedAt: new Date(),
    }).where(eq(users.id, userId));

    await this.createCreditTransaction({
      userId,
      amount: -amount,
      type: "usage",
      description,
    });

    return true;
  }

  // Clients
  async getClientUsers(): Promise<User[]> {
    return db.select().from(users).where(eq(users.role, "client"));
  }

  // Contact Submissions
  async createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission> {
    const [contactSubmission] = await db.insert(contactSubmissions).values(submission).returning();
    return contactSubmission;
  }

  async getContactSubmissions(): Promise<ContactSubmission[]> {
    return await db.select().from(contactSubmissions).orderBy(sql`created_at DESC`);
  }

  // Journal Leads
  async createJournalLead(lead: InsertJournalLead): Promise<{ lead: JournalLead; created: boolean }> {
    // Upsert on (slug, email) — a duplicate submission returns the existing
    // row without inserting again, so the studio doesn't get a second
    // notification email for the same visitor on the same article.
    const inserted = await db
      .insert(journalLeads)
      .values(lead)
      .onConflictDoNothing({ target: [journalLeads.slug, journalLeads.email] })
      .returning();
    if (inserted.length > 0) {
      return { lead: inserted[0], created: true };
    }
    const [existing] = await db
      .select()
      .from(journalLeads)
      .where(and(eq(journalLeads.slug, lead.slug), eq(journalLeads.email, lead.email)));
    if (!existing) {
      // Should not happen — onConflictDoNothing returned no row but the
      // existing row also can't be located. Surface a clear error so the
      // route returns 500 instead of silently sending malformed data.
      throw new Error(
        `journal lead upsert produced no row for slug=${lead.slug}`,
      );
    }
    return { lead: existing, created: false };
  }

  async getJournalLeads(limit: number = 200): Promise<JournalLead[]> {
    return await db.select().from(journalLeads).orderBy(desc(journalLeads.createdAt)).limit(limit);
  }

  // Visitor Analytics
  async createSectionView(view: InsertSectionView): Promise<SectionView> {
    const [row] = await db.insert(sectionViews).values(view).returning();
    return row;
  }

  async createVisitorEvent(event: InsertVisitorEvent): Promise<VisitorEvent> {
    const [row] = await db.insert(visitorEvents).values(event).returning();
    return row;
  }

  async getSectionViews(limit: number = 200): Promise<SectionView[]> {
    return await db.select().from(sectionViews).orderBy(desc(sectionViews.createdAt)).limit(limit);
  }

  async getVisitorEvents(limit: number = 200): Promise<VisitorEvent[]> {
    return await db.select().from(visitorEvents).orderBy(desc(visitorEvents.createdAt)).limit(limit);
  }

  async getJournalConversionStats(from?: Date, to?: Date): Promise<JournalConversionRow[]> {
    const conditions = [
      sql`${visitorEvents.eventType} IN ('journal_article_view','journal_cta_click','journal_signup_choose','journal_guest_email')`,
    ];
    if (from) conditions.push(sql`${visitorEvents.createdAt} >= ${from}`);
    if (to) conditions.push(sql`${visitorEvents.createdAt} <= ${to}`);

    const rows = await db
      .select({
        eventType: visitorEvents.eventType,
        eventData: visitorEvents.eventData,
      })
      .from(visitorEvents)
      .where(and(...conditions));

    const map = new Map<string, JournalConversionRow>();
    const get = (slug: string, title: string | null): JournalConversionRow => {
      let row = map.get(slug);
      if (!row) {
        row = {
          slug,
          title,
          views: 0,
          ctaClicks: 0,
          createAccountChoices: 0,
          openContactChoices: 0,
          guestEmails: 0,
        };
        map.set(slug, row);
      } else if (!row.title && title) {
        row.title = title;
      }
      return row;
    };

    for (const r of rows) {
      if (!r.eventData) continue;
      let parsed: unknown;
      try {
        parsed = JSON.parse(r.eventData);
      } catch {
        continue;
      }
      if (!parsed || typeof parsed !== "object") continue;
      const data = parsed as Record<string, unknown>;
      const slug = typeof data.slug === "string" ? data.slug : null;
      if (!slug) continue;
      const title = typeof data.title === "string" ? data.title : null;
      const choice = typeof data.choice === "string" ? data.choice : null;
      const row = get(slug, title);
      switch (r.eventType) {
        case "journal_article_view":
          row.views += 1;
          break;
        case "journal_cta_click":
          row.ctaClicks += 1;
          break;
        case "journal_signup_choose":
          if (choice === "create_account") row.createAccountChoices += 1;
          else if (choice === "open_contact") row.openContactChoices += 1;
          break;
        case "journal_guest_email":
          row.guestEmails += 1;
          break;
      }
    }

    return Array.from(map.values()).sort((a, b) => b.views - a.views || b.ctaClicks - a.ctaClicks);
  }

  async getJournalConversionTrends(from?: Date, to?: Date): Promise<JournalTrendRow[]> {
    const now = new Date();
    const endDate = to ?? now;
    const startDate = from ?? new Date(0);
    const diffDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);

    let bucketSize: "day" | "week" | "month";
    if (!from || diffDays > 90) {
      bucketSize = "month";
    } else if (diffDays <= 14) {
      bucketSize = "day";
    } else {
      bucketSize = "week";
    }

    const getBucketKey = (date: Date): string => {
      if (bucketSize === "day") {
        return date.toISOString().slice(0, 10);
      } else if (bucketSize === "week") {
        const d = new Date(date);
        const day = d.getDay();
        d.setDate(d.getDate() - day);
        return d.toISOString().slice(0, 10);
      } else {
        return date.toISOString().slice(0, 7);
      }
    };

    const conditions = [
      sql`${visitorEvents.eventType} IN ('journal_article_view','journal_cta_click','journal_signup_choose','journal_guest_email')`,
    ];
    if (from) conditions.push(sql`${visitorEvents.createdAt} >= ${from}`);
    if (to) conditions.push(sql`${visitorEvents.createdAt} <= ${to}`);

    const rows = await db
      .select({
        eventType: visitorEvents.eventType,
        eventData: visitorEvents.eventData,
        createdAt: visitorEvents.createdAt,
      })
      .from(visitorEvents)
      .where(and(...conditions))
      .orderBy(visitorEvents.createdAt);

    const slugMap = new Map<string, { title: string | null; buckets: Map<string, TrendBucket> }>();

    for (const r of rows) {
      if (!r.eventData || !r.createdAt) continue;
      let parsed: unknown;
      try { parsed = JSON.parse(r.eventData); } catch { continue; }
      if (!parsed || typeof parsed !== "object") continue;
      const data = parsed as Record<string, unknown>;
      const slug = typeof data.slug === "string" ? data.slug : null;
      if (!slug) continue;
      const title = typeof data.title === "string" ? data.title : null;

      if (!slugMap.has(slug)) {
        slugMap.set(slug, { title, buckets: new Map() });
      }
      const slugEntry = slugMap.get(slug)!;
      if (!slugEntry.title && title) slugEntry.title = title;

      const bucketKey = getBucketKey(new Date(r.createdAt));
      if (!slugEntry.buckets.has(bucketKey)) {
        slugEntry.buckets.set(bucketKey, {
          label: bucketKey,
          views: 0,
          ctaClicks: 0,
          createAccountChoices: 0,
          openContactChoices: 0,
          guestEmails: 0,
        });
      }
      const bucket = slugEntry.buckets.get(bucketKey)!;
      const choice = typeof data.choice === "string" ? data.choice : null;
      switch (r.eventType) {
        case "journal_article_view":
          bucket.views++;
          break;
        case "journal_cta_click":
          bucket.ctaClicks++;
          break;
        case "journal_signup_choose":
          if (choice === "create_account") bucket.createAccountChoices++;
          else if (choice === "open_contact") bucket.openContactChoices++;
          break;
        case "journal_guest_email":
          bucket.guestEmails++;
          break;
      }
    }

    const result: JournalTrendRow[] = [];
    for (const [slug, entry] of slugMap) {
      const sortedBuckets = Array.from(entry.buckets.values()).sort((a, b) =>
        a.label.localeCompare(b.label),
      );
      result.push({ slug, title: entry.title, bucketSize, buckets: sortedBuckets });
    }

    result.sort((a, b) => {
      const aViews = a.buckets.reduce((s, bkt) => s + bkt.views, 0);
      const bViews = b.buckets.reduce((s, bkt) => s + bkt.views, 0);
      return bViews - aViews;
    });

    return result;
  }

  // AI assistant / crawler traffic
  async recordAiCrawlerHit(hit: InsertAiCrawlerHit): Promise<AiCrawlerHit> {
    const [row] = await db.insert(aiCrawlerHits).values(hit).returning();
    return row;
  }

  async getAiCrawlerStats(from?: Date, to?: Date): Promise<AiCrawlerStatRow[]> {
    const conditions = [] as ReturnType<typeof sql>[];
    if (from) conditions.push(sql`${aiCrawlerHits.createdAt} >= ${from}`);
    if (to) conditions.push(sql`${aiCrawlerHits.createdAt} <= ${to}`);

    const rows = await db
      .select({
        botName: aiCrawlerHits.botName,
        pagePath: aiCrawlerHits.pagePath,
        createdAt: aiCrawlerHits.createdAt,
        verification: aiCrawlerHits.verification,
      })
      .from(aiCrawlerHits)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const byBot = new Map<
      string,
      {
        verifiedHits: number;
        unverifiableHits: number;
        spoofedHits: number;
        pages: Map<string, number>;
        lastSeenAt: Date | null;
      }
    >();
    for (const r of rows) {
      let entry = byBot.get(r.botName);
      if (!entry) {
        entry = {
          verifiedHits: 0,
          unverifiableHits: 0,
          spoofedHits: 0,
          pages: new Map(),
          lastSeenAt: null,
        };
        byBot.set(r.botName, entry);
      }
      if (r.verification === "verified") entry.verifiedHits += 1;
      else if (r.verification === "spoofed") entry.spoofedHits += 1;
      else entry.unverifiableHits += 1;
      // Spoofed pages shouldn't count toward "pages crawled" either —
      // they're attempts, not real visits.
      if (r.verification !== "spoofed") {
        entry.pages.set(r.pagePath, (entry.pages.get(r.pagePath) ?? 0) + 1);
      }
      if (
        r.createdAt &&
        r.verification !== "spoofed" &&
        (!entry.lastSeenAt || new Date(r.createdAt) > entry.lastSeenAt)
      ) {
        entry.lastSeenAt = new Date(r.createdAt);
      }
    }

    const out: AiCrawlerStatRow[] = [];
    for (const [botName, entry] of byBot) {
      let topPagePath: string | null = null;
      let topCount = -1;
      for (const [path, count] of entry.pages) {
        if (count > topCount) {
          topCount = count;
          topPagePath = path;
        }
      }
      out.push({
        botName,
        hits: entry.verifiedHits + entry.unverifiableHits,
        verifiedHits: entry.verifiedHits,
        unverifiableHits: entry.unverifiableHits,
        spoofedHits: entry.spoofedHits,
        uniquePages: entry.pages.size,
        lastSeenAt: entry.lastSeenAt,
        topPagePath,
      });
    }
    out.sort((a, b) => b.hits - a.hits);
    return out;
  }

  async getRecentAiCrawlerHits(
    limit: number = 200,
    from?: Date,
    to?: Date,
  ): Promise<AiCrawlerHit[]> {
    const conditions = [] as ReturnType<typeof sql>[];
    if (from) conditions.push(sql`${aiCrawlerHits.createdAt} >= ${from}`);
    if (to) conditions.push(sql`${aiCrawlerHits.createdAt} <= ${to}`);
    const query = db.select().from(aiCrawlerHits);
    const filtered = conditions.length > 0 ? query.where(and(...conditions)) : query;
    return await filtered.orderBy(desc(aiCrawlerHits.createdAt)).limit(limit);
  }

  // Toolkit reveals
  async recordToolkitReveal(reveal: InsertToolkitReveal): Promise<ToolkitReveal> {
    const [row] = await db.insert(toolkitReveals).values(reveal).returning();
    return row;
  }

  async getToolkitRevealStats(
    from?: Date,
    to?: Date,
  ): Promise<{ toolName: string; toolGroup: string | null; reveals: number; lastSeen: Date }[]> {
    const conditions = [] as ReturnType<typeof sql>[];
    if (from) conditions.push(sql`${toolkitReveals.createdAt} >= ${from}`);
    if (to) conditions.push(sql`${toolkitReveals.createdAt} <= ${to}`);
    const rows = await db
      .select({
        toolName: toolkitReveals.toolName,
        toolGroup: toolkitReveals.toolGroup,
        reveals: sql<number>`count(*)::int`,
        lastSeen: sql<Date>`max(${toolkitReveals.createdAt})`,
      })
      .from(toolkitReveals)
      .where(conditions.length > 0 ? and(...conditions) : sql`true`)
      .groupBy(toolkitReveals.toolName, toolkitReveals.toolGroup)
      .orderBy(desc(sql`count(*)`));
    return rows.map((r) => ({
      toolName: r.toolName,
      toolGroup: r.toolGroup,
      reveals: Number(r.reveals),
      lastSeen: r.lastSeen,
    }));
  }

  // Marketing Services
  async getMarketingServices(): Promise<MarketingService[]> {
    return db.select().from(marketingServices).where(eq(marketingServices.isActive, true));
  }

  async getMarketingService(id: string): Promise<MarketingService | undefined> {
    const [service] = await db.select().from(marketingServices).where(eq(marketingServices.id, id));
    return service || undefined;
  }

  async createMarketingService(insertService: InsertMarketingService): Promise<MarketingService> {
    const [service] = await db.insert(marketingServices).values(insertService).returning();
    return service;
  }

  // Service Orders
  async getServiceOrdersByClient(clientId: string): Promise<any[]> {
    const orders = await db.select().from(serviceOrders).where(eq(serviceOrders.clientId, clientId)).orderBy(desc(serviceOrders.createdAt));
    const results = await Promise.all(
      orders.map(async (order) => {
        const service = await this.getMarketingService(order.serviceId);
        return { ...order, service };
      })
    );
    return results;
  }

  async getServiceOrder(id: string): Promise<ServiceOrder | undefined> {
    const [order] = await db.select().from(serviceOrders).where(eq(serviceOrders.id, id));
    return order || undefined;
  }

  async createServiceOrder(insertOrder: InsertServiceOrder): Promise<ServiceOrder> {
    const [order] = await db.insert(serviceOrders).values(insertOrder).returning();
    return order;
  }

  async updateServiceOrder(id: string, data: Partial<ServiceOrder>): Promise<ServiceOrder | undefined> {
    const [order] = await db.update(serviceOrders).set({ ...data, updatedAt: new Date() }).where(eq(serviceOrders.id, id)).returning();
    return order || undefined;
  }

  async getJournalReportSchedule(): Promise<JournalReportSchedule | undefined> {
    const [row] = await db.select().from(journalReportSchedules).limit(1);
    return row || undefined;
  }

  async upsertJournalReportSchedule(data: { frequency: string; recipientEmail: string; enabled: boolean }): Promise<JournalReportSchedule> {
    const existing = await this.getJournalReportSchedule();
    if (existing) {
      const [row] = await db
        .update(journalReportSchedules)
        .set({ frequency: data.frequency, recipientEmail: data.recipientEmail, enabled: data.enabled, updatedAt: new Date() })
        .where(eq(journalReportSchedules.id, existing.id))
        .returning();
      return row;
    } else {
      const [row] = await db.insert(journalReportSchedules).values(data).returning();
      return row;
    }
  }

  async markJournalReportSent(id: string): Promise<void> {
    await db.update(journalReportSchedules).set({ lastSentAt: new Date(), updatedAt: new Date() }).where(eq(journalReportSchedules.id, id));
  }
}

export const storage = new DatabaseStorage();
