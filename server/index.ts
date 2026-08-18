import express from "express";
import type { Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import * as fs from "fs";
import * as path from "path";
import { storage } from "./storage";
import { pool } from "./db";
import { sendJournalStatsReport } from "./journal-report-sender";
import { detectAiBot } from "./ai-crawlers";
import {
  startAiBotVerifierAutoRefresh,
  verifyAiBot,
} from "./ai-bot-verifier";
import crypto from "node:crypto";

/**
 * Runs all *.sql files in server/migrations/ in filename order.
 * Every statement is idempotent (IF NOT EXISTS / IF EXISTS guards),
 * so it is safe to re-run on every startup.
 */
async function runMigrations(): Promise<void> {
  const migrationsDir = path.resolve(process.cwd(), "server", "migrations");
  if (!fs.existsSync(migrationsDir)) return;

  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  const client = await pool.connect();
  try {
    for (const file of files) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
      await client.query(sql);
      console.log(`[migrations] applied ${file}`);
    }
  } finally {
    client.release();
  }
}

const app = express();
const log = console.log;

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

function setupCors(app: express.Application) {
  app.use((req, res, next) => {
    const origins = new Set<string>();

    if (process.env.REPLIT_DEV_DOMAIN) {
      origins.add(`https://${process.env.REPLIT_DEV_DOMAIN}`);
    }

    if (process.env.REPLIT_DOMAINS) {
      process.env.REPLIT_DOMAINS.split(",").forEach((d) => {
        origins.add(`https://${d.trim()}`);
      });
    }

    const origin = req.header("origin");

    if (origin && origins.has(origin)) {
      res.header("Access-Control-Allow-Origin", origin);
      res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS",
      );
      res.header("Access-Control-Allow-Headers", "Content-Type, x-session-token, x-admin-token");
      res.header("Access-Control-Allow-Credentials", "true");
    }

    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }

    next();
  });
}

function setupBodyParsing(app: express.Application) {
  app.use(
    express.json({
      limit: "2mb",
      verify: (req, _res, buf) => {
        req.rawBody = buf;
      },
    }),
  );

  app.use(express.urlencoded({ extended: false, limit: "2mb" }));
}

// Stable, salted, day-bucketed hash of the visitor IP — gives us a way to
// roughly count unique callers per AI assistant without persisting raw IPs.
const IP_HASH_SALT =
  process.env.AI_CRAWLER_IP_SALT ||
  process.env.SESSION_SECRET ||
  "ai-crawler-default-salt";

export function hashIp(ip: string | undefined | null): string | null {
  if (!ip) return null;
  const day = new Date().toISOString().slice(0, 10);
  return crypto
    .createHash("sha256")
    .update(`${IP_HASH_SALT}|${day}|${ip}`)
    .digest("hex")
    .slice(0, 16);
}

// Returns the client IP we can actually trust for IP-based bot verification.
function getClientIp(req: Request): string {
  const xff = req.header("x-forwarded-for");
  if (xff) {
    const parts = xff
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length > 0) {
      return parts[parts.length - 1].replace(/^::ffff:/i, "");
    }
  }
  return (req.socket.remoteAddress || "").replace(/^::ffff:/i, "");
}

function setupAiCrawlerLogging(app: express.Application) {
  app.use((req, _res, next) => {
    if (req.method !== "GET") return next();
    if (
      req.path.startsWith("/assets") ||
      req.path.startsWith("/static") ||
      /\.(?:js|css|map|png|jpg|jpeg|gif|svg|webp|ico|woff2?|ttf)$/i.test(
        req.path,
      )
    ) {
      return next();
    }

    const ua = req.header("user-agent") || "";
    const referrer = req.header("referer") || req.header("referrer") || "";
    const match = detectAiBot(ua, referrer);
    if (!match) return next();

    const ipTrusted = getClientIp(req);

    (async () => {
      try {
        const verification =
          match.source === "user-agent"
            ? await verifyAiBot(match.botName, ipTrusted)
            : "unverifiable";
        await storage.recordAiCrawlerHit({
          botName: match.botName,
          pagePath: req.path.slice(0, 500),
          userAgent: ua ? ua.slice(0, 500) : null,
          referrerUrl: referrer ? String(referrer).slice(0, 500) : null,
          ipHash: hashIp(ipTrusted),
          verification,
        });
        log(
          `[ai-crawler] ${match.botName} (${match.source}, ${verification}) → ${req.path}`,
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error("[ai-crawler] failed to record hit:", msg);
      }
    })();

    next();
  });
}

function setupRequestLogging(app: express.Application) {
  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, unknown> | undefined = undefined;

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
      if (!path.startsWith("/api")) return;

      const duration = Date.now() - start;

      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    });

    next();
  });
}

function serveLandingPage(req: Request, res: Response) {
  const landingPagePath = path.resolve(process.cwd(), "server", "templates", "desktop-landing.html");
  if (fs.existsSync(landingPagePath)) {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    return res.sendFile(landingPagePath);
  }
  res.status(404).send("Landing page not found");
}

function setupLandingPage(app: express.Application) {
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/journal") ||
        req.path === "/sitemap.xml" || req.path === "/robots.txt" ||
        req.path === "/llms.txt" || req.path === "/llms-full.txt") {
      return next();
    }

    if (req.path === "/") {
      return serveLandingPage(req, res);
    }

    next();
  });

  app.use("/assets", express.static(path.resolve(process.cwd(), "assets")));
}

function setupErrorHandler(app: express.Application) {
  app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
    const error = err as {
      status?: number;
      statusCode?: number;
      message?: string;
    };

    const status = error.status || error.statusCode || 500;
    const message = error.message || "Internal Server Error";

    console.error("Internal Server Error:", err);

    if (res.headersSent) {
      return next(err);
    }

    return res.status(status).json({ message });
  });
}

async function checkAndSendScheduledReport() {
  try {
    const schedule = await storage.getJournalReportSchedule();
    if (!schedule || !schedule.enabled) return;

    const now = new Date();
    const intervalDays = schedule.frequency === "monthly" ? 30 : 7;
    const intervalMs = intervalDays * 24 * 60 * 60 * 1000;
    const lastSent = schedule.lastSentAt ? new Date(schedule.lastSentAt) : null;

    if (lastSent && now.getTime() - lastSent.getTime() < intervalMs) return;

    const freq = schedule.frequency === "monthly" ? "monthly" : "weekly";
    await sendJournalStatsReport(freq, schedule.recipientEmail);
    await storage.markJournalReportSent(schedule.id);
    log(`Journal stats report sent to ${schedule.recipientEmail} (${freq})`);
  } catch (err: any) {
    console.error("Scheduled journal report failed:", err?.message || err);
  }
}

(async () => {
  await runMigrations();

  setupCors(app);
  setupBodyParsing(app);
  startAiBotVerifierAutoRefresh();
  setupAiCrawlerLogging(app);
  setupRequestLogging(app);

  setupLandingPage(app);

  const server = await registerRoutes(app);

  setupErrorHandler(app);

  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`express server serving on port ${port}`);
      setInterval(checkAndSendScheduledReport, 60 * 60 * 1000);
    },
  );
})();
