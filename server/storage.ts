import {
  contactSubmissions,
  sectionViews, visitorEvents, journalLeads,
  journalReportSchedules, aiCrawlerHits, toolkitReveals,
  type ContactSubmission, type InsertContactSubmission,
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
import { eq, desc, and, sql, inArray } from "drizzle-orm";

export interface IStorage {
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
  getSectionViewFunnel(from?: Date, to?: Date): Promise<{
    totalVisitors: number;
    heroVisitors: number;
    sections: {
      sectionName: string;
      uniqueVisitors: number;
      heroToSectionVisitors: number;
      reachedFromHeroPct: number | null;
      lastSeen: Date;
    }[];
  }>;

  // AI assistant traffic
  recordAiCrawlerHit(hit: InsertAiCrawlerHit): Promise<AiCrawlerHit>;
  getAiCrawlerStats(from?: Date, to?: Date): Promise<AiCrawlerStatRow[]>;
  getRecentAiCrawlerHits(limit?: number): Promise<AiCrawlerHit[]>;

  // Toolkit reveals
  recordToolkitReveal(reveal: InsertToolkitReveal): Promise<ToolkitReveal>;
  getToolkitRevealStats(from?: Date, to?: Date): Promise<{ toolName: string; toolGroup: string | null; reveals: number; lastSeen: Date }[]>;

  // Journal report schedule
  getJournalReportSchedule(): Promise<JournalReportSchedule | undefined>;
  upsertJournalReportSchedule(data: { frequency: string; recipientEmail: string; enabled: boolean }): Promise<JournalReportSchedule>;
  markJournalReportSent(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
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

  async getSectionViewFunnel(from?: Date, to?: Date): Promise<{
    totalVisitors: number;
    heroVisitors: number;
    sections: {
      sectionName: string;
      uniqueVisitors: number;
      heroToSectionVisitors: number;
      reachedFromHeroPct: number | null;
      lastSeen: Date;
    }[];
  }> {
    const conditions = [] as ReturnType<typeof sql>[];
    if (from) conditions.push(sql`${sectionViews.createdAt} >= ${from}`);
    if (to) conditions.push(sql`${sectionViews.createdAt} <= ${to}`);
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const rows = await db
      .select({
        sectionName: sectionViews.sectionName,
        uniqueVisitors: sql<number>`count(distinct ${sectionViews.visitorId})`.as("uv"),
        lastSeen: sql<Date>`max(${sectionViews.createdAt})`,
      })
      .from(sectionViews)
      .where(whereClause)
      .groupBy(sectionViews.sectionName);

    const totalVisitorsRow = await db
      .select({ uv: sql<number>`count(distinct ${sectionViews.visitorId})` })
      .from(sectionViews)
      .where(whereClause);
    const totalVisitors = Number(totalVisitorsRow[0]?.uv ?? 0);

    const heroVisitorRows = await db
      .selectDistinct({ visitorId: sectionViews.visitorId })
      .from(sectionViews)
      .where(
        whereClause
          ? and(whereClause, sql`${sectionViews.sectionName} = 'hero'`)
          : sql`${sectionViews.sectionName} = 'hero'`,
      );
    const heroVisitorIds = heroVisitorRows.map((r) => r.visitorId);
    const heroVisitors = heroVisitorIds.length;

    let heroToSectionMap = new Map<string, number>();
    if (heroVisitors > 0) {
      const intersectRows = await db
        .select({
          sectionName: sectionViews.sectionName,
          c: sql<number>`count(distinct ${sectionViews.visitorId})`,
        })
        .from(sectionViews)
        .where(
          whereClause
            ? and(
                whereClause,
                inArray(sectionViews.visitorId, heroVisitorIds),
              )
            : inArray(sectionViews.visitorId, heroVisitorIds),
        )
        .groupBy(sectionViews.sectionName);
      heroToSectionMap = new Map(
        intersectRows.map((r) => [r.sectionName, Number(r.c)]),
      );
    }

    const sections = rows
      .map((r) => {
        const uv = Number(r.uniqueVisitors);
        const intersection = heroToSectionMap.get(r.sectionName) ?? 0;
        return {
          sectionName: r.sectionName,
          uniqueVisitors: uv,
          heroToSectionVisitors: intersection,
          reachedFromHeroPct:
            heroVisitors > 0
              ? Math.round((intersection / heroVisitors) * 1000) / 10
              : null,
          lastSeen: r.lastSeen,
        };
      })
      .sort((a, b) => b.uniqueVisitors - a.uniqueVisitors);

    return { totalVisitors, heroVisitors, sections };
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

  // Journal report schedule
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
