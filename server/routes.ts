import type { Express } from "express";
import { createServer, type Server } from "node:http";
import { storage } from "./storage";
import { z } from "zod";
import crypto from "crypto";

// Simple password hashing
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export async function registerRoutes(app: Express): Promise<Server> {
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

      res.json({ user: { ...user, password: undefined } });
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

      await storage.updateUser(user.id, { isOnline: true });

      res.json({ user: { ...user, password: undefined, isOnline: true } });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Failed to login" });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    try {
      const { userId } = req.body;
      if (userId) {
        await storage.updateUser(userId, { isOnline: false });
      }
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
      res.json({ ...user, password: undefined });
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
      res.json({ ...designer, password: undefined });
    } catch (error) {
      res.status(500).json({ error: "Failed to get designer" });
    }
  });

  app.patch("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.updateUser(req.params.id, req.body);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ ...user, password: undefined });
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
      const { clientId, name, description, hats, estimatedCredits } = req.body;
      
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
          name: "Starter Pack",
          credits: 50,
          priceInCents: 9900,
          description: "Perfect for small projects and prototypes",
          isPopular: false,
        });
        await storage.createCreditPackage({
          name: "Growth Suite",
          credits: 150,
          priceInCents: 24900,
          description: "Best value for growing startups",
          isPopular: true,
        });
        await storage.createCreditPackage({
          name: "Enterprise Package",
          credits: 500,
          priceInCents: 69900,
          description: "For large-scale MVPs and ongoing projects",
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
      const { userId, amount, description } = req.body;
      await storage.addCreditsToUser(userId, amount, description);
      const user = await storage.getUser(userId);
      res.json({ credits: user?.credits || 0 });
    } catch (error) {
      res.status(500).json({ error: "Failed to add credits" });
    }
  });

  // Initialize designer account if not exists
  app.post("/api/init-designer", async (req, res) => {
    try {
      let designer = await storage.getDesigner();
      if (!designer) {
        designer = await storage.createUser({
          email: "elgar@elgarsirajov.com",
          password: hashPassword("designer123"),
          name: "Elgar Sirajov",
          role: "designer",
          credits: 0,
          isOnline: false,
        });
      }
      res.json({ ...designer, password: undefined });
    } catch (error) {
      console.error("Init designer error:", error);
      res.status(500).json({ error: "Failed to initialize designer" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
