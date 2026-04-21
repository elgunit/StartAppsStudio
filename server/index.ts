import express from "express";
import type { Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import * as fs from "fs";
import * as path from "path";
import { storage } from "./storage";
import { sendJournalStatsReport } from "./journal-report-sender";
import { detectAiBot } from "./ai-crawlers";
import {
  startAiBotVerifierAutoRefresh,
  verifyAiBot,
} from "./ai-bot-verifier";
import crypto from "node:crypto";

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

    // Allow localhost origins for Expo web development (any port)
    const isLocalhost =
      origin?.startsWith("http://localhost:") ||
      origin?.startsWith("http://127.0.0.1:");

    if (origin && (origins.has(origin) || isLocalhost)) {
      res.header("Access-Control-Allow-Origin", origin);
      res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS",
      );
      res.header("Access-Control-Allow-Headers", "Content-Type");
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
      // Avatar uploads are sent inline as base64 data URIs (capped at ~1.5MB
      // by the avatar validator). The default 100KB JSON limit rejects them
      // before they reach the route handler, so allow up to 2MB here.
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
//
// `X-Forwarded-For` is a CSV the client can almost entirely control: if a
// client sends `XFF: 20.171.207.5`, our reverse proxy appends the real TCP
// peer to the right, producing `XFF: 20.171.207.5, real_client_ip`. The
// proxy-supplied rightmost entry is the only value the client cannot spoof,
// so we take that. This deliberately ignores Express's `req.ip` because the
// `trust proxy=N` algorithm walks back N hops and returns the leftmost
// remaining entry — which is still attacker-controlled when N=1.
//
// If no `X-Forwarded-For` is present (e.g. direct localhost requests in
// dev), we fall back to the socket peer address.
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
    // Only log GET requests so we don't log internal API mutations.
    if (req.method !== "GET") return next();
    // Skip noisy static asset paths — we care about pages, not images/JS.
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

    // Fire-and-forget — verification (especially reverse DNS) can take a
    // few hundred ms, so we never block the actual response on it.
    (async () => {
      try {
        // Referrer-attributed hits are real human visits clicking through
        // from an AI assistant, not bots claiming to be one — IP
        // verification doesn't apply, so they're recorded as
        // "unverifiable" rather than "spoofed".
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

function getAppName(): string {
  try {
    const appJsonPath = path.resolve(process.cwd(), "app.json");
    const appJsonContent = fs.readFileSync(appJsonPath, "utf-8");
    const appJson = JSON.parse(appJsonContent);
    return appJson.expo?.name || "App Landing Page";
  } catch {
    return "App Landing Page";
  }
}

function serveExpoManifest(platform: string, res: Response) {
  const manifestPath = path.resolve(
    process.cwd(),
    "static-build",
    platform,
    "manifest.json",
  );

  if (!fs.existsSync(manifestPath)) {
    return res
      .status(404)
      .json({ error: `Manifest not found for platform: ${platform}` });
  }

  res.setHeader("expo-protocol-version", "1");
  res.setHeader("expo-sfv-version", "0");
  res.setHeader("content-type", "application/json");

  const manifest = fs.readFileSync(manifestPath, "utf-8");
  res.send(manifest);
}

function isMobileUserAgent(userAgent: string): boolean {
  return /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
}

function isDevelopmentEnvironment(host: string): boolean {
  return host.includes(":5000") || host.includes("-5000.");
}

function serveLandingPage({
  req,
  res,
}: {
  req: Request;
  res: Response;
}) {
  const userAgent = req.header("user-agent") || "";
  const forwardedHost = req.header("x-forwarded-host");
  const host = forwardedHost || req.get("host") || "";
  
  // In development, desktop browsers should be redirected to the Expo web app on port 8081
  if (!isMobileUserAgent(userAgent) && isDevelopmentEnvironment(host)) {
    const forwardedProto = req.header("x-forwarded-proto");
    const protocol = forwardedProto || req.protocol || "https";
    
    const webAppUrl = host.includes(":5000") 
      ? `${protocol}://${host.replace(":5000", ":8081")}`
      : `${protocol}://${host.replace("-5000.", "-8081.")}`;
    
    log(`Development desktop detected, redirecting to Expo web: ${webAppUrl}`);
    return res.redirect(302, webAppUrl);
  }
  
  // All visitors (desktop and mobile) get the landing page in production
  const landingPagePath = path.resolve(process.cwd(), "server", "templates", "desktop-landing.html");
  if (fs.existsSync(landingPagePath)) {
    log(`Serving landing page to ${isMobileUserAgent(userAgent) ? 'mobile' : 'desktop'} visitor`);
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    return res.sendFile(landingPagePath);
  }

  // Fallback if landing page doesn't exist
  log(`Landing page not found, serving 404`);
  res.status(404).send("Landing page not found");
}

function configureExpoAndLanding(app: express.Application) {
  log("Serving static Expo files with dynamic manifest routing");

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith("/api")) {
      return next();
    }

    if (req.path !== "/" && req.path !== "/manifest") {
      return next();
    }

    const platform = req.header("expo-platform");
    if (platform && (platform === "ios" || platform === "android")) {
      return serveExpoManifest(platform, res);
    }

    if (req.path === "/") {
      return serveLandingPage({ req, res });
    }

    next();
  });

  app.use("/assets", express.static(path.resolve(process.cwd(), "assets")));
  app.use(express.static(path.resolve(process.cwd(), "static-build")));

  log("Expo routing: Checking expo-platform header on / and /manifest");
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
  setupCors(app);
  setupBodyParsing(app);
  startAiBotVerifierAutoRefresh();
  setupAiCrawlerLogging(app);
  setupRequestLogging(app);

  configureExpoAndLanding(app);

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
      // Check for due scheduled reports every hour
      setInterval(checkAndSendScheduledReport, 60 * 60 * 1000);
    },
  );
})();
