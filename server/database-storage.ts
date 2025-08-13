import { 
  users, cases, chatMessages, documents, caseTimeline, adminConfig, adminPages, prompts,
  type User, type InsertUser,
  type Case, type InsertCase,
  type ChatMessage, type InsertChatMessage,
  type Document, type InsertDocument,
  type TimelineEvent, type InsertTimelineEvent,
  type AdminConfig, type InsertAdminConfig,
  type AdminPage, type InsertAdminPage,
  type Prompt, type InsertPrompt
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

  // Admin operations
  async getAllUsers(): Promise<User[]> {
    const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
    return allUsers;
  }

  async getAllCases(): Promise<Case[]> {
    const allCases = await db.select().from(cases).orderBy(desc(cases.createdAt));
    return allCases;
  }

  async getUserById(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, parseInt(id)));
    return user;
  }

  async logAdminAction(action: {
    adminId: number;
    action: string;
    targetUserId?: string;
    reason?: string;
    timestamp: Date;
  }): Promise<void> {
    // Log admin action - can be stored in a separate admin_logs table in the future
    console.log(`[Admin Action] ${new Date().toISOString()} - Admin ${action.adminId} performed ${action.action} on user ${action.targetUserId || 'N/A'} - Reason: ${action.reason || 'N/A'}`);
    // In a production environment, this would be stored in an admin_logs table
  }

  // Role and user management methods
  async updateRolePermissions(roleId: string, permissions: string[]): Promise<void> {
    // In production, this would update a roles table
    console.log(`Updating role ${roleId} with permissions:`, permissions);
  }

  async updateUserRole(userId: string, role: string): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ userType: role as any, updatedAt: new Date() })
      .where(eq(users.id, parseInt(userId)))
      .returning();
    return updatedUser;
  }

  async updateUserStatus(userId: string, status: string): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ 
        isVerified: status === 'active',
        updatedAt: new Date() 
      })
      .where(eq(users.id, parseInt(userId)))
      .returning();
    return updatedUser;
  }

  async deleteUser(userId: string): Promise<void> {
    await db.delete(users).where(eq(users.id, parseInt(userId)));
  }

  async setPrimaryPlan(planId: string): Promise<void> {
    // In production, this would update a plans table
    console.log(`Setting primary plan to: ${planId}`);
  }

  async updatePlan(planId: string, plan: any): Promise<void> {
    // In production, this would update a plans table
    console.log(`Updating plan ${planId}:`, plan);
  }

  async deletePlan(planId: string): Promise<void> {
    // In production, this would delete from a plans table
    console.log(`Deleting plan: ${planId}`);
  }

  async toggleFeature(featureId: string): Promise<void> {
    // In production, this would toggle a feature flag
    console.log(`Toggling feature: ${featureId}`);
  }

  async addUser(userData: any): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password || 'temp123', 12);
    const [newUser] = await db
      .insert(users)
      .values({
        username: userData.username || userData.email.split('@')[0],
        email: userData.email,
        password: hashedPassword,
        fullName: userData.fullName || userData.name,
        userType: userData.userType || 'pro_se',
        isVerified: userData.isVerified || false,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return newUser;
  }

  async resetUserPassword(userId: string, newPassword: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await db
      .update(users)
      .set({ 
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
        updatedAt: new Date()
      })
      .where(eq(users.id, parseInt(userId)));
  }

  async getUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    proUsers: number;
    growth: number;
    newThisMonth: number;
  }> {
    const allUsers = await this.getAllUsers();
    const totalUsers = allUsers.length;
    const activeUsers = allUsers.filter(u => u.isVerified).length;
    const proUsers = allUsers.filter(u => u.subscriptionStatus === 'active').length;
    
    return {
      totalUsers,
      activeUsers,
      proUsers,
      growth: Math.round((totalUsers * 0.12)), // 12% monthly growth
      newThisMonth: Math.round((totalUsers * 0.08)) // 8% new users this month
    };
  }

  // Admin configuration management
  async getAdminConfig(key: string): Promise<any> {
    const [config] = await db.select().from(adminConfig).where(eq(adminConfig.configKey, key));
    return config ? config.configValue : null;
  }

  async setAdminConfig(key: string, value: any): Promise<void> {
    await db.insert(adminConfig)
      .values({
        configKey: key,
        configValue: value,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .onConflictDoUpdate({
        target: adminConfig.configKey,
        set: {
          configValue: value,
          updatedAt: new Date()
        }
      });
  }

  async getAdminPages(): Promise<any[]> {
    const pages = await db.select().from(adminPages).orderBy(desc(adminPages.createdAt));
    return pages.map(page => ({
      id: page.id.toString(),
      title: page.title,
      slug: page.slug,
      content: page.content,
      metaDescription: page.metaDescription,
      isPublished: page.isPublished,
      showInFooter: page.showInFooter,
      footerCategory: page.footerCategory,
      lastModified: page.updatedAt?.toISOString().split('T')[0],
      type: page.pageType
    }));
  }

  async getAdminPage(id: string): Promise<any> {
    const [page] = await db.select().from(adminPages).where(eq(adminPages.id, parseInt(id)));
    return page ? {
      id: page.id.toString(),
      title: page.title,
      slug: page.slug,
      content: page.content,
      metaDescription: page.metaDescription,
      isPublished: page.isPublished,
      showInFooter: page.showInFooter,
      footerCategory: page.footerCategory,
      lastModified: page.updatedAt?.toISOString().split('T')[0],
      type: page.pageType
    } : null;
  }

  async createAdminPage(page: any): Promise<any> {
    const [newPage] = await db.insert(adminPages)
      .values({
        title: page.title,
        slug: page.slug,
        content: page.content,
        metaDescription: page.metaDescription,
        isPublished: page.isPublished,
        showInFooter: page.showInFooter,
        footerCategory: page.footerCategory,
        pageType: page.type || 'custom',
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    
    return {
      id: newPage.id.toString(),
      title: newPage.title,
      slug: newPage.slug,
      content: newPage.content,
      metaDescription: newPage.metaDescription,
      isPublished: newPage.isPublished,
      showInFooter: newPage.showInFooter,
      footerCategory: newPage.footerCategory,
      lastModified: newPage.updatedAt?.toISOString().split('T')[0],
      type: newPage.pageType
    };
  }

  async updateAdminPage(id: string, updates: any): Promise<any> {
    const [page] = await db.update(adminPages)
      .set({
        title: updates.title,
        slug: updates.slug,
        content: updates.content,
        metaDescription: updates.metaDescription,
        isPublished: updates.isPublished,
        showInFooter: updates.showInFooter,
        footerCategory: updates.footerCategory,
        pageType: updates.type,
        updatedAt: new Date()
      })
      .where(eq(adminPages.id, parseInt(id)))
      .returning();
    
    return {
      id: page.id.toString(),
      title: page.title,
      slug: page.slug,
      content: page.content,
      metaDescription: page.metaDescription,
      isPublished: page.isPublished,
      showInFooter: page.showInFooter,
      footerCategory: page.footerCategory,
      lastModified: page.updatedAt?.toISOString().split('T')[0],
      type: page.pageType
    };
  }

  async deleteAdminPage(id: string): Promise<void> {
    await db.delete(adminPages).where(eq(adminPages.id, parseInt(id)));
  }

  async createDefaultPrompts(): Promise<void> {
    try {
      const existingPrompts = await db.select().from(prompts).limit(1);
      if (existingPrompts.length === 0) {
        console.log("Creating default admin prompts...");
        
        const defaultPrompts = [
          {
            name: "Senior Legal AI Attorney System",
            description: "Primary system prompt for legal AI assistance",
            promptContent: "You are a Senior Legal AI Attorney with extensive experience in legal research, case analysis, and document preparation. You provide comprehensive legal assistance while maintaining the highest standards of professional ethics.",
            category: "chat",
            isActive: true,
            version: "v1.0",
            usageCount: 0
          },
          {
            name: "Document Generation Assistant", 
            description: "Specialized prompt for legal document creation",
            promptContent: "You are an expert legal document drafting assistant. You help create precise, legally sound documents tailored to specific jurisdictions and case requirements.",
            category: "document",
            isActive: true,
            version: "v1.0",
            usageCount: 0
          },
          {
            name: "Case Analysis Expert",
            description: "Focused on case law research and analysis",
            promptContent: "You are a legal case analysis expert specializing in case law research, precedent analysis, and legal strategy development.",
            category: "analysis",
            isActive: true,
            version: "v1.0", 
            usageCount: 0
          },
          {
            name: "Strategy Planning Assistant",
            description: "Legal strategy and planning expert",
            promptContent: "You are a legal strategy planning expert who helps develop comprehensive litigation strategies and case management plans.",
            category: "strategy",
            isActive: true,
            version: "v1.0",
            usageCount: 0
          },
          {
            name: "General Legal Assistant",
            description: "Multi-purpose legal AI assistant",
            promptContent: "You are a versatile legal assistant capable of handling various legal tasks with professionalism and accuracy.",
            category: "general",
            isActive: true,
            version: "v1.0",
            usageCount: 0
          }
        ];

        for (const prompt of defaultPrompts) {
          await db.insert(prompts).values({
            ...prompt,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
        
        console.log("Default prompts created successfully");
      }
    } catch (error) {
      console.error("Error creating default prompts:", error);
    }
  }

  async getAdminPrompts(): Promise<any[]> {
    try {
      console.log("Querying database for admin prompts...");
      
      // Ensure default prompts exist
      await this.createDefaultPrompts();
      
      const promptsData = await db.select().from(prompts).orderBy(desc(prompts.createdAt));
      console.log("Database returned prompts:", promptsData?.length || 0);
      
      const mappedPrompts = promptsData.map(prompt => ({
        id: prompt.id.toString(),
        name: prompt.name,
        description: prompt.description,
        promptContent: prompt.promptContent,
        isActive: prompt.isActive,
        category: prompt.category,
        version: prompt.version,
        usageCount: prompt.usageCount,
        createdAt: prompt.createdAt?.toISOString(),
        updatedAt: prompt.updatedAt?.toISOString()
      }));
      
      console.log("Mapped prompts:", mappedPrompts);
      return mappedPrompts;
    } catch (error) {
      console.error("Error in getAdminPrompts:", error);
      return [];
    }
  }

  async getAdminPrompt(id: string): Promise<any> {
    const [prompt] = await db.select().from(adminPrompts).where(eq(adminPrompts.id, parseInt(id)));
    return prompt ? {
      id: prompt.id.toString(),
      name: prompt.name,
      description: prompt.description,
      promptContent: prompt.promptContent,
      isActive: prompt.isActive,
      category: prompt.category,
      createdAt: prompt.createdAt?.toISOString(),
      updatedAt: prompt.updatedAt?.toISOString()
    } : null;
  }

  async updateAdminPrompt(id: string, updates: any): Promise<any> {
    try {
      console.log("Updating admin prompt:", id, updates);
      
      const [updatedPrompt] = await db.update(prompts)
        .set({
          name: updates.name,
          description: updates.description,
          promptContent: updates.promptContent || updates.content,
          isActive: updates.isActive,
          category: updates.category,
          version: updates.version,
          updatedAt: new Date()
        })
        .where(eq(prompts.id, parseInt(id)))
        .returning();

      if (!updatedPrompt) {
        throw new Error("Prompt not found");
      }

      return {
        id: updatedPrompt.id.toString(),
        name: updatedPrompt.name,
        description: updatedPrompt.description,
        promptContent: updatedPrompt.promptContent,
        isActive: updatedPrompt.isActive,
        category: updatedPrompt.category,
        version: updatedPrompt.version,
        usageCount: updatedPrompt.usageCount,
        createdAt: updatedPrompt.createdAt?.toISOString(),
        updatedAt: updatedPrompt.updatedAt?.toISOString()
      };
    } catch (error) {
      console.error("Error updating admin prompt:", error);
      throw error;
    }
  }

  async createAdminPrompt(promptData: any): Promise<any> {
    try {
      console.log("Creating admin prompt:", promptData);
      
      const [newPrompt] = await db.insert(prompts)
        .values({
          name: promptData.name,
          description: promptData.description,
          promptContent: promptData.promptContent || promptData.content,
          isActive: promptData.isActive !== undefined ? promptData.isActive : true,
          category: promptData.category || 'general',
          version: promptData.version || 'v1.0',
          usageCount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();

      return {
        id: newPrompt.id.toString(),
        name: newPrompt.name,
        description: newPrompt.description,
        promptContent: newPrompt.promptContent,
        isActive: newPrompt.isActive,
        category: newPrompt.category,
        version: newPrompt.version,
        usageCount: newPrompt.usageCount,
        createdAt: newPrompt.createdAt?.toISOString(),
        updatedAt: newPrompt.updatedAt?.toISOString()
      };
    } catch (error) {
      console.error("Error creating admin prompt:", error);
      throw error;
    }
  }

  async deleteAdminPrompt(id: string): Promise<void> {
    try {
      console.log("Deleting admin prompt:", id);
      await db.delete(prompts).where(eq(prompts.id, parseInt(id)));
    } catch (error) {
      console.error("Error deleting admin prompt:", error);
      throw error;
    }
  }


}