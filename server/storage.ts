import {
  users, projects, messages, workSessions, projectVersions,
  creditPackages, creditTransactions, projectHats, contactSubmissions,
  marketingServices, serviceOrders, sectionViews, visitorEvents,
  type User, type InsertUser, type Project, type InsertProject,
  type Message, type InsertMessage, type WorkSession, type InsertWorkSession,
  type ProjectVersion, type InsertProjectVersion, type CreditPackage,
  type InsertCreditPackage, type CreditTransaction, type InsertCreditTransaction,
  type ProjectHat, type HatType, type ContactSubmission, type InsertContactSubmission,
  type MarketingService, type InsertMarketingService, type ServiceOrder, type InsertServiceOrder,
  type SectionView, type InsertSectionView, type VisitorEvent, type InsertVisitorEvent
} from "@shared/schema";
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

  // Visitor Analytics
  createSectionView(view: InsertSectionView): Promise<SectionView>;
  createVisitorEvent(event: InsertVisitorEvent): Promise<VisitorEvent>;
  getSectionViews(limit?: number): Promise<SectionView[]>;
  getVisitorEvents(limit?: number): Promise<VisitorEvent[]>;

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
}

export const storage = new DatabaseStorage();
