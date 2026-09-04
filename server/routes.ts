import type { Express, Request } from "express";
import { createServer, type Server } from "node:http";
import { storage } from "./storage";
import { z } from "zod";
import crypto from "crypto";
import { getUncachableResendClient } from "./resend";
import { activeVisitorNotification, socialClickNotification, journalLeadNotification } from "./email-templates";
import { lookupCityFromIp } from "./geo";
import { sendJournalStatsReport } from "./journal-report-sender";
import {
  refreshAiBotIpRanges,
  getAiBotVerifierStatus,
} from "./ai-bot-verifier";
import {
  renderArticleHtml,
  renderIndexHtml,
  renderResourcesHtml,
  renderLlmsFullTxt,
  renderLlmsTxt,
  renderRobotsTxt,
  renderSitemapXml,
  CANONICAL_ORIGIN,
} from "./journal/render";
import { getPost, allPostsNewestFirst } from "./journal/posts";
import { isSupportedLocale, DEFAULT_LOCALE } from "./i18n/locales";
import { TRANSLATED_MVP_SLUG } from "./journal/editorial";

// Admin auth — compares the x-session-token header against SESSION_SECRET
// using a constant-time comparison to prevent timing attacks.
function requireAdminToken(req: Request): boolean {
  const token = (req.header("x-session-token") || "").trim();
  const secret = (process.env.SESSION_SECRET || "").trim();
  if (!secret || token.length < 16 || token.length !== secret.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(secret));
  } catch {
    return false;
  }
}

const activeVisitorNotificationKeys = new Map<string, number>();
const activeVisitorIpHits = new Map<string, number[]>();
const ACTIVE_VISITOR_KEY_TTL_MS = 10 * 60 * 1000;
const ACTIVE_VISITOR_RATE_WINDOW_MS = 10 * 60 * 1000;
const ACTIVE_VISITOR_RATE_LIMIT = 5;
const VISITOR_GEO_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const activeVisitorPayloadSchema = z.object({
  visitorId: z.string().trim().min(1).max(120),
  sessionId: z.string().trim().min(1).max(120).optional(),
  idempotencyKey: z.string().trim().min(1).max(300).optional(),
  pagePath: z.string().trim().max(500).optional(),
  scrollPercent: z.number().min(0).max(100).optional(),
  trigger: z.enum(["scroll", "pointer", "touch", "dwell"]).optional(),
  userAgent: z.string().max(500).optional(),
  referrer: z.string().max(500).optional(),
  userId: z.string().max(120).nullable().optional(),
}).strict();

function requestIp(req: Request): string {
  return (
    (req.header("x-forwarded-for") || "").split(",")[0]?.trim() ||
    req.ip ||
    req.socket.remoteAddress ||
    "unknown"
  ).slice(0, 120);
}

function allowActiveVisitorRequest(ip: string): boolean {
  const now = Date.now();
  const recent = (activeVisitorIpHits.get(ip) || []).filter(
    (timestamp) => now - timestamp < ACTIVE_VISITOR_RATE_WINDOW_MS,
  );
  if (recent.length >= ACTIVE_VISITOR_RATE_LIMIT) {
    activeVisitorIpHits.set(ip, recent);
    return false;
  }
  recent.push(now);
  activeVisitorIpHits.set(ip, recent);
  return true;
}

function claimActiveVisitorNotification(key: string): boolean {
  const now = Date.now();
  for (const [storedKey, expiresAt] of activeVisitorNotificationKeys) {
    if (expiresAt <= now) activeVisitorNotificationKeys.delete(storedKey);
  }
  const expiresAt = activeVisitorNotificationKeys.get(key);
  if (expiresAt && expiresAt > now) return false;
  activeVisitorNotificationKeys.set(key, now + ACTIVE_VISITOR_KEY_TTL_MS);
  return true;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // ─── Canonical-domain redirect ─────────────────────────────────────────
  const canonicalHost = new URL(CANONICAL_ORIGIN).host;
  app.use((req, res, next) => {
    const reqHost =
      req.header("x-forwarded-host") || req.get("host") || "";
    const isLocalhost =
      reqHost.startsWith("localhost") || reqHost.startsWith("127.0.0.1");
    const previewHosts = [
      process.env.REPLIT_DEV_DOMAIN,
      ...(process.env.REPLIT_DOMAINS || "").split(","),
    ]
      .filter((host): host is string => typeof host === "string" && Boolean(host.trim()))
      .map((host) => host.trim().toLowerCase());
    const isReplitPreview =
      previewHosts.includes(reqHost.toLowerCase()) ||
      reqHost.toLowerCase().endsWith(".replit.dev");
    const isApi = req.path.startsWith("/api/");
    if (
      !isLocalhost &&
      !isReplitPreview &&
      !isApi &&
      reqHost &&
      reqHost !== canonicalHost
    ) {
      return res.redirect(301, `${CANONICAL_ORIGIN}${req.originalUrl}`);
    }
    next();
  });

  // ─── Journal (SEO content) ──────────────────────────────────────────────
  app.get("/journal", (_req, res) => {
    res.setHeader("content-type", "text/html; charset=utf-8");
    res.send(renderIndexHtml(CANONICAL_ORIGIN));
  });

  app.get("/resources", (_req, res) => {
    res.setHeader("content-type", "text/html; charset=utf-8");
    res.send(renderResourcesHtml(CANONICAL_ORIGIN));
  });

  // Editorial locales are explicit and never depend on a landing-page cookie.
  app.get("/:locale/resources", (req, res, next) => {
    const locale = req.params.locale;
    if (!isSupportedLocale(locale)) return next();
    if (locale === DEFAULT_LOCALE) return res.redirect(301, "/resources");
    res.setHeader("content-type", "text/html; charset=utf-8");
    return res.send(renderResourcesHtml(CANONICAL_ORIGIN, locale));
  });

  app.get("/:locale/journal", (req, res, next) => {
    const locale = req.params.locale;
    if (!isSupportedLocale(locale)) return next();
    if (locale === DEFAULT_LOCALE) return res.redirect(301, "/journal");
    res.setHeader("content-type", "text/html; charset=utf-8");
    return res.send(renderIndexHtml(CANONICAL_ORIGIN, locale));
  });

  app.get("/journal/:slug", (req, res) => {
    const post = getPost(req.params.slug);
    if (!post) {
      res.status(404).setHeader("content-type", "text/html; charset=utf-8");
      return res.send(
        `<!doctype html><meta charset="utf-8"><title>Not found</title><p>No article at that URL. <a href="/journal">Back to the Journal</a>.</p>`,
      );
    }
    res.setHeader("content-type", "text/html; charset=utf-8");
    res.send(renderArticleHtml(post, CANONICAL_ORIGIN));
  });

  app.get("/:locale/journal/:slug", (req, res, next) => {
    const locale = req.params.locale;
    if (!isSupportedLocale(locale)) return next();
    const post = getPost(req.params.slug);
    if (!post) return next();
    if (locale === DEFAULT_LOCALE || post.slug !== TRANSLATED_MVP_SLUG) {
      return res.redirect(301, `/journal/${post.slug}`);
    }
    res.setHeader("content-type", "text/html; charset=utf-8");
    return res.send(renderArticleHtml(post, CANONICAL_ORIGIN, locale));
  });

  app.get("/sitemap.xml", (_req, res) => {
    res.setHeader("content-type", "application/xml; charset=utf-8");
    res.send(renderSitemapXml(CANONICAL_ORIGIN));
  });

  app.get("/robots.txt", (_req, res) => {
    res.setHeader("content-type", "text/plain; charset=utf-8");
    res.send(renderRobotsTxt(CANONICAL_ORIGIN));
  });

  app.get("/llms.txt", (_req, res) => {
    res.setHeader("content-type", "text/plain; charset=utf-8");
    res.setHeader("cache-control", "public, max-age=300, must-revalidate");
    res.setHeader("last-modified", "Thu, 27 Aug 2026 00:00:00 GMT");
    res.send(renderLlmsTxt(CANONICAL_ORIGIN));
  });

  app.get("/llms-full.txt", (_req, res) => {
    res.setHeader("content-type", "text/plain; charset=utf-8");
    res.setHeader("cache-control", "public, max-age=300, must-revalidate");
    res.setHeader("last-modified", "Thu, 27 Aug 2026 00:00:00 GMT");
    res.send(renderLlmsFullTxt(CANONICAL_ORIGIN));
  });

  // ─── Journal JSON API (read-only, used by landing page preview) ────────
  app.get("/api/journal/posts", (_req, res) => {
    const posts = allPostsNewestFirst().map((p) => ({
      slug: p.slug,
      title: p.title,
      description: p.description,
      excerpt: p.excerpt,
      publishedAt: p.publishedAt,
      updatedAt: p.updatedAt ?? null,
      readMinutes: p.readMinutes,
      category: p.category,
      tags: p.tags,
    }));
    res.setHeader("cache-control", "public, max-age=300");
    res.json(posts);
  });

  app.get("/api/journal/posts/:slug", (req, res) => {
    const post = getPost(req.params.slug);
    if (!post) return res.status(404).json({ error: "not found" });
    res.setHeader("cache-control", "public, max-age=300");
    res.json(post);
  });

  // ─── Journal leads ──────────────────────────────────────────────────────
  app.post("/api/journal/leads", async (req, res) => {
    try {
      const { slug, title, email, source } = req.body || {};
      const cleanEmail = typeof email === "string" ? email.trim() : "";
      const cleanSlug = typeof slug === "string" ? slug.trim() : "";
      if (!cleanSlug) {
        return res.status(400).json({ error: "slug is required" });
      }
      if (!cleanEmail || !/\S+@\S+\.\S+/.test(cleanEmail)) {
        return res.status(400).json({ error: "valid email is required" });
      }

      const post = getPost(cleanSlug);
      const finalTitle =
        (typeof title === "string" && title.trim()) ||
        (post ? post.title : null);

      const { lead, created } = await storage.createJournalLead({
        slug: cleanSlug.slice(0, 200),
        title: finalTitle ? String(finalTitle).slice(0, 500) : null,
        email: cleanEmail.slice(0, 320),
        source: typeof source === "string" && source ? source.slice(0, 80) : "journal_signup",
      });

      if (created) {
        try {
          const { client, fromEmail } = await getUncachableResendClient();
          const { subject, html } = journalLeadNotification({
            email: lead.email,
            slug: lead.slug,
            title: lead.title || undefined,
            source: lead.source,
          });
          await client.emails.send({
            from: fromEmail,
            to: "elgunit@gmail.com",
            subject,
            html,
          });
        } catch (emailError: unknown) {
          const message =
            emailError instanceof Error ? emailError.message : String(emailError);
          console.error("journal-lead email failed:", message);
        }
      }

      res.json({ ok: true, lead, duplicate: !created });
    } catch (error) {
      console.error("journal-lead error:", error);
      res.status(500).json({ error: "Failed to save lead" });
    }
  });

  // Admin read of captured Journal leads (admin-only).
  app.get("/api/admin/journal-leads", async (req, res) => {
    try {
      if (!requireAdminToken(req)) {
        return res.status(403).json({ error: "Forbidden" });
      }
      const wantsCsv = String(req.query.format ?? "").toLowerCase() === "csv";
      const limit = Math.min(
        wantsCsv ? 10000 : 1000,
        parseInt(String(req.query.limit ?? (wantsCsv ? "10000" : "200")), 10) ||
          (wantsCsv ? 10000 : 200),
      );
      const leads = await storage.getJournalLeads(limit);
      if (!wantsCsv) {
        return res.json(leads);
      }
      const escape = (val: unknown) => {
        let s = val === null || val === undefined ? "" : String(val);
        if (s.length > 0 && /^[=+\-@\t\r]/.test(s)) {
          s = `'${s}`;
        }
        return `"${s.replace(/"/g, '""')}"`;
      };
      const header = ["slug", "title", "email", "source", "createdAt"];
      const lines = [header.join(",")];
      for (const lead of leads) {
        lines.push(
          [
            escape(lead.slug),
            escape(lead.title ?? ""),
            escape(lead.email),
            escape(lead.source),
            escape(
              lead.createdAt instanceof Date
                ? lead.createdAt.toISOString()
                : lead.createdAt,
            ),
          ].join(","),
        );
      }
      const csv = lines.join("\r\n") + "\r\n";
      const stamp = new Date().toISOString().slice(0, 10);
      res.setHeader("content-type", "text/csv; charset=utf-8");
      res.setHeader(
        "content-disposition",
        `attachment; filename="journal-leads-${stamp}.csv"`,
      );
      return res.send(csv);
    } catch (error) {
      console.error("journal-leads list error:", error);
      res.status(500).json({ error: "Failed to fetch journal leads" });
    }
  });

  // ─── Contact form ───────────────────────────────────────────────────────
  app.get("/api/contact-submissions", async (req, res) => {
    try {
      if (!requireAdminToken(req)) {
        return res.status(403).json({ error: "Forbidden" });
      }
      const submissions = await storage.getContactSubmissions();
      res.json(submissions);
    } catch (error) {
      console.error("Failed to get contact submissions:", error);
      res.status(500).json({ error: "Failed to get contact submissions" });
    }
  });

  app.post("/api/contact", async (req, res) => {
    try {
      const {
        fullName, email, company, budget, interests, timeline, message,
        businessStage, digitalPresence, desiredOutcome,
        attributionSource, attributionCampaign, attributionPage, attributionSection,
      } = req.body;

      if (!fullName || !email || !message) {
        return res.status(400).json({ error: "Name, email, and message are required" });
      }

      const allowed = (value: unknown, max = 120) =>
        typeof value === "string" && value.trim() ? value.trim().slice(0, max) : null;
      const allowedInterests = Array.isArray(interests)
        ? interests.filter((value): value is string => typeof value === "string").map((value) => value.slice(0, 80)).slice(0, 20)
        : [];
      await storage.createContactSubmission({
        fullName: String(fullName).trim().slice(0, 200),
        email: String(email).trim().slice(0, 320),
        company: allowed(company, 200),
        budget: allowed(budget),
        interests: allowedInterests,
        timeline: allowed(timeline, 40),
        businessStage: allowed(businessStage, 80),
        digitalPresence: allowed(digitalPresence, 120),
        desiredOutcome: allowed(desiredOutcome, 120),
        attributionSource: allowed(attributionSource, 120),
        attributionCampaign: allowed(attributionCampaign, 160),
        attributionPage: allowed(attributionPage, 500),
        attributionSection: allowed(attributionSection, 120),
        message: String(message).trim().slice(0, 10000),
      });

      console.log("Contact form submission received:", {
        budget: allowed(budget),
        interestCount: allowedInterests.length,
        businessStage: allowed(businessStage, 80),
        desiredOutcome: allowed(desiredOutcome, 120),
      });

      try {
        const { client, fromEmail } = await getUncachableResendClient();

        // Escape user-controlled values before HTML interpolation.
        const esc = (s: unknown) =>
          String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

        // Allowlist timeline — reject unknown values so arbitrary markup cannot be injected.
        const timelineLabels: Record<string, string> = {
          asap: 'ASAP',
          '4weeks': 'Within 4 weeks',
          '1-3months': '1–3 months',
          '3-6months': '3–6 months',
          exploring: 'Just exploring',
        };
        const timelineLabel = timeline && Object.prototype.hasOwnProperty.call(timelineLabels, timeline)
          ? timelineLabels[timeline as string]
          : 'Not specified';

        const interestsList = allowedInterests.length > 0
          ? allowedInterests.map(esc).join(', ')
          : 'Not specified';

        const emailResult = await client.emails.send({
          from: fromEmail,
          to: 'elgunit@gmail.com',
          subject: `New Project Inquiry from ${esc(fullName)}`,
          html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${esc(fullName)}</p>
            <p><strong>Email:</strong> ${esc(email)}</p>
            <p><strong>Company:</strong> ${esc(allowed(company, 200)) || 'Not specified'}</p>
            <p><strong>Budget:</strong> ${esc(budget) || 'Not specified'}</p>
            <p><strong>Interested in:</strong> ${interestsList}</p>
            <p><strong>Launch timeline:</strong> ${timelineLabel}</p>
            <p><strong>Business stage:</strong> ${esc(allowed(businessStage, 80)) || 'Not specified'}</p>
            <p><strong>Current digital presence:</strong> ${esc(allowed(digitalPresence, 120)) || 'Not specified'}</p>
            <p><strong>Desired outcome:</strong> ${esc(allowed(desiredOutcome, 120)) || 'Not specified'}</p>
            <p><strong>Source:</strong> ${esc(allowed(attributionSource, 120)) || 'Not specified'}</p>
            <h3>Message:</h3>
            <p>${esc(message)}</p>
          `,
        });
        console.log("Email notification sent successfully:", JSON.stringify(emailResult));
      } catch (emailError: any) {
        console.error("Failed to send email notification:", emailError?.message || emailError);
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Contact form error:", error);
      res.status(500).json({ error: "Failed to submit contact form" });
    }
  });

  // ─── Visitor analytics ──────────────────────────────────────────────────
  app.post("/api/track/section-view", async (req, res) => {
    try {
      const { sectionName, visitorId, userAgent, referrer, durationMs, userId } = req.body || {};
      if (!sectionName || !visitorId) {
        return res.status(400).json({ error: "sectionName and visitorId required" });
      }
      await storage.createSectionView({
        sectionName: String(sectionName).slice(0, 120),
        visitorId: String(visitorId).slice(0, 120),
        userAgent: userAgent ? String(userAgent).slice(0, 500) : null,
        referrerUrl: referrer ? String(referrer).slice(0, 500) : null,
        pageLoadAt: new Date(),
        durationMs: typeof durationMs === "number" ? Math.round(durationMs) : null,
        userId: userId || null,
      } as any);
      res.json({ ok: true });
    } catch (error) {
      console.error("section-view error:", error);
      res.status(500).json({ error: "Failed to record section view" });
    }
  });

  app.post("/api/track/visitor-event", async (req, res) => {
    try {
      const { eventType, visitorId, pagePath, eventData, userId } = req.body || {};
      if (!eventType || !visitorId) {
        return res.status(400).json({ error: "eventType and visitorId required" });
      }
      const eventTypeValue = String(eventType).slice(0, 80);
      let safeEventData = eventData == null
        ? null
        : (typeof eventData === "string" ? eventData : JSON.stringify(eventData)).slice(0, 4000);
      // Landing analytics is intentionally allowlisted at the server boundary.
      // A public browser endpoint must not become a place to persist arbitrary
      // form text, email addresses, or other visitor-provided data.
      if (eventTypeValue.startsWith("landing_")) {
        let parsed: Record<string, unknown> = {};
        try {
          const candidate = typeof eventData === "string" ? JSON.parse(eventData) : eventData;
          if (candidate && typeof candidate === "object" && !Array.isArray(candidate)) {
            parsed = candidate as Record<string, unknown>;
          }
        } catch (_) {}
        const keep = (key: string, max = 120) =>
          typeof parsed[key] === "string" ? String(parsed[key]).trim().slice(0, max) : null;
        const interests = Array.isArray(parsed.interests)
          ? parsed.interests.filter((value): value is string => typeof value === "string").map((value) => value.slice(0, 80)).slice(0, 20)
          : undefined;
        safeEventData = JSON.stringify({
          source: keep("source"),
          medium: keep("medium"),
          campaign: keep("campaign", 160),
          content: keep("content", 160),
          referrer: keep("referrer"),
          cta: keep("cta"),
          section: keep("section"),
          businessStage: keep("businessStage"),
          digitalPresence: keep("digitalPresence"),
          desiredOutcome: keep("desiredOutcome"),
          interests,
        }).slice(0, 4000);
      }
      await storage.createVisitorEvent({
        eventType: eventTypeValue,
        visitorId: String(visitorId).slice(0, 120),
        pagePath: pagePath ? String(pagePath).slice(0, 500) : null,
        eventData: safeEventData,
        userId: userId || null,
      } as any);
      res.json({ ok: true });
    } catch (error) {
      console.error("visitor-event error:", error);
      res.status(500).json({ error: "Failed to record visitor event" });
    }
  });

  app.get("/api/admin/business-insights", async (req, res) => {
    try {
      if (!requireAdminToken(req)) return res.status(403).json({ error: "Forbidden" });
      const parseDate = (value: unknown): Date | undefined => {
        if (typeof value !== "string" || !value) return undefined;
        const parsed = new Date(value);
        return Number.isNaN(parsed.getTime()) ? undefined : parsed;
      };
      const from = parseDate(req.query.from);
      const to = parseDate(req.query.to);
      res.json(await storage.getBusinessInsights(from, to));
    } catch (error) {
      console.error("business insights error:", error);
      res.status(500).json({ error: "Failed to fetch business insights" });
    }
  });

  app.post("/api/track/active-visitor", async (req, res) => {
    let claimedKey: string | null = null;
    try {
      const parsed = activeVisitorPayloadSchema.safeParse(req.body || {});
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid active visitor payload" });
      }
      const { visitorId, sessionId, idempotencyKey, pagePath, scrollPercent, userAgent, referrer, userId } = parsed.data;

      const visitorIdStr = visitorId.slice(0, 120);
      const ipRaw = requestIp(req);
      if (!allowActiveVisitorRequest(ipRaw)) {
        return res.status(429).json({ error: "Too many active visitor notifications" });
      }
      const deliveryKey = (idempotencyKey || `active-visitor-${visitorIdStr}-${sessionId || pagePath || "/"}`).slice(0, 300);
      if (!claimActiveVisitorNotification(deliveryKey)) {
        return res.json({ ok: true, duplicate: true });
      }
      claimedKey = deliveryKey;
      const hasDurableIdempotencyKey = Boolean(idempotencyKey);
      if (hasDurableIdempotencyKey) {
        const claimedEmail = await storage.claimEmailSend(
          deliveryKey,
          "active_visitor",
          "elgunit@gmail.com",
        );
        if (!claimedEmail) {
          activeVisitorNotificationKeys.delete(deliveryKey);
          claimedKey = null;
          return res.json({ ok: true, duplicate: true });
        }
      }

      // Determine new vs. returning BEFORE inserting this event, so this
      // visit itself doesn't count as "prior activity".
      const isReturning = await storage
        .hasPriorVisitorActivity(visitorIdStr)
        .catch((err) => {
          console.error("hasPriorVisitorActivity check failed:", err?.message || err);
          return false;
        });

      await storage.createVisitorEvent({
        eventType: "active_visitor",
        visitorId: visitorIdStr,
        pagePath: pagePath ? String(pagePath).slice(0, 500) : null,
        eventData: JSON.stringify({ scrollPercent, userAgent, referrer }).slice(0, 4000),
        userId: userId || null,
      } as any);

      let notificationSent = false;
      try {
        const cachedGeo = await storage.getVisitorGeo(visitorIdStr);
        let geo: Awaited<ReturnType<typeof lookupCityFromIp>>;
        if (cachedGeo && Date.now() - cachedGeo.updatedAt.getTime() < VISITOR_GEO_CACHE_TTL_MS) {
          const parts = [cachedGeo.city, cachedGeo.region || cachedGeo.country].filter(Boolean);
          geo = {
            city: cachedGeo.city,
            region: cachedGeo.region,
            country: cachedGeo.country,
            isp: cachedGeo.isp,
            asn: cachedGeo.asn,
            isProxy: cachedGeo.isProxy,
            label: parts.length > 0 ? parts.join(", ") : "Unknown location",
          };
        } else {
          geo = await lookupCityFromIp(ipRaw);
          if (geo.city || geo.region || geo.country || geo.isp || geo.asn) {
            await storage.upsertVisitorGeo({
              visitorId: visitorIdStr,
              city: geo.city,
              region: geo.region,
              country: geo.country,
              isp: geo.isp,
              asn: geo.asn,
              isProxy: geo.isProxy,
            });
          }
        }

        const { client, fromEmail } = await getUncachableResendClient();
        const { subject, html } = activeVisitorNotification({
          visitorId: visitorIdStr,
          pagePath: pagePath ? String(pagePath) : "/",
          scrollPercent: typeof scrollPercent === "number" ? scrollPercent : 0,
          userAgent: userAgent ? String(userAgent) : undefined,
          referrer: referrer ? String(referrer) : undefined,
          city: geo.label,
          isReturning,
        });
        const sendResult: any = await client.emails.send({
          from: fromEmail,
          to: "elgunit@gmail.com",
          subject,
          html,
        });
        if (sendResult?.error) {
          throw new Error(`Resend rejected active visitor email: ${JSON.stringify(sendResult.error)}`);
        }
        notificationSent = true;
        console.log("active-visitor email sent ok. id=", sendResult?.data?.id, "from=", fromEmail);
      } catch (emailError: any) {
        console.error("active-visitor email threw:", emailError?.message || emailError);
      }
      if (!notificationSent) {
        if (hasDurableIdempotencyKey) {
          await storage.completeEmailSend(
            deliveryKey,
            "failed",
            "Resend rejected or threw while sending the notification",
          ).catch((logError) => {
            console.error("active-visitor failed-delivery log error:", logError);
          });
        }
        activeVisitorNotificationKeys.delete(deliveryKey);
        claimedKey = null;
        return res.status(502).json({ error: "Active visitor notification failed" });
      }
      if (hasDurableIdempotencyKey) {
        await storage.completeEmailSend(deliveryKey, "sent").catch((logError) => {
          // The email was already accepted; retain the in-flight DB row so
          // a retry cannot send a duplicate if the status update fails.
          console.error("active-visitor sent-delivery log error:", logError);
        });
      }
      res.json({ ok: true });
    } catch (error) {
      if (claimedKey) activeVisitorNotificationKeys.delete(claimedKey);
      console.error("active-visitor error:", error);
      res.status(500).json({ error: "Failed to record active visitor" });
    }
  });

  app.post("/api/track/social-click", async (req, res) => {
    try {
      const { visitorId, pagePath, platform, userAgent, referrer, userId } = req.body || {};
      if (!visitorId || !platform) {
        return res.status(400).json({ error: "visitorId and platform required" });
      }
      await storage.createVisitorEvent({
        eventType: "social_click",
        visitorId: String(visitorId).slice(0, 120),
        pagePath: pagePath ? String(pagePath).slice(0, 500) : null,
        eventData: JSON.stringify({ platform, userAgent, referrer }).slice(0, 4000),
        userId: userId || null,
      } as any);

      try {
        const { client, fromEmail } = await getUncachableResendClient();
        const { subject, html } = socialClickNotification({
          visitorId: String(visitorId),
          pagePath: pagePath ? String(pagePath) : "/",
          platform: String(platform),
          userAgent: userAgent ? String(userAgent) : undefined,
          referrer: referrer ? String(referrer) : undefined,
        });
        await client.emails.send({
          from: fromEmail,
          to: "elgunit@gmail.com",
          subject,
          html,
        });
      } catch (emailError: any) {
        console.error("social-click email failed:", emailError?.message || emailError);
      }
      res.json({ ok: true });
    } catch (error) {
      console.error("social-click error:", error);
      res.status(500).json({ error: "Failed to record social click" });
    }
  });

  // Admin reads — require SESSION_SECRET via x-session-token header.
  app.get("/api/admin/section-views", async (req, res) => {
    try {
      if (!requireAdminToken(req)) {
        return res.status(403).json({ error: "Forbidden" });
      }
      const limit = Math.min(1000, parseInt(String(req.query.limit ?? "200"), 10) || 200);
      res.json(await storage.getSectionViews(limit));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch section views" });
    }
  });

  app.get("/api/admin/visitor-events", async (req, res) => {
    try {
      if (!requireAdminToken(req)) {
        return res.status(403).json({ error: "Forbidden" });
      }
      const limit = Math.min(1000, parseInt(String(req.query.limit ?? "200"), 10) || 200);
      res.json(await storage.getVisitorEvents(limit));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch visitor events" });
    }
  });

  app.get("/api/admin/section-views/funnel", async (req, res) => {
    try {
      if (!requireAdminToken(req)) {
        return res.status(403).json({ error: "Forbidden" });
      }
      const parseDate = (v: unknown): Date | undefined => {
        if (typeof v !== "string" || !v) return undefined;
        const d = new Date(v);
        return isNaN(d.getTime()) ? undefined : d;
      };
      const from = parseDate(req.query.from);
      const to = parseDate(req.query.to);
      const funnel = await storage.getSectionViewFunnel(from, to);
      res.json({
        from: from?.toISOString() ?? null,
        to: to?.toISOString() ?? null,
        ...funnel,
      });
    } catch (error) {
      console.error("section-views funnel error:", error);
      res.status(500).json({ error: "Failed to fetch section-view funnel" });
    }
  });

  app.get("/api/admin/journal/conversion-stats", async (req, res) => {
    try {
      if (!requireAdminToken(req)) {
        return res.status(403).json({ error: "Forbidden" });
      }
      const parseDate = (v: unknown): Date | undefined => {
        if (typeof v !== "string" || !v) return undefined;
        const d = new Date(v);
        return isNaN(d.getTime()) ? undefined : d;
      };
      const from = parseDate(req.query.from);
      const to = parseDate(req.query.to);
      const stats = await storage.getJournalConversionStats(from, to);
      res.json({ from: from?.toISOString() ?? null, to: to?.toISOString() ?? null, stats });
    } catch (error) {
      console.error("journal conversion stats error:", error);
      res.status(500).json({ error: "Failed to fetch journal conversion stats" });
    }
  });

  app.get("/api/admin/journal/conversion-trends", async (req, res) => {
    try {
      if (!requireAdminToken(req)) {
        return res.status(403).json({ error: "Forbidden" });
      }
      const parseDate = (v: unknown): Date | undefined => {
        if (typeof v !== "string" || !v) return undefined;
        const d = new Date(v);
        return isNaN(d.getTime()) ? undefined : d;
      };
      const from = parseDate(req.query.from);
      const to = parseDate(req.query.to);
      const trends = await storage.getJournalConversionTrends(from, to);
      res.json({ from: from?.toISOString() ?? null, to: to?.toISOString() ?? null, trends });
    } catch (error) {
      console.error("journal conversion trends error:", error);
      res.status(500).json({ error: "Failed to fetch journal conversion trends" });
    }
  });

  // ─── Toolkit reveals ───────────────────────────────────────────────────
  app.post("/api/toolkit-reveal", async (req, res) => {
    try {
      const body = req.body || {};
      const toolName = typeof body.toolName === "string" ? body.toolName.trim().slice(0, 80) : "";
      if (!toolName) return res.status(400).json({ error: "toolName required" });
      const toolGroup = typeof body.toolGroup === "string" ? body.toolGroup.trim().slice(0, 80) : null;
      const source = typeof body.source === "string" ? body.source.trim().slice(0, 40) : null;
      const userAgent = (req.header("user-agent") || "").slice(0, 500) || null;
      const ipRaw =
        (req.header("x-forwarded-for") || "").split(",")[0]?.trim() ||
        req.socket.remoteAddress ||
        "";
      const { hashIp } = await import("./index");
      storage
        .recordToolkitReveal({
          toolName,
          toolGroup,
          source,
          userAgent,
          ipHash: hashIp(ipRaw),
        })
        .catch((err) => console.error("toolkit-reveal log failed:", err));
      res.status(204).end();
    } catch (err) {
      console.error("toolkit-reveal route error:", err);
      res.status(500).json({ error: "Failed to log reveal" });
    }
  });

  app.get("/api/admin/toolkit-reveals", async (req, res) => {
    try {
      if (!requireAdminToken(req)) return res.status(403).json({ error: "Forbidden" });
      const parseDate = (v: unknown): Date | undefined => {
        if (typeof v !== "string" || !v) return undefined;
        const d = new Date(v);
        return isNaN(d.getTime()) ? undefined : d;
      };
      const from = parseDate(req.query.from);
      const to = parseDate(req.query.to);
      const [stats, groupStats] = await Promise.all([
        storage.getToolkitRevealStats(from, to),
        storage.getToolkitGroupStats(from, to),
      ]);
      // `reveals` = unique visitor-tool pairs (is_duplicate=false); `rawReveals` = every click
      const totalReveals = stats.reduce((acc, r) => acc + r.reveals, 0);
      const totalRawReveals = stats.reduce((acc, r) => acc + r.rawReveals, 0);
      res.json({ totalReveals, totalRawReveals, groupStats, stats });
    } catch (err) {
      console.error("toolkit-reveals admin error:", err);
      res.status(500).json({ error: "Failed to fetch toolkit reveals" });
    }
  });

  // ─── AI assistant traffic ──────────────────────────────────────────────
  app.get("/api/admin/ai-traffic", async (req, res) => {
    try {
      if (!requireAdminToken(req)) return res.status(403).json({ error: "Forbidden" });

      const parseDate = (v: unknown): Date | undefined => {
        if (typeof v !== "string" || !v) return undefined;
        const d = new Date(v);
        return isNaN(d.getTime()) ? undefined : d;
      };
      const from = parseDate(req.query.from);
      const to = parseDate(req.query.to);
      const limit = Math.min(
        500,
        parseInt(String(req.query.limit ?? "100"), 10) || 100,
      );

      const [stats, recent] = await Promise.all([
        storage.getAiCrawlerStats(from, to),
        storage.getRecentAiCrawlerHits(limit, from, to),
      ]);
      const totalHits = stats.reduce((acc, r) => acc + r.hits, 0);
      const verifiedHits = stats.reduce((acc, r) => acc + r.verifiedHits, 0);
      const unverifiableHits = stats.reduce(
        (acc, r) => acc + r.unverifiableHits,
        0,
      );
      const spoofedHits = stats.reduce((acc, r) => acc + r.spoofedHits, 0);

      res.json({
        from: from?.toISOString() ?? null,
        to: to?.toISOString() ?? null,
        totalHits,
        verifiedHits,
        unverifiableHits,
        spoofedHits,
        stats,
        recent,
        verification: getAiBotVerifierStatus(),
      });
    } catch (error) {
      console.error("ai traffic stats error:", error);
      res.status(500).json({ error: "Failed to fetch AI traffic stats" });
    }
  });

  app.post("/api/admin/ai-traffic/refresh-verification", async (req, res) => {
    try {
      if (!requireAdminToken(req)) return res.status(403).json({ error: "Forbidden" });
      const result = await refreshAiBotIpRanges();
      res.json({ ...result, status: getAiBotVerifierStatus() });
    } catch (error) {
      console.error("ai traffic refresh error:", error);
      res.status(500).json({ error: "Failed to refresh AI bot verification list" });
    }
  });

  // ─── Journal report schedule ───────────────────────────────────────────
  app.get("/api/admin/journal/report-schedule", async (req, res) => {
    try {
      if (!requireAdminToken(req)) return res.status(403).json({ error: "Forbidden" });
      const schedule = await storage.getJournalReportSchedule();
      res.json(schedule ?? null);
    } catch (error) {
      console.error("get journal report schedule error:", error);
      res.status(500).json({ error: "Failed to fetch report schedule" });
    }
  });

  app.post("/api/admin/journal/report-schedule", async (req, res) => {
    try {
      if (!requireAdminToken(req)) return res.status(403).json({ error: "Forbidden" });
      const { frequency, recipientEmail, enabled } = req.body;
      if (!frequency || !["weekly", "monthly"].includes(frequency)) {
        return res.status(400).json({ error: "frequency must be 'weekly' or 'monthly'" });
      }
      if (!recipientEmail || typeof recipientEmail !== "string" || !recipientEmail.trim()) {
        return res.status(400).json({ error: "recipientEmail is required" });
      }
      const schedule = await storage.upsertJournalReportSchedule({
        frequency,
        recipientEmail: recipientEmail.trim(),
        enabled: enabled !== false,
      });
      res.json(schedule);
    } catch (error) {
      console.error("save journal report schedule error:", error);
      res.status(500).json({ error: "Failed to save report schedule" });
    }
  });

  app.post("/api/admin/journal/report-schedule/send-now", async (req, res) => {
    try {
      if (!requireAdminToken(req)) return res.status(403).json({ error: "Forbidden" });
      const { frequency, recipientEmail } = req.body;
      if (!recipientEmail || typeof recipientEmail !== "string" || !recipientEmail.trim()) {
        return res.status(400).json({ error: "recipientEmail is required" });
      }
      const freq: "weekly" | "monthly" = frequency === "monthly" ? "monthly" : "weekly";
      await sendJournalStatsReport(freq, recipientEmail.trim());
      res.json({ ok: true });
    } catch (error: any) {
      console.error("send journal report now error:", error);
      res.status(500).json({ error: error?.message || "Failed to send report" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
