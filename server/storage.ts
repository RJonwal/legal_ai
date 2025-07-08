import { 
  users, cases, chatMessages, documents, caseTimeline,
  type User, type InsertUser,
  type Case, type InsertCase,
  type ChatMessage, type InsertChatMessage,
  type Document, type InsertDocument,
  type TimelineEvent, type InsertTimelineEvent
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;

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

  // Timeline operations
  getTimelineEvents(caseId: number): Promise<TimelineEvent[]>;
  createTimelineEvent(event: InsertTimelineEvent): Promise<TimelineEvent>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private cases: Map<number, Case> = new Map();
  private chatMessages: Map<number, ChatMessage> = new Map();
  private documents: Map<number, Document> = new Map();
  private timelineEvents: Map<number, TimelineEvent> = new Map();
  
  private userIdCounter = 1;
  private caseIdCounter = 1;
  private messageIdCounter = 1;
  private documentIdCounter = 1;
  private timelineIdCounter = 1;

  constructor() {
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create sample user
    const sampleUser: User = {
      id: 1,
      username: "sarah.johnson",
      password: "password",
      fullName: "Sarah Johnson",
      role: "Senior Attorney",
      createdAt: new Date(),
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
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      ...insertUser,
      id: this.userIdCounter++,
      createdAt: new Date(),
      role: insertUser.role || "attorney",
    };
    this.users.set(user.id, user);
    return user;
  }

  async getCase(id: number): Promise<Case | undefined> {
    return this.cases.get(id);
  }

  async getCasesByUser(userId: number): Promise<Case[]> {
    return Array.from(this.cases.values()).filter(case_ => case_.assignedAttorney === userId);
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

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error('User not found');
    }

    const updated: User = {
      ...user,
      ...updates,
    };

    this.users.set(id, updated);
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
}

export const storage = new MemStorage();
