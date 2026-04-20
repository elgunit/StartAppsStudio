import type { Express, Request } from "express";
import { createServer, type Server } from "node:http";
import { storage } from "./storage";
import { db } from "./db";
import { users as usersTable, appWaitlist, type User } from "@shared/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import crypto from "crypto";
import { getUncachableResendClient } from "./resend";
import { activeVisitorNotification, socialClickNotification, journalLeadNotification } from "./email-templates";
import { sendJournalStatsReport } from "./journal-report-sender";
import {
  renderArticleHtml,
  renderIndexHtml,
  renderRobotsTxt,
  renderSitemapXml,
} from "./journal/render";
import { getPost, allPostsNewestFirst } from "./journal/posts";

function resolveOrigin(req: Request): string {
  const forwardedHost = req.header("x-forwarded-host");
  const forwardedProto = req.header("x-forwarded-proto");
  const host = forwardedHost || req.get("host") || "localhost:5000";
  const proto =
    forwardedProto ||
    (host.includes("localhost") || host.includes("127.0.0.1")
      ? "http"
      : "https");
  return `${proto}://${host}`;
}

// Simple password hashing
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// Strip auth-sensitive fields (password hash, session token) from user
// objects before they leave the server. Use this for every response that
// includes a user — the only exception is the login response, which must
// include the freshly-issued session token for the client.
type SensitiveUserKeys = "password" | "sessionToken";
type PublicUser<T> = T extends null | undefined
  ? T
  : Omit<T, SensitiveUserKeys>;

function publicUser<T extends Record<string, unknown> | null | undefined>(
  u: T,
): PublicUser<T> {
  if (!u) return u as PublicUser<T>;
  const { password, sessionToken, ...rest } = u as Record<string, unknown> & {
    password?: unknown;
    sessionToken?: unknown;
  };
  void password;
  void sessionToken;
  return rest as PublicUser<T>;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // ─── Journal (SEO content) ───────────────────────────────────────────
  app.get("/journal", (req, res) => {
    const origin = resolveOrigin(req);
    res.setHeader("content-type", "text/html; charset=utf-8");
    res.send(renderIndexHtml(origin));
  });

  app.get("/journal/:slug", (req, res) => {
    const post = getPost(req.params.slug);
    if (!post) {
      res.status(404).setHeader("content-type", "text/html; charset=utf-8");
      return res.send(
        `<!doctype html><meta charset="utf-8"><title>Not found</title><p>No article at that URL. <a href="/journal">Back to the Journal</a>.</p>`,
      );
    }
    const origin = resolveOrigin(req);
    res.setHeader("content-type", "text/html; charset=utf-8");
    res.send(renderArticleHtml(post, origin));
  });

  // JSON API for the in-app Journal (Expo client)
  app.get("/api/journal/posts", (_req, res) => {
    const list = allPostsNewestFirst().map((p) => ({
      slug: p.slug,
      title: p.title,
      description: p.description,
      excerpt: p.excerpt,
      publishedAt: p.publishedAt,
      updatedAt: p.updatedAt,
      readMinutes: p.readMinutes,
      tags: p.tags,
    }));
    res.json({ posts: list });
  });

  app.get("/api/journal/posts/:slug", (req, res) => {
    const post = getPost(req.params.slug);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    res.json({ post });
  });

  // App launch waitlist — pre-register email capture from the landing page.
  app.post("/api/waitlist", async (req, res) => {
    try {
      const { email } = req.body || {};
      const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
      if (!cleanEmail || !/\S+@\S+\.\S+/.test(cleanEmail)) {
        return res.status(400).json({ error: "valid email is required" });
      }
      const existing = await db.select({ id: appWaitlist.id })
        .from(appWaitlist)
        .where(eq(appWaitlist.email, cleanEmail))
        .limit(1);
      if (existing.length > 0) {
        return res.status(409).json({ ok: true, message: "already registered" });
      }
      await db.insert(appWaitlist).values({ email: cleanEmail, source: "landing" });
      return res.json({ ok: true });
    } catch (err) {
      console.error("[waitlist]", err);
      return res.status(500).json({ error: "server error" });
    }
  });

  // Capture a guest email from an in-app Journal article CTA.
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

      // Resolve the canonical title from the slug when possible so the
      // studio sees the real article title even if the client omits it.
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

      // Only notify the studio on the first capture for this slug+email,
      // so a visitor who taps the CTA twice doesn't trigger a second email.
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
            to: "create@startappsstudio.com",
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

  // Admin read of captured Journal leads (designer-only).
  // Uses the server-issued session token from the `x-session-token` header
  // — never trusts a client-supplied user ID — because lead emails are PII.
  app.get("/api/admin/journal-leads", async (req, res) => {
    try {
      const designer = await requireDesignerFromToken(req);
      if (!designer) {
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
        // Defuse spreadsheet formula injection: a leading =, +, -, @, tab,
        // or carriage return makes Excel/Sheets evaluate the cell. Prefix
        // with a single quote to neutralize without losing the original.
        if (s.length > 0 && /^[=+\-@\t\r]/.test(s)) {
          s = `'${s}`;
        }
        // Always quote so commas/newlines/quotes inside fields stay safe.
        // Doubling quote chars is the CSV escape per RFC 4180.
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

  app.get("/sitemap.xml", (req, res) => {
    const origin = resolveOrigin(req);
    res.setHeader("content-type", "application/xml; charset=utf-8");
    res.send(renderSitemapXml(origin));
  });

  app.get("/robots.txt", (req, res) => {
    const origin = resolveOrigin(req);
    res.setHeader("content-type", "text/plain; charset=utf-8");
    res.send(renderRobotsTxt(origin));
  });

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, name } = req.body;
      
      if (!email || !password || !name) {
        return res.status(400).json({ error: "Email, password, and name are required" });
      }

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }

      const user = await storage.createUser({
        email,
        password: hashPassword(password),
        name,
        role: "client",
        credits: 0,
        isOnline: false,
      });

      res.json({ user: publicUser(user) });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Failed to register" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user || user.password !== hashPassword(password)) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Rotate a fresh server-issued session token on every successful login
      // so admin endpoints can verify identity without trusting client-supplied IDs.
      const sessionToken = crypto.randomBytes(32).toString("hex");
      const updated = await storage.updateUser(user.id, { isOnline: true, sessionToken });

      res.json({
        user: { ...publicUser(updated || user), isOnline: true, sessionToken },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Failed to login" });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    try {
      // Authenticate the caller by their server-issued session token instead
      // of trusting a `userId` from the request body. Otherwise any unauth
      // caller could repeatedly null another user's sessionToken and lock
      // them out of token-gated admin endpoints.
      const raw = req.header("x-session-token");
      const token = typeof raw === "string" ? raw.trim() : "";
      if (token && token.length >= 16) {
        const [u] = await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.sessionToken, token));
        if (u) {
          await storage.updateUser(u.id, { isOnline: false, sessionToken: null });
        }
      }
      // Always respond success — the client should clear local state even
      // if the server-side token was already invalidated.
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to logout" });
    }
  });

  // User routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(publicUser(user));
    } catch (error) {
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  app.get("/api/designer", async (req, res) => {
    try {
      const designer = await storage.getDesigner();
      if (!designer) {
        return res.status(404).json({ error: "Designer not found" });
      }
      res.json(publicUser(designer));
    } catch (error) {
      res.status(500).json({ error: "Failed to get designer" });
    }
  });

  app.patch("/api/users/:id", async (req, res) => {
    try {
      // Disallow client-driven mutation of auth-sensitive fields. Anything
      // sensitive (password rotation, session token rotation, role changes)
      // must go through dedicated server-controlled flows.
      const body = (req.body ?? {}) as Record<string, unknown>;
      const { password, sessionToken, role, ...safe } = body;
      void password;
      void sessionToken;
      void role;
      const user = await storage.updateUser(req.params.id, safe as Partial<User>);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(publicUser(user));
    } catch (error) {
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  // Project routes
  app.get("/api/projects", async (req, res) => {
    try {
      const { clientId } = req.query;
      let projectList;
      if (clientId) {
        projectList = await storage.getProjectsByClient(clientId as string);
      } else {
        projectList = await storage.getAllProjects();
      }
      res.json(projectList);
    } catch (error) {
      res.status(500).json({ error: "Failed to get projects" });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.getProjectWithDetails(req.params.id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: "Failed to get project" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const { clientId, name, description, hats, estimatedCredits, planTier } = req.body;
      
      if (!clientId || !name || !description) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const project = await storage.createProject({
        clientId,
        name,
        description,
        status: "brief_submitted",
        estimatedCredits: estimatedCredits || 0,
        usedCredits: 0,
        planTier: planTier || null,
      });

      // Add hats
      if (hats && Array.isArray(hats)) {
        for (const hat of hats) {
          await storage.addProjectHat(project.id, hat);
        }
      }

      res.json(project);
    } catch (error) {
      console.error("Create project error:", error);
      res.status(500).json({ error: "Failed to create project" });
    }
  });

  app.patch("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.updateProject(req.params.id, req.body);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: "Failed to update project" });
    }
  });

  // Messages routes
  app.get("/api/messages/:projectId", async (req, res) => {
    try {
      const messages = await storage.getMessagesByProject(req.params.projectId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to get messages" });
    }
  });

  app.get("/api/conversations/:userId", async (req, res) => {
    try {
      const conversations = await storage.getConversations(req.params.userId);
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ error: "Failed to get conversations" });
    }
  });

  app.post("/api/messages", async (req, res) => {
    try {
      const { projectId, senderId, content, fileUrl, fileName } = req.body;
      
      if (!projectId || !senderId || !content) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const message = await storage.createMessage({
        projectId,
        senderId,
        content,
        fileUrl,
        fileName,
        isRead: false,
      });

      res.json(message);
    } catch (error) {
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  app.post("/api/messages/:projectId/read", async (req, res) => {
    try {
      const { userId } = req.body;
      await storage.markMessagesAsRead(req.params.projectId, userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to mark messages as read" });
    }
  });

  // Work sessions routes
  app.get("/api/work-sessions/active", async (req, res) => {
    try {
      const session = await storage.getActiveWorkSession();
      res.json(session || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to get active session" });
    }
  });

  app.get("/api/work-sessions/project/:projectId", async (req, res) => {
    try {
      const sessions = await storage.getWorkSessionsByProject(req.params.projectId);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: "Failed to get work sessions" });
    }
  });

  app.post("/api/work-sessions", async (req, res) => {
    try {
      const { projectId } = req.body;
      
      // End any existing active session
      const activeSession = await storage.getActiveWorkSession();
      if (activeSession) {
        await storage.updateWorkSession(activeSession.id, {
          isActive: false,
          endTime: new Date(),
        });
      }

      const session = await storage.createWorkSession({
        projectId,
        isActive: true,
        promptCount: 0,
      });

      // Update designer online status
      const designer = await storage.getDesigner();
      if (designer) {
        await storage.updateUser(designer.id, { isOnline: true });
      }

      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to start work session" });
    }
  });

  app.patch("/api/work-sessions/:id", async (req, res) => {
    try {
      const session = await storage.updateWorkSession(req.params.id, req.body);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to update work session" });
    }
  });

  app.post("/api/work-sessions/:id/stop", async (req, res) => {
    try {
      const session = await storage.updateWorkSession(req.params.id, {
        isActive: false,
        endTime: new Date(),
      });

      // Update designer offline status if no active sessions
      const activeSession = await storage.getActiveWorkSession();
      if (!activeSession) {
        const designer = await storage.getDesigner();
        if (designer) {
          await storage.updateUser(designer.id, { isOnline: false });
        }
      }

      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to stop work session" });
    }
  });

  app.post("/api/work-sessions/:id/increment-prompt", async (req, res) => {
    try {
      const session = await storage.getWorkSession(req.params.id);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      const updated = await storage.updateWorkSession(req.params.id, {
        promptCount: session.promptCount + 1,
      });

      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to increment prompt count" });
    }
  });

  // Project versions routes
  app.get("/api/project-versions/:projectId", async (req, res) => {
    try {
      const versions = await storage.getProjectVersions(req.params.projectId);
      res.json(versions);
    } catch (error) {
      res.status(500).json({ error: "Failed to get versions" });
    }
  });

  app.post("/api/project-versions", async (req, res) => {
    try {
      const { projectId, previewUrl, notes } = req.body;
      
      const versions = await storage.getProjectVersions(projectId);
      const versionNumber = versions.length + 1;

      const version = await storage.createProjectVersion({
        projectId,
        versionNumber,
        previewUrl,
        notes,
      });

      // Update project with new preview URL
      await storage.updateProject(projectId, { previewUrl });

      res.json(version);
    } catch (error) {
      res.status(500).json({ error: "Failed to create version" });
    }
  });

  // Credit packages routes
  app.get("/api/credit-packages", async (req, res) => {
    try {
      let packages = await storage.getCreditPackages();
      
      // Create default packages if none exist
      if (packages.length === 0) {
        await storage.createCreditPackage({
          name: "Starter",
          credits: 450,
          priceInCents: 45900,
          description: "Quick validation with concept exploration, initial wireframes and strategy consultation. Delivered in 2-5 days.",
          isPopular: false,
        });
        await storage.createCreditPackage({
          name: "Prototype",
          credits: 1000,
          priceInCents: 95900,
          description: "Investor-ready with full UI/UX design, functional prototype and user testing. Delivered in 5-10 days.",
          isPopular: true,
        });
        await storage.createCreditPackage({
          name: "Production",
          credits: 4000,
          priceInCents: 150000,
          description: "Launch-ready MVP with complete development, ongoing support. Scales up to 10k users. Delivered in 3-10 weeks.",
          isPopular: false,
        });
        await storage.createCreditPackage({
          name: "Custom",
          credits: 0,
          priceInCents: 750000,
          description: "100% handcrafted development for 10k+ users. Credits billed internally. 1-6 months delivery.",
          isPopular: false,
        });
        packages = await storage.getCreditPackages();
      }

      res.json(packages);
    } catch (error) {
      res.status(500).json({ error: "Failed to get credit packages" });
    }
  });

  // Credit transactions
  app.get("/api/credit-transactions/:userId", async (req, res) => {
    try {
      const transactions = await storage.getCreditTransactionsByUser(req.params.userId);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to get transactions" });
    }
  });

  app.post("/api/credits/add", async (req, res) => {
    try {
      const { userId, amount, description, projectId } = req.body;
      await storage.addCreditsToUser(userId, amount, description, projectId);
      const user = await storage.getUser(userId);
      res.json({ credits: user?.credits || 0 });
    } catch (error) {
      res.status(500).json({ error: "Failed to add credits" });
    }
  });

  app.post("/api/credits/purchase", async (req, res) => {
    try {
      const { userId, projectId, packageId, tier } = req.body;
      if (!userId || !projectId || (!packageId && !tier)) {
        return res.status(400).json({ error: "userId, projectId, and packageId or tier are required" });
      }

      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      const tierOrder = ["Starter", "Prototype", "Production", "Custom"];
      const currentTierIndex = project.planTier ? tierOrder.indexOf(project.planTier) : -1;

      let pkg: any;
      if (packageId) {
        pkg = await storage.getCreditPackage(packageId);
      } else {
        const packages = await storage.getCreditPackages();
        pkg = packages.find((p: any) => p.name === tier);
      }
      if (!pkg) {
        return res.status(404).json({ error: "Package not found" });
      }

      const newTierIndex = tierOrder.indexOf(pkg.name);
      if (newTierIndex <= currentTierIndex) {
        return res.status(400).json({ error: "Can only upgrade to a higher tier" });
      }

      if (pkg.name !== "Custom") {
        await storage.addCreditsToUser(userId, pkg.credits, `Purchased ${pkg.name} for ${project.name}`, projectId);
      }

      await storage.updateProject(projectId, { planTier: pkg.name });

      const user = await storage.getUser(userId);
      res.json({ credits: user?.credits || 0, planTier: pkg.name });
    } catch (error) {
      console.error("Purchase error:", error);
      res.status(500).json({ error: "Failed to purchase plan" });
    }
  });

  app.post("/api/credits/deduct", async (req, res) => {
    try {
      const { userId, amount, description } = req.body;
      if (!userId || !amount || amount <= 0) {
        return res.status(400).json({ error: "Valid userId and positive amount required" });
      }
      const success = await storage.useCredits(userId, amount, description || "Work session deduction");
      if (!success) {
        return res.status(400).json({ error: "Insufficient credits" });
      }
      const user = await storage.getUser(userId);
      res.json({ credits: user?.credits || 0 });
    } catch (error) {
      res.status(500).json({ error: "Failed to deduct credits" });
    }
  });

  app.get("/api/clients", async (req, res) => {
    try {
      const clients = await storage.getClientUsers();
      res.json(clients.map((c: any) => publicUser(c)));
    } catch (error) {
      res.status(500).json({ error: "Failed to get clients" });
    }
  });

  // Initialize designer account if not exists
  app.post("/api/init-designer", async (req, res) => {
    try {
      let designer = await storage.getDesigner();
      if (!designer) {
        designer = await storage.createUser({
          email: "create@startappsstudio.com",
          password: hashPassword("designer123"),
          name: "Start Apps Studio",
          role: "designer",
          credits: 0,
          isOnline: false,
        });
      }
      res.json(publicUser(designer));
    } catch (error) {
      console.error("Init designer error:", error);
      res.status(500).json({ error: "Failed to initialize designer" });
    }
  });

  // ────────────────────────────────────────────────────────────────────
  // Visitor analytics — anonymous-friendly tracking
  // POST endpoints are open (anonymous insert).
  // GET endpoints require designer/admin role (passed via ?adminId=...).
  // ────────────────────────────────────────────────────────────────────
  const requireAdmin = async (adminId: unknown): Promise<boolean> => {
    if (typeof adminId !== "string" || !adminId) return false;
    const u = await storage.getUser(adminId);
    return Boolean(u && u.role === "designer");
  };

  // Session-token based admin auth. Reads `x-session-token` from the request,
  // looks up the matching user, and only allows designers through. Used for
  // admin endpoints that return PII (e.g. captured leads) — does NOT trust
  // any client-supplied user ID.
  const requireDesignerFromToken = async (req: Request) => {
    const raw = req.header("x-session-token");
    const token = typeof raw === "string" ? raw.trim() : "";
    if (!token || token.length < 16) return null;
    const [u] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.sessionToken, token));
    if (!u || u.role !== "designer") return null;
    return u;
  };

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
      await storage.createVisitorEvent({
        eventType: String(eventType).slice(0, 80),
        visitorId: String(visitorId).slice(0, 120),
        pagePath: pagePath ? String(pagePath).slice(0, 500) : null,
        eventData: eventData == null ? null : (typeof eventData === "string" ? eventData : JSON.stringify(eventData)).slice(0, 4000),
        userId: userId || null,
      } as any);
      res.json({ ok: true });
    } catch (error) {
      console.error("visitor-event error:", error);
      res.status(500).json({ error: "Failed to record visitor event" });
    }
  });

  app.post("/api/track/active-visitor", async (req, res) => {
    try {
      const { visitorId, pagePath, scrollPercent, userAgent, referrer, userId } = req.body || {};
      if (!visitorId) return res.status(400).json({ error: "visitorId required" });

      // Persist the event for analytics history.
      await storage.createVisitorEvent({
        eventType: "active_visitor",
        visitorId: String(visitorId).slice(0, 120),
        pagePath: pagePath ? String(pagePath).slice(0, 500) : null,
        eventData: JSON.stringify({ scrollPercent, userAgent, referrer }).slice(0, 4000),
        userId: userId || null,
      } as any);

      // Send notification email (best-effort).
      try {
        const { client, fromEmail } = await getUncachableResendClient();
        const { subject, html } = activeVisitorNotification({
          visitorId: String(visitorId),
          pagePath: pagePath ? String(pagePath) : "/",
          scrollPercent: typeof scrollPercent === "number" ? scrollPercent : 0,
          userAgent: userAgent ? String(userAgent) : undefined,
          referrer: referrer ? String(referrer) : undefined,
        });
        const sendResult: any = await client.emails.send({
          from: fromEmail,
          to: "elgunit@gmail.com",
          subject,
          html,
        });
        if (sendResult?.error) {
          console.error("active-visitor email rejected by Resend:", JSON.stringify(sendResult.error));
        } else {
          console.log("active-visitor email sent ok. id=", sendResult?.data?.id, "from=", fromEmail);
        }
      } catch (emailError: any) {
        console.error("active-visitor email threw:", emailError?.message || emailError);
      }
      res.json({ ok: true });
    } catch (error) {
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

  // Admin reads — designer-only.
  app.get("/api/admin/section-views", async (req, res) => {
    try {
      if (!(await requireAdmin(req.query.adminId))) {
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
      if (!(await requireAdmin(req.query.adminId))) {
        return res.status(403).json({ error: "Forbidden" });
      }
      const limit = Math.min(1000, parseInt(String(req.query.limit ?? "200"), 10) || 200);
      res.json(await storage.getVisitorEvents(limit));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch visitor events" });
    }
  });

  app.get("/api/admin/journal/conversion-stats", async (req, res) => {
    try {
      if (!(await requireAdmin(req.query.adminId))) {
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
      if (!(await requireAdmin(req.query.adminId))) {
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

  // ── Journal report schedule ──────────────────────────────────────────────


  app.get("/api/admin/journal/report-schedule", async (req, res) => {
    try {
      const designer = await requireDesignerFromToken(req);
      if (!designer) return res.status(403).json({ error: "Forbidden" });
      const schedule = await storage.getJournalReportSchedule();
      res.json(schedule ?? null);
    } catch (error) {
      console.error("get journal report schedule error:", error);
      res.status(500).json({ error: "Failed to fetch report schedule" });
    }
  });

  app.post("/api/admin/journal/report-schedule", async (req, res) => {
    try {
      const designer = await requireDesignerFromToken(req);
      if (!designer) return res.status(403).json({ error: "Forbidden" });
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
      const designer = await requireDesignerFromToken(req);
      if (!designer) return res.status(403).json({ error: "Forbidden" });
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

  // Contact submissions (for designer dashboard)
  app.get("/api/contact-submissions", async (req, res) => {
    try {
      const submissions = await storage.getContactSubmissions();
      res.json(submissions);
    } catch (error) {
      console.error("Failed to get contact submissions:", error);
      res.status(500).json({ error: "Failed to get contact submissions" });
    }
  });

  // Contact form submission
  app.post("/api/contact", async (req, res) => {
    try {
      const { fullName, email, company, budget, interests, message } = req.body;
      
      if (!fullName || !email || !message) {
        return res.status(400).json({ error: "Name, email, and message are required" });
      }
      
      // Store contact submission
      await storage.createContactSubmission({
        fullName,
        email,
        company: company || null,
        budget: budget || null,
        interests: interests || [],
        message,
      });
      
      console.log("Contact form submission:", { fullName, email, company, budget, interests, message });
      
      // Send email notification using Resend
      try {
        const { client, fromEmail } = await getUncachableResendClient();
        console.log("Resend client obtained, fromEmail:", fromEmail);
        
        const interestsList = interests && interests.length > 0 
          ? interests.join(', ') 
          : 'Not specified';
        
        const emailResult = await client.emails.send({
          from: fromEmail,
          to: 'create@startappsstudio.com',
          subject: `New Project Inquiry from ${fullName}`,
          html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${fullName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Company:</strong> ${company || 'Not specified'}</p>
            <p><strong>Budget:</strong> ${budget || 'Not specified'}</p>
            <p><strong>Interested in:</strong> ${interestsList}</p>
            <h3>Message:</h3>
            <p>${message}</p>
          `,
        });
        
        console.log("Email notification sent successfully:", JSON.stringify(emailResult));
      } catch (emailError: any) {
        console.error("Failed to send email notification:", emailError?.message || emailError);
        console.error("Full error details:", JSON.stringify(emailError, null, 2));
        // Don't fail the request if email fails - submission was still saved
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Contact form error:", error);
      res.status(500).json({ error: "Failed to submit contact form" });
    }
  });

  // Marketing services routes
  app.get("/api/marketing/services", async (req, res) => {
    try {
      let services = await storage.getMarketingServices();

      if (services.length === 0) {
        const defaults = [
          {
            category: "SEO",
            name: "SEO Audit & Optimization",
            description: "Comprehensive technical SEO audit with actionable fixes to improve search rankings.",
            creditsRequired: 200,
            deliverables: ["Full site crawl & technical audit report", "Keyword gap analysis", "On-page optimization recommendations"],
            isActive: true,
          },
          {
            category: "SEO",
            name: "Keyword Strategy",
            description: "Data-driven keyword research and content mapping for organic growth.",
            creditsRequired: 150,
            deliverables: ["100+ keyword opportunities ranked by impact", "Content calendar with topics", "Competitor keyword gap report"],
            isActive: true,
          },
          {
            category: "Content",
            name: "Content Plan & Copywriting",
            description: "Strategic content plan with professionally written copy for your MVP.",
            creditsRequired: 250,
            deliverables: ["30-day content strategy document", "5 SEO-optimized blog posts", "Landing page copy & CTAs"],
            isActive: true,
          },
          {
            category: "Ads",
            name: "Paid Ads Setup",
            description: "Launch-ready ad campaigns on Google and Meta with targeting and creatives.",
            creditsRequired: 300,
            deliverables: ["Campaign structure & audience targeting", "Ad creative designs (5 variations)", "Tracking & conversion setup"],
            isActive: true,
          },
          {
            category: "Social",
            name: "Social Media Kit",
            description: "Complete social media brand kit with templates and launch strategy.",
            creditsRequired: 200,
            deliverables: ["Profile & cover designs for 3 platforms", "15 branded post templates", "Launch week posting schedule"],
            isActive: true,
          },
          {
            category: "Email",
            name: "Email Sequence",
            description: "Automated email sequences to convert and retain your early users.",
            creditsRequired: 180,
            deliverables: ["5-email welcome sequence", "3-email re-engagement flow", "Email template designs"],
            isActive: true,
          },
          {
            category: "Brand",
            name: "Brand Identity Report",
            description: "Define your brand voice, visual identity, and positioning in the market.",
            creditsRequired: 350,
            deliverables: ["Brand voice & messaging guide", "Visual identity system (colors, typography)", "Competitive positioning map"],
            isActive: true,
          },
        ];

        for (const svc of defaults) {
          await storage.createMarketingService(svc);
        }
        services = await storage.getMarketingServices();
      }

      res.json(services);
    } catch (error) {
      console.error("Failed to get marketing services:", error);
      res.status(500).json({ error: "Failed to get marketing services" });
    }
  });

  app.get("/api/marketing/orders", async (req, res) => {
    try {
      const { clientId } = req.query;
      if (!clientId) {
        return res.status(400).json({ error: "clientId is required" });
      }
      const orders = await storage.getServiceOrdersByClient(clientId as string);
      res.json(orders);
    } catch (error) {
      console.error("Failed to get service orders:", error);
      res.status(500).json({ error: "Failed to get service orders" });
    }
  });

  app.post("/api/marketing/orders", async (req, res) => {
    try {
      const { clientId, serviceId, goals, websiteUrl } = req.body;

      if (!clientId || !serviceId || !goals) {
        return res.status(400).json({ error: "clientId, serviceId, and goals are required" });
      }

      const service = await storage.getMarketingService(serviceId);
      if (!service) {
        return res.status(404).json({ error: "Service not found" });
      }

      const success = await storage.useCredits(
        clientId,
        service.creditsRequired,
        `Marketing service: ${service.name}`
      );

      if (!success) {
        return res.status(400).json({ error: "Insufficient credits" });
      }

      const order = await storage.createServiceOrder({
        clientId,
        serviceId,
        goals,
        websiteUrl: websiteUrl || null,
        creditsCharged: service.creditsRequired,
        status: "submitted",
      });

      const orderWithService = { ...order, service };
      res.json(orderWithService);
    } catch (error) {
      console.error("Failed to create service order:", error);
      res.status(500).json({ error: "Failed to create service order" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
