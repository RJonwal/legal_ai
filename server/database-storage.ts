import { 
  users, cases, chatMessages, documents, caseTimeline,
  type User, type InsertUser,
  type Case, type InsertCase,
  type ChatMessage, type InsertChatMessage,
  type Document, type InsertDocument,
  type TimelineEvent, type InsertTimelineEvent
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, like, or, and } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Hash password before storing
    const hashedPassword = await bcrypt.hash(insertUser.password, 12);
    
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        password: hashedPassword,
        userType: insertUser.userType || "attorney",
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserStripe(id: number, stripeCustomerId: string, stripeSubscriptionId?: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        stripeCustomerId, 
        stripeSubscriptionId,
        subscriptionStatus: stripeSubscriptionId ? "active" : "inactive",
        updatedAt: new Date() 
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async verifyUser(id: number): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ isVerified: true, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updatePassword(id: number, hashedPassword: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async setResetToken(email: string, token: string, expiry: Date): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ resetToken: token, resetTokenExpiry: expiry, updatedAt: new Date() })
      .where(eq(users.email, email))
      .returning();
    return user;
  }

  // Case operations
  async getCase(id: number): Promise<Case | undefined> {
    const [case_] = await db.select().from(cases).where(eq(cases.id, id));
    return case_;
  }

  async getCasesByUser(userId: number): Promise<Case[]> {
    return await db
      .select()
      .from(cases)
      .where(eq(cases.assignedAttorney, userId))
      .orderBy(desc(cases.updatedAt));
  }

  async getRecentCases(userId: number, limit: number = 3): Promise<Case[]> {
    return await db
      .select()
      .from(cases)
      .where(eq(cases.assignedAttorney, userId))
      .orderBy(desc(cases.updatedAt))
      .limit(limit);
  }

  async updateCaseLastAccessed(caseId: number): Promise<void> {
    await db
      .update(cases)
      .set({ updatedAt: new Date() })
      .where(eq(cases.id, caseId));
  }

  async createCase(insertCase: InsertCase): Promise<Case> {
    const [case_] = await db
      .insert(cases)
      .values({
        ...insertCase,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return case_;
  }

  async updateCase(id: number, updates: Partial<Case>): Promise<Case> {
    const [case_] = await db
      .update(cases)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(cases.id, id))
      .returning();
    return case_;
  }

  async searchCases(query: string): Promise<Case[]> {
    return await db
      .select()
      .from(cases)
      .where(
        or(
          like(cases.title, `%${query}%`),
          like(cases.description, `%${query}%`),
          like(cases.clientName, `%${query}%`),
          like(cases.caseNumber, `%${query}%`)
        )
      )
      .orderBy(desc(cases.updatedAt));
  }

  // Chat operations
  async getChatMessages(caseId: number): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.caseId, caseId))
      .orderBy(chatMessages.createdAt);
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await db
      .insert(chatMessages)
      .values({
        ...insertMessage,
        createdAt: new Date()
      })
      .returning();
    return message;
  }

  // Document operations
  async getDocument(id: number): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document;
  }

  async getDocumentsByCase(caseId: number): Promise<Document[]> {
    return await db
      .select()
      .from(documents)
      .where(eq(documents.caseId, caseId))
      .orderBy(desc(documents.updatedAt));
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const [document] = await db
      .insert(documents)
      .values({
        ...insertDocument,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return document;
  }

  async updateDocument(id: number, updates: Partial<Document>): Promise<Document> {
    const [document] = await db
      .update(documents)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(documents.id, id))
      .returning();
    return document;
  }

  async deleteDocument(id: number): Promise<void> {
    await db.delete(documents).where(eq(documents.id, id));
  }

  // Timeline operations
  async getTimelineEvents(caseId: number): Promise<TimelineEvent[]> {
    return await db
      .select()
      .from(caseTimeline)
      .where(eq(caseTimeline.caseId, caseId))
      .orderBy(desc(caseTimeline.eventDate));
  }

  async createTimelineEvent(insertEvent: InsertTimelineEvent): Promise<TimelineEvent> {
    const [event] = await db
      .insert(caseTimeline)
      .values({
        ...insertEvent,
        createdAt: new Date()
      })
      .returning();
    return event;
  }

  // Folder operations (simplified for database)
  async createFolder(folder: { caseId: number; name: string }): Promise<{ id: string; name: string; caseId: number }> {
    // For now, we'll use a simple approach and store folder info in document metadata
    // This can be expanded to a full folder table later if needed
    const id = `folder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return {
      id,
      name: folder.name,
      caseId: folder.caseId
    };
  }

  async getFoldersByCase(caseId: number): Promise<{ id: string; name: string; documentCount: number }[]> {
    // Simple implementation - can be enhanced with actual folder table
    return [
      { id: "folder_1", name: "Pleadings", documentCount: 0 },
      { id: "folder_2", name: "Discovery", documentCount: 0 },
      { id: "folder_3", name: "Correspondence", documentCount: 0 }
    ];
  }
}