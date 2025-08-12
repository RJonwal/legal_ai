import { 
  users, cases, chatMessages, documents, caseTimeline,
  type User as SchemaUser, type InsertUser,
  type Case, type InsertCase,
  type ChatMessage, type InsertChatMessage,
  type Document, type InsertDocument,
  type TimelineEvent, type InsertTimelineEvent
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, like, or, and } from "drizzle-orm";
import bcrypt from "bcryptjs";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<SchemaUser | undefined>;
  getUserByUsername(username: string): Promise<SchemaUser | undefined>;
  getUserByEmail(email: string): Promise<SchemaUser | undefined>;
  createUser(user: InsertUser): Promise<SchemaUser>;
  updateUser(id: number, updates: Partial<SchemaUser>): Promise<SchemaUser>;
  updateUserStripe(id: number, stripeCustomerId: string, stripeSubscriptionId?: string): Promise<SchemaUser>;
  verifyUser(id: number): Promise<SchemaUser>;
  updatePassword(id: number, hashedPassword: string): Promise<SchemaUser>;
  setResetToken(email: string, token: string, expiry: Date): Promise<SchemaUser | undefined>;

  // Case operations
  getCase(id: number): Promise<Case | undefined>;
  getCasesByUser(userId: number): Promise<Case[]>;
  createCase(caseData: InsertCase): Promise<Case>;
  updateCase(id: number, updates: Partial<Case>): Promise<Case>;
  searchCases(query: string): Promise<Case[]>;

  // Chat operations
  getChatMessages(caseId: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;

  // Document operations
  getDocument(id: number): Promise<Document | undefined>;
  getDocumentsByCase(caseId: number): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: number, updates: Partial<Document>): Promise<Document>;
  deleteDocument(id: number): Promise<void>;

  // Folder operations
  createFolder(folder: { caseId: number; name: string }): Promise<{ id: string; name: string; caseId: number }>;
  getFoldersByCase(caseId: number): Promise<{ id: string; name: string; documentCount: number }[]>;

  // Timeline operations
  getTimelineEvents(caseId: number): Promise<TimelineEvent[]>;
  createTimelineEvent(event: InsertTimelineEvent): Promise<TimelineEvent>;

  getRecentCases(userId: number, limit?: number): Promise<Case[]>;
  updateCaseLastAccessed(caseId: number): Promise<void>;

  // Admin operations
  getAllUsers(): Promise<SchemaUser[]>;
  getAllCases(): Promise<Case[]>;
  getUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    proUsers: number;
    growth: number;
    newThisMonth: number;
  }>;

  // Admin configuration management
  getAdminConfig(key: string): Promise<any>;
  setAdminConfig(key: string, value: any): Promise<void>;
  getAdminPages(): Promise<any[]>;
  getAdminPage(id: string): Promise<any>;
  createAdminPage(page: any): Promise<any>;
  updateAdminPage(id: string, updates: any): Promise<any>;
  deleteAdminPage(id: string): Promise<void>;
  getAdminPrompts(): Promise<any[]>;
  getAdminPrompt(id: string): Promise<any>;
  createAdminPrompt(prompt: any): Promise<any>;
  updateAdminPrompt(id: string, updates: any): Promise<any>;
  deleteAdminPrompt(id: string): Promise<void>;

  // New admin methods for all requirements
  getUserById(id: string): Promise<SchemaUser | undefined>;
  logAdminAction(action: any): Promise<void>;
  updateRolePermissions(roleId: string, permissions: string[]): Promise<void>;
  updateUserRole(userId: string, role: string): Promise<SchemaUser>;
  updateUserStatus(userId: string, status: string): Promise<SchemaUser>;
  deleteUser(userId: string): Promise<void>;
  getBillingMetrics(): Promise<any>;
  getBillingCustomers(): Promise<any[]>;
  getBillingTransactions(): Promise<any[]>;
  getSubscriptionPlans(): Promise<any[]>;
  togglePlanStatus(planId: string): Promise<any>;
  setPrimaryPlan(planId: string): Promise<void>;
}

export interface User {
  id: number;
  email: string;
  passwordHash: string;
  fullName: string;
  phone?: string;
  profilePicture?: string;
  role: string;
  subscriptionStatus: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  createdAt: Date;
  lastLogin?: Date;
  isActive: boolean;
  emailVerified: boolean;
  billingAddress?: string;
  paymentMethodId?: string;
}

export class MemStorage implements IStorage {
  private users: Map<number, SchemaUser> = new Map();
  private cases: Map<number, Case> = new Map();
  private chatMessages: Map<number, ChatMessage> = new Map();
  private documents: Map<number, Document> = new Map();
  private timelineEvents: Map<number, TimelineEvent> = new Map();
  private folders: Map<string, { id: string; name: string; caseId: number }> = new Map();

  private userIdCounter = 1;
  private caseIdCounter = 1;
  private messageIdCounter = 1;
  private documentIdCounter = 1;
  private timelineIdCounter = 1;
  private folderIdCounter = 1;

  constructor() {
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create sample user
    const sampleUser: SchemaUser = {
      id: 1,
      username: "sarah.johnson",
      email: "sarah@example.com",
      password: "password",
      fullName: "Sarah Johnson",
      role: "Senior Attorney",
      userType: "attorney",
      isVerified: false,
      resetToken: null,
      resetTokenExpiry: null,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      subscriptionStatus: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(1, sampleUser);
    this.userIdCounter = 2;

    // Create sample cases
    const sampleCase: Case = {
      id: 1,
      title: "Smith v. Johnson",
      description: "Contract dispute regarding construction project delays",
      caseNumber: "2024-CD-001",
      caseType: "Contract Dispute",
      status: "active",
      clientName: "Smith Construction LLC",
      opposingParty: "Johnson Development Corp",
      assignedAttorney: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.cases.set(1, sampleCase);

    const sampleCase2: Case = {
      id: 2,
      title: "ABC Corp Merger",
      description: "Corporate merger and acquisition legal support",
      caseNumber: "2024-MA-002",
      caseType: "Corporate Law",
      status: "active",
      clientName: "ABC Corporation",
      opposingParty: null,
      assignedAttorney: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.cases.set(2, sampleCase2);

    const sampleCase3: Case = {
      id: 3,
      title: "Estate Planning - Davis",
      description: "Comprehensive estate planning and will preparation",
      caseNumber: "2024-EP-003",
      caseType: "Estate Law",
      status: "active",
      clientName: "Robert Davis",
      opposingParty: null,
      assignedAttorney: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.cases.set(3, sampleCase3);

    this.caseIdCounter = 4;

    // Create sample documents for case 1 (Smith v. Johnson)
    const sampleDocuments: Document[] = [
      {
        id: 1,
        caseId: 1,
        title: "Construction Contract Agreement",
        content: "CONSTRUCTION CONTRACT AGREEMENT\n\nThis agreement entered into on January 15, 2024, between Smith Construction LLC (Contractor) and Johnson Development Corp (Owner).\n\nSCOPE OF WORK:\n- Complete foundation and framing by February 15, 2024\n- All work to be performed per attached specifications\n- Total contract amount: $450,000\n\nDELIVERY TERMS:\n- Project completion deadline: February 15, 2024\n- Liquidated damages: $1,667 per day for delays\n- Payment terms: 30% down, balance on completion\n\nSigned:\nSmith Construction LLC\nJohnson Development Corp",
        documentType: "contract",
        status: "final",
        createdAt: new Date("2024-01-15"),
        updatedAt: new Date("2024-01-15"),
      },
      {
        id: 2,
        caseId: 1,
        title: "Breach Notice Letter",
        content: "NOTICE OF BREACH\n\nDate: March 1, 2024\n\nTo: Johnson Development Corp\nRe: Material Breach of Construction Contract\n\nDear Mr. Johnson,\n\nThis letter serves as formal notice that you are in material breach of the Construction Agreement dated January 15, 2024.\n\nSPECIFIC BREACHES:\n1. Failure to complete work by February 15, 2024 deadline\n2. Current delay of 15 days and counting\n3. No communication regarding completion timeline\n\nDEMAND FOR CURE:\nYou have 10 days to cure this breach or we will pursue all available legal remedies.\n\nSincerely,\nSmith Construction LLC",
        documentType: "correspondence",
        status: "final",
        createdAt: new Date("2024-03-01"),
        updatedAt: new Date("2024-03-01"),
      },
      {
        id: 3,
        caseId: 1,
        title: "Damage Calculation Worksheet",
        content: "DAMAGE CALCULATION ANALYSIS\n\nProject: Smith v. Johnson Construction Dispute\nPrepared: March 5, 2024\n\nDIRECT DAMAGES:\n- Contract delay: 18 days @ $1,667/day = $30,006\n- Additional labor costs due to delay = $15,000\n- Equipment rental extension = $8,500\nSubtotal Direct Damages: $53,506\n\nCONSEQUENTIAL DAMAGES:\n- Lost opportunity costs = $25,000\n- Additional financing costs = $3,200\nSubtotal Consequential: $28,200\n\nTOTAL ESTIMATED DAMAGES: $81,706\n\nRECOMMENDATION:\nSeek settlement in range of $75,000-$85,000",
        documentType: "analysis",
        status: "draft",
        createdAt: new Date("2024-03-05"),
        updatedAt: new Date("2024-03-05"),
      },
      {
        id: 4,
        caseId: 1,
        title: "Discovery Request - Document Production",
        content: "REQUEST FOR PRODUCTION OF DOCUMENTS\n\nCase: Smith Construction LLC v. Johnson Development Corp\nCase No: 2024-CD-001\n\nTO: Defendant Johnson Development Corp\n\nPlaintiff requests production of the following documents:\n\n1. All contracts, agreements, and amendments related to the construction project\n2. All correspondence between parties from January 1, 2024 to present\n3. All payment records, invoices, and financial documents\n4. All project schedules, timelines, and progress reports\n5. All communications with subcontractors or third parties\n6. All change orders or modification requests\n7. All photographs or videos of the construction site\n\nThese documents must be produced within 30 days of service.\n\nRespectfully submitted,\nSarah Johnson, Esq.",
        documentType: "discovery",
        status: "final",
        createdAt: new Date("2024-03-10"),
        updatedAt: new Date("2024-03-10"),
      },
      {
        id: 5,
        caseId: 1,
        title: "Expert Witness Report - Construction Delays",
        content: "EXPERT WITNESS REPORT\n\nCase: Smith Construction LLC v. Johnson Development Corp\nExpert: Michael Thompson, PE\nDate: March 15, 2024\n\nQUALIFICATIONS:\n- Professional Engineer with 20 years construction experience\n- Certified Construction Manager\n- Expert in construction delay analysis\n\nOPINIONS:\n1. The February 15, 2024 completion deadline was reasonable and achievable\n2. Delays were caused by defendant's failure to provide required materials\n3. Additional costs of $53,000 were directly attributable to the delay\n4. Standard industry liquidated damages clause is enforceable\n\nCONCLUSION:\nDefendant's actions directly caused delays and resulting damages to plaintiff.\n\nMichael Thompson, PE\nLicense #12345",
        documentType: "expert_report",
        status: "final",
        createdAt: new Date("2024-03-15"),
        updatedAt: new Date("2024-03-15"),
      },
      {
        id: 6,
        caseId: 1,
        title: "Settlement Demand Letter",
        content: "SETTLEMENT DEMAND\n\nDate: March 20, 2024\n\nTo: Johnson Development Corp\nRe: Final Settlement Demand - Construction Dispute\n\nDear Counsel,\n\nThis letter constitutes our final settlement demand before filing litigation.\n\nSETTLEMENT TERMS:\n- Total demand: $75,000\n- Payment due within 15 days\n- Mutual release of all claims\n- Confidentiality agreement\n\nDAMAGE SUMMARY:\n- Contractual liquidated damages: $30,006\n- Additional costs and expenses: $23,500\n- Attorney fees and costs: $21,494\n\nIf this demand is not accepted, we will file suit seeking full damages plus attorney fees.\n\nSincerely,\nSarah Johnson, Esq.\nAttorney for Smith Construction LLC",
        documentType: "settlement",
        status: "final",
        createdAt: new Date("2024-03-20"),
        updatedAt: new Date("2024-03-20"),
      },
      {
        id: 7,
        caseId: 2,
        title: "Merger Agreement - ABC Corp",
        content: "MERGER AGREEMENT\n\nDate: February 1, 2024\nParties: ABC Corporation and XYZ Holdings\n\nTRANSACTION STRUCTURE:\n- Asset purchase agreement\n- Purchase price: $2.5 million\n- Cash at closing: $2.0 million\n- Seller financing: $500,000\n\nCLOSING CONDITIONS:\n- Due diligence completion\n- Board approvals\n- Regulatory clearances\n- Third-party consents\n\nCLOSING DATE: Target April 30, 2024\n\nKey terms subject to final due diligence and documentation.",
        documentType: "corporate",
        status: "draft",
        createdAt: new Date("2024-02-01"),
        updatedAt: new Date("2024-03-15"),
      },
      {
        id: 8,
        caseId: 3,
        title: "Last Will and Testament - Robert Davis",
        content: "LAST WILL AND TESTAMENT\n\nI, Robert Davis, being of sound mind, do hereby make this my Last Will and Testament.\n\nARTICLE I - EXECUTOR\nI nominate my daughter, Susan Davis, as Executor of this Will.\n\nARTICLE II - BEQUESTS\n1. To my wife, Mary Davis: The family residence and $500,000\n2. To my daughter, Susan Davis: 50% of remaining estate\n3. To my son, Michael Davis: 50% of remaining estate\n\nARTICLE III - TRUSTS\nEstablish education trust for grandchildren with $100,000 funding.\n\nARTICLE IV - RESIDUARY\nAll remaining property to be divided equally between children.\n\nExecuted this 10th day of March, 2024.\n\n_____________________\nRobert Davis\n\nWitnesses:\n_____________________\n_____________________",
        documentType: "will",
        status: "draft",
        createdAt: new Date("2024-03-10"),
        updatedAt: new Date("2024-03-12"),
      }
    ];

    sampleDocuments.forEach(doc => this.documents.set(doc.id, doc));
    this.documentIdCounter = 9;

    // Create sample timeline events
    const timelineEvents: TimelineEvent[] = [
      {
        id: 1,
        caseId: 1,
        title: "Contract Signed",
        description: "Initial contract agreement executed",
        eventType: "milestone",
        eventDate: new Date("2024-01-15"),
        isDeadline: false,
        createdAt: new Date(),
      },
      {
        id: 2,
        caseId: 1,
        title: "Project Delay Reported",
        description: "Client reported construction delays",
        eventType: "issue",
        eventDate: new Date("2024-02-20"),
        isDeadline: false,
        createdAt: new Date(),
      },
      {
        id: 3,
        caseId: 1,
        title: "Discovery Deadline",
        description: "All discovery materials must be submitted",
        eventType: "deadline",
        eventDate: new Date("2024-03-30"),
        isDeadline: true,
        createdAt: new Date(),
      },
    ];

    timelineEvents.forEach(event => this.timelineEvents.set(event.id, event));
    this.timelineIdCounter = 4;

    // Create sample folders
    const sampleFolders = [
      { id: "folder_1", name: "Contracts & Agreements", caseId: 1 },
      { id: "folder_2", name: "Correspondence", caseId: 1 },
      { id: "folder_3", name: "Expert Reports", caseId: 1 },
      { id: "folder_4", name: "Discovery Materials", caseId: 1 },
      { id: "folder_5", name: "Corporate Documents", caseId: 2 },
      { id: "folder_6", name: "Estate Planning", caseId: 3 },
    ];

    sampleFolders.forEach(folder => this.folders.set(folder.id, folder));
    this.folderIdCounter = 7;
  }

  async getUser(id: number): Promise<SchemaUser | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<SchemaUser | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<SchemaUser | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<SchemaUser> {
    const user: SchemaUser = {
      ...insertUser,
      id: this.userIdCounter++,
      role: insertUser.role || "attorney",
      userType: insertUser.userType || "attorney",
      isVerified: false,
      resetToken: null,
      resetTokenExpiry: null,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      subscriptionStatus: "inactive",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async getCase(id: number): Promise<Case | undefined> {
    return this.cases.get(id);
  }

  async getCasesByUser(userId: number): Promise<Case[]> {
    return Array.from(this.cases.values()).filter(
      (case_) => case_.assignedAttorney === userId
    );
  }

  async getRecentCases(userId: number, limit: number = 3): Promise<Case[]> {
    const userCases = Array.from(this.cases.values()).filter(
      (case_) => case_.assignedAttorney === userId
    );

    // Sort by lastAccessedAt (most recent first), then by updatedAt as fallback
    return userCases
      .sort((a, b) => {
        const aAccessed = (a as any).lastAccessedAt || a.updatedAt;
        const bAccessed = (b as any).lastAccessedAt || b.updatedAt;
        return new Date(bAccessed).getTime() - new Date(aAccessed).getTime();
      })
      .slice(0, limit);
  }

  async updateCaseLastAccessed(caseId: number): Promise<void> {
    const case_ = this.cases.get(caseId);
    if (case_) {
      (case_ as any).lastAccessedAt = new Date();
      this.cases.set(caseId, case_);
    }
  }

  async createCase(insertCase: InsertCase): Promise<Case> {
    const case_: Case = {
      ...insertCase,
      id: this.caseIdCounter++,
      createdAt: new Date(),
      updatedAt: new Date(),
      description: insertCase.description || null,
      status: insertCase.status || "active",
      caseNumber: insertCase.caseNumber || null,
      opposingParty: insertCase.opposingParty || null,
      assignedAttorney: insertCase.assignedAttorney || null,
    };
    this.cases.set(case_.id, case_);
    return case_;
  }

  async updateCase(id: number, updates: Partial<Case>): Promise<Case> {
    const existing = this.cases.get(id);
    if (!existing) throw new Error("Case not found");

    const updated: Case = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.cases.set(id, updated);
    return updated;
  }

  async updateUser(id: number, updates: Partial<SchemaUser>): Promise<SchemaUser> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error('User not found');
    }

    const updated: SchemaUser = {
      ...user,
      ...updates,
    };

    this.users.set(id, updated);
    return updated;
  }

  async updateUserStripe(id: number, stripeCustomerId: string, stripeSubscriptionId?: string): Promise<SchemaUser> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error('User not found');
    }

    const updated: SchemaUser = {
      ...user,
      stripeCustomerId: stripeCustomerId,
      stripeSubscriptionId: stripeSubscriptionId || null,
    };

    this.users.set(id, updated);
    return updated;
  }

  async verifyUser(id: number): Promise<SchemaUser> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error('User not found');
    }

    const updated: SchemaUser = {
      ...user,
      isVerified: true,
    };

    this.users.set(id, updated);
    return updated;
  }

  async updatePassword(id: number, hashedPassword: string): Promise<SchemaUser> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error('User not found');
    }

    const updated: SchemaUser = {
      ...user,
      password: hashedPassword,
    };

    this.users.set(id, updated);
    return updated;
  }

    async setResetToken(email: string, token: string, expiry: Date): Promise<SchemaUser | undefined> {
    const user = Array.from(this.users.values()).find(user => user.email === email);
    if (!user) {
      return undefined;
    }

    const updated: SchemaUser = {
      ...user,
      resetToken: token,
      resetTokenExpiry: expiry,
    };

    this.users.set(user.id, updated);
    return updated;
  }

  async searchCases(query: string): Promise<Case[]> {
    const allCases = Array.from(this.cases.values());

    if (!query.trim()) {
      return allCases;
    }

    const lowerQuery = query.toLowerCase();
    return allCases.filter(case_ => 
      case_.title.toLowerCase().includes(lowerQuery) ||
      (case_.description && case_.description.toLowerCase().includes(lowerQuery)) ||
      case_.clientName.toLowerCase().includes(lowerQuery)
    );
  }

  async getChatMessages(caseId: number): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(message => message.caseId === caseId)
      .sort((a, b) => {
        const aTime = a.createdAt?.getTime() || 0;
        const bTime = b.createdAt?.getTime() || 0;
        return aTime - bTime;
      });
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const message: ChatMessage = {
      ...insertMessage,
      id: this.messageIdCounter++,
      createdAt: new Date(),
      metadata: insertMessage.metadata || null,
      caseId: insertMessage.caseId || null,
      userId: insertMessage.userId || null,
    };
    this.chatMessages.set(message.id, message);
    return message;
  }

  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async getDocumentsByCase(caseId: number): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(doc => doc.caseId === caseId);
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const document: Document = {
      ...insertDocument,
      id: this.documentIdCounter++,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: insertDocument.status || "draft",
      caseId: insertDocument.caseId || null,
    };
    this.documents.set(document.id, document);
    return document;
  }

  async updateDocument(id: number, updates: Partial<Document>): Promise<Document> {
    const existing = this.documents.get(id);
    if (!existing) throw new Error("Document not found");

    const updated: Document = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.documents.set(id, updated);
    return updated;
  }

  async getTimelineEvents(caseId: number): Promise<TimelineEvent[]> {
    return Array.from(this.timelineEvents.values())
      .filter(event => event.caseId === caseId)
      .sort((a, b) => a.eventDate.getTime() - b.eventDate.getTime());
  }

  async createTimelineEvent(insertEvent: InsertTimelineEvent): Promise<TimelineEvent> {
    const event: TimelineEvent = {
      ...insertEvent,
      id: this.timelineIdCounter++,
      createdAt: new Date(),
      description: insertEvent.description || null,
      caseId: insertEvent.caseId || null,
      isDeadline: insertEvent.isDeadline || null,
    };
    this.timelineEvents.set(event.id, event);
    return event;
  }

  async deleteDocument(id: number): Promise<void> {
    this.documents.delete(id);
  }

  async createFolder(folder: { caseId: number; name: string }): Promise<{ id: string; name: string; caseId: number }> {
    const newFolder = {
      id: `folder_${this.folderIdCounter++}`,
      name: folder.name,
      caseId: folder.caseId,
    };
    this.folders.set(newFolder.id, newFolder);
    return newFolder;
  }

  async getFoldersByCase(caseId: number): Promise<{ id: string; name: string; documentCount: number }[]> {
    const caseFolders = Array.from(this.folders.values()).filter(folder => folder.caseId === caseId);

    return caseFolders.map(folder => {
      const documentCount = Array.from(this.documents.values()).filter(
        doc => doc.caseId === caseId && (doc as any).folderId === folder.id
      ).length;

      return {
        id: folder.id,
        name: folder.name,
        documentCount,
      };
    });
  }

  // Admin operations
  async getAllUsers(): Promise<SchemaUser[]> {
    return Array.from(this.users.values());
  }

  async getAllCases(): Promise<Case[]> {
    return Array.from(this.cases.values());
  }

  // New admin methods implementation
  async getUserById(id: string): Promise<SchemaUser | undefined> {
    const numId = parseInt(id);
    return this.users.get(numId);
  }

  async logAdminAction(action: any): Promise<void> {
    // In real implementation, this would log to database
    console.log('Admin action logged:', action);
  }

  async updateRolePermissions(roleId: string, permissions: string[]): Promise<void> {
    // In real implementation, this would update role permissions in database
    console.log(`Role ${roleId} permissions updated:`, permissions);
  }

  async updateUserRole(userId: string, role: string): Promise<SchemaUser> {
    const numId = parseInt(userId);
    const user = this.users.get(numId);
    if (!user) throw new Error("User not found");
    
    const updated = { ...user, userType: role, updatedAt: new Date() };
    this.users.set(numId, updated);
    return updated;
  }

  async updateUserStatus(userId: string, status: string): Promise<SchemaUser> {
    const numId = parseInt(userId);
    const user = this.users.get(numId);
    if (!user) throw new Error("User not found");
    
    const updated = { ...user, isVerified: status === 'active', updatedAt: new Date() };
    this.users.set(numId, updated);
    return updated;
  }

  async deleteUser(userId: string): Promise<void> {
    const numId = parseInt(userId);
    this.users.delete(numId);
  }

  async getBillingMetrics(): Promise<any> {
    const users = Array.from(this.users.values());
    return {
      totalRevenue: 45750,
      monthlyRevenue: 8900,
      activeSubscriptions: users.filter(u => u.subscriptionStatus === 'active').length,
      churnRate: 3.2,
      averageRevenuePerUser: 89.50,
      totalCustomers: users.length
    };
  }

  async getBillingCustomers(): Promise<any[]> {
    const users = Array.from(this.users.values());
    return users.map(user => ({
      id: user.id.toString(),
      name: user.fullName,
      email: user.email,
      plan: user.userType === 'attorney' ? 'Professional' : 'Pro Se',
      status: user.subscriptionStatus || 'inactive',
      nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      totalSpent: Math.floor(Math.random() * 2000) + 100,
      joinDate: user.createdAt?.toISOString().split('T')[0] || '2024-01-01'
    }));
  }

  async getBillingTransactions(): Promise<any[]> {
    return [
      {
        id: 'txn_001',
        customer: 'Sarah Johnson',
        amount: 99.00,
        status: 'completed',
        date: '2024-01-15',
        plan: 'Professional'
      },
      {
        id: 'txn_002', 
        customer: 'John Smith',
        amount: 29.00,
        status: 'completed',
        date: '2024-01-14',
        plan: 'Pro Se'
      }
    ];
  }

  async getSubscriptionPlans(): Promise<any[]> {
    return [
      {
        id: 'pro_se_plan',
        name: 'Pro Se',
        price: 29,
        billingPeriod: 'monthly',
        features: ['Basic AI assistance', 'Document templates', 'Case tracking', 'Email support'],
        isActive: true,
        isPopular: false,
        isPrimary: false
      },
      {
        id: 'professional_plan',
        name: 'Professional',
        price: 99,
        billingPeriod: 'monthly', 
        features: ['Full AI analysis', 'Unlimited documents', 'Advanced case management', 'Priority support', 'Court preparation tools'],
        isActive: true,
        isPopular: true,
        isPrimary: true
      }
    ];
  }

  async togglePlanStatus(planId: string): Promise<any> {
    // In real implementation, toggle plan status in database
    const plans = await this.getSubscriptionPlans();
    const plan = plans.find(p => p.id === planId);
    if (plan) {
      plan.isActive = !plan.isActive;
    }
    return plan;
  }

  async setPrimaryPlan(planId: string): Promise<void> {
    // In real implementation, set primary plan in database
    console.log(`Setting primary plan to: ${planId}`);
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

  // Admin configuration management - Memory storage implementation
  async getAdminConfig(key: string): Promise<any> {
    // For memory storage, we'll use a simple in-memory store
    return null; // Placeholder - would need actual implementation
  }

  async setAdminConfig(key: string, value: any): Promise<void> {
    // For memory storage, we'll use a simple in-memory store
    // Placeholder - would need actual implementation
  }

  async getAdminPages(): Promise<any[]> {
    // Return some default pages for memory storage
    return [];
  }

  async getAdminPage(id: string): Promise<any> {
    return null;
  }

  async createAdminPage(page: any): Promise<any> {
    return page;
  }

  async updateAdminPage(id: string, updates: any): Promise<any> {
    return { id, ...updates };
  }

  async deleteAdminPage(id: string): Promise<void> {
    // Placeholder
  }

  async getAdminPrompts(): Promise<any[]> {
    return [];
  }

  async getAdminPrompt(id: string): Promise<any> {
    return null;
  }

  async createAdminPrompt(prompt: any): Promise<any> {
    return prompt;
  }

  async updateAdminPrompt(id: string, updates: any): Promise<any> {
    return { id, ...updates };
  }

  async deleteAdminPrompt(id: string): Promise<void> {
    // Placeholder
  }
}

import { DatabaseStorage } from "./database-storage";

export const storage = new DatabaseStorage();