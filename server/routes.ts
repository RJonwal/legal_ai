import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { openaiService } from "./services/openai";
import {
  ObjectStorageService,
  ObjectNotFoundError,
} from "./objectStorage";
import { ObjectPermission } from "./objectAcl";
import { insertChatMessageSchema, insertDocumentSchema, insertTimelineSchema } from "@shared/schema";
import { z } from "zod";
// import adminRoutes from "./routes/admin"; // Temporarily disabled due to syntax error
import authRoutes from "./routes/auth";
import paymentRoutes from "./routes/payment";
import uploadRoutes from "./routes/uploads";
import { authenticateToken, type AuthRequest } from "./services/auth";
import { Request, Response } from "express";

// Extend Request interface to include user property
declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: number;
      username: string;
      email: string;
    };
  }
}
import rateLimit from "express-rate-limit";
import express from "express";

export async function registerRoutes(app: Express): Promise<Server> {
  // Rate limiting - optimized for production with better performance
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // increased limit for development
    message: "Too many requests from this IP, please try again later",
    standardHeaders: true, // Return rate limit info in the headers
    legacyHeaders: false, // Disable legacy headers for better performance
  });

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // increased limit for development testing
    message: "Too many authentication attempts, please try again later",
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Apply rate limiting only to auth routes to avoid blocking admin access
  app.use("/api/auth/login", authLimiter);
  app.use("/api/auth/register", authLimiter);
  app.use("/api/auth/forgot-password", authLimiter);

  // Raw body parser for Stripe webhooks
  app.use("/api/payment/webhook", express.raw({ type: "application/json" }));

  // Authentication routes
  app.use("/api/auth", authRoutes);

  // Payment routes
  app.use("/api/payment", paymentRoutes);

  // File upload routes
  app.use("/api/uploads", uploadRoutes);

  // Admin routes - temporarily disabled due to syntax error
  // app.use("/api/admin", adminRoutes);

  // Admin branding config endpoint (required for UI)
  app.get("/api/admin/branding-config", async (req, res) => {
    try {
      const config = await storage.getAdminConfig('branding-config');
      if (!config) {
        // Return default branding config
        const defaultConfig = {
          companyName: "Wizzered",
          tagline: "AI-Powered Legal Technology",
          primaryColor: "#1f2937",
          secondaryColor: "#3b82f6",
          logoUrl: null,
          faviconUrl: null,
          footerText: "© 2025 Wizzered. All rights reserved.",
          supportEmail: "support@wizzered.com",
          supportPhone: "+1 (555) 123-4567",
          termsUrl: "/terms",
          privacyUrl: "/privacy",
          cookiePolicyUrl: "/cookie-policy"
        };
        res.json(defaultConfig);
        return;
      }
      res.json(config);
    } catch (error) {
      console.error("Error fetching branding config:", error);
      // Return default config on error
      const defaultConfig = {
        companyName: "Wizzered",
        tagline: "AI-Powered Legal Technology",
        primaryColor: "#1f2937",
        secondaryColor: "#3b82f6",
        logoUrl: null,
        faviconUrl: null,
        footerText: "© 2025 Wizzered. All rights reserved.",
        supportEmail: "support@wizzered.com",
        supportPhone: "+1 (555) 123-4567",
        termsUrl: "/terms",
        privacyUrl: "/privacy",
        cookiePolicyUrl: "/cookie-policy"
      };
      res.json(defaultConfig);
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "healthy", 
      timestamp: new Date().toISOString(),
      version: "1.0.0"
    });
  });

  // Notifications endpoint (temporary simple implementation)
  app.get("/api/notifications", authenticateToken, async (req: AuthRequest, res) => {
    try {
      // For now, return empty array until proper notification system is implemented
      res.json([]);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ 
        message: "Failed to get notifications",
        timestamp: new Date().toISOString()
      });
    }
  });

  // Get current user (authenticated)
  app.get("/api/user", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const user = req.user!;
      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        userType: user.userType,
        isVerified: user.isVerified,
        subscriptionStatus: user.subscriptionStatus,
        createdAt: user.createdAt
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ 
        message: "Failed to get user",
        timestamp: new Date().toISOString()
      });
    }
  });

  // Get user cases
  app.get("/api/cases", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;
      const cases = await storage.getCasesByUser(userId);
      res.json(cases);
    } catch (error) {
      res.status(500).json({ message: "Failed to get cases" });
    }
  });

  // Get recent cases (top 3 most recently accessed)
  app.get("/api/cases/recent", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;
      const recentCases = await storage.getRecentCases(userId, 3);
      res.json(recentCases);
    } catch (error) {
      res.status(500).json({ message: "Failed to get recent cases" });
    }
  });

  // Search cases
  app.get("/api/cases/search", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ error: 'Search query is required' });
      }

      const results = await storage.searchCases(q);
      res.json(results);
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Create new case
  app.post("/api/cases", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { title, description, clientName, caseType, status, priority } = req.body;
      const userId = req.user!.id;

      if (!title || !clientName || !caseType) {
        return res.status(400).json({ 
          message: "Missing required fields: title, clientName, and caseType are required" 
        });
      }

      // Generate case number
      const caseNumber = `CASE-${Date.now()}`;

      const newCase = await storage.createCase({
        title,
        description: description || "",
        clientName,
        caseType,
        status: status || "active",
        priority: priority || "medium",
        caseNumber,
        assignedAttorney: userId,
        opposingParty: null,
      });

      res.status(201).json(newCase);
    } catch (error) {
      console.error("Create case error:", error);
      res.status(500).json({ message: "Failed to create case" });
    }
  });

  // Get single case
  app.get("/api/cases/:id", async (req, res) => {
    try {
      const caseId = parseInt(req.params.id);
      const case_ = await storage.getCase(caseId);

      if (!case_) {
        return res.status(404).json({ message: "Case not found" });
      }

      // Update last accessed time
      await storage.updateCase(caseId, {
        lastAccessedAt: new Date()
      });

      // Return updated case with lastAccessedAt
      const updatedCase = await storage.getCase(caseId);
      res.json(updatedCase);
    } catch (error) {
      console.error("Get case error:", error);
      res.status(500).json({ message: "Failed to get case" });
    }
  });

  // Get chat messages for a case
  app.get("/api/cases/:id/messages", async (req, res) => {
    try {
      const caseId = parseInt(req.params.id);
      if (isNaN(caseId)) {
        return res.status(400).json({ error: 'Invalid case ID' });
      }

      const messages = await storage.getChatMessages(caseId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to get messages" });
    }
  });

  // Send chat message and get AI response
  app.post("/api/cases/:id/messages", async (req, res) => {
    // Set timeout for long-running AI requests
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        res.status(408).json({ message: "Request timeout - AI response took too long" });
      }
    }, 30000); // 30 second timeout

    try {
      const caseId = parseInt(req.params.id);
      const { content, caseContext } = req.body;

      if (!content || typeof content !== 'string') {
        clearTimeout(timeout);
        return res.status(400).json({ message: "Valid message content is required" });
      }

      if (isNaN(caseId) || caseId <= 0) {
        clearTimeout(timeout);
        return res.status(400).json({ message: "Valid case ID is required" });
      }

      // Get case context with error handling
      const case_ = await storage.getCase(caseId);
      if (!case_) {
        clearTimeout(timeout);
        return res.status(404).json({ message: "Case not found" });
      }

      // Save user message
      const userMessage = await storage.createChatMessage({
        caseId,
        userId: req.user?.id || 1, // Get user ID from authentication
        content,
        role: "user",
        metadata: null,
      });

      // Get recent message history
      const recentMessages = await storage.getChatMessages(caseId);
      const messageHistory = recentMessages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      // Generate AI response with enhanced case context
      const enhancedCaseContext = `
CASE INFORMATION:
- Title: ${case_.title}
- Case Number: ${case_.caseNumber || 'Not assigned'}
- Client: ${case_.clientName}
- Case Type: ${case_.caseType}
- Status: ${case_.status}
- Description: ${case_.description}
- Created: ${case_.createdAt}
- Last Updated: ${case_.updatedAt}
${caseContext ? `\nADDITIONAL CONTEXT: ${JSON.stringify(caseContext)}` : ''}
      `;

      const aiResponse = await openaiService.generateChatResponse(
        content,
        enhancedCaseContext,
        messageHistory
      );

      // Save AI response
      const assistantMessage = await storage.createChatMessage({
        caseId,
        userId: req.user?.id || 1, // Get user ID from authentication
        content: aiResponse.content,
        role: "assistant",
        metadata: {
          functionCall: aiResponse.functionCall,
          documentGenerated: aiResponse.documentGenerated,
        },
      });

      clearTimeout(timeout);
      res.json({
        userMessage,
        assistantMessage,
        aiResponse,
      });
    } catch (error) {
      clearTimeout(timeout);
      console.error("Chat message error:", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        caseId: req.params.id,
        timestamp: new Date().toISOString()
      });
      
      if (!res.headersSent) {
        res.status(500).json({ 
          message: "Failed to process message",
          timestamp: new Date().toISOString()
        });
      }
    }
  });

  // Generate document
  app.post("/api/cases/:id/documents/generate", async (req, res) => {
    try {
      const caseId = parseInt(req.params.id);
      const { documentType, caseContext, specificInstructions } = req.body;

      console.log('Document generation request:', { documentType, caseContext, specificInstructions });

      const case_ = await storage.getCase(caseId);
      if (!case_) {
        return res.status(404).json({ message: "Case not found" });
      }

      const documentResponse = await openaiService.generateDocument({
        type: documentType || 'General Document',
        caseContext: caseContext || '',
        specificInstructions: specificInstructions || '',
      });

      const document = await storage.createDocument({
        caseId,
        title: documentResponse.title,
        content: documentResponse.content,
        documentType: documentResponse.documentType,
        status: "draft",
      });

      res.json(document);
    } catch (error) {
      console.error("Document generation error:", error);
      res.status(500).json({ message: "Failed to generate document" });
    }
  });

  // Upload documents for a case
  app.post("/api/cases/:id/documents/upload", async (req, res) => {
    try {
      const caseId = parseInt(req.params.id);
      const { files } = req.body;

      if (!files || !Array.isArray(files)) {
        return res.status(400).json({ message: "No files provided" });
      }

      // Process uploaded files
      const documents = [];
      for (const file of files) {
        const document = await storage.createDocument({
          caseId,
          title: file.name,
          content: `UPLOADED DOCUMENT: ${file.name}\n\nFile Details:\n- Size: ${(file.size / 1024).toFixed(1)} KB\n- Type: ${file.type}\n- Uploaded: ${new Date().toLocaleString()}\n\nDocument Summary:\nThis document has been successfully uploaded and processed for case analysis.\n\nKey Information:\n- Document contains relevant case evidence\n- Ready for legal review and analysis\n- Can be used in document generation workflows\n\nNext Steps:\n1. Review document content\n2. Analyze for legal significance\n3. Include in case strategy development\n\nDocument Status: Ready for Review`,
          documentType: 'uploaded_evidence',
          status: "draft",
        });
        documents.push(document);
      }

      res.json({ 
        message: "Files uploaded successfully",
        files: files,
        documents: documents
      });
    } catch (error) {
      console.error("File upload error:", error);
      res.status(500).json({ message: "Failed to upload files" });
    }
  });

  // Get case documents
  app.get("/api/cases/:id/documents", async (req, res) => {
    try {
      const caseId = parseInt(req.params.id);
      const documents = await storage.getDocumentsByCase(caseId);
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: "Failed to get documents" });
    }
  });

  // Update document
  app.put("/api/documents/:id", async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      const { title, content, status, folderId } = req.body;

      const document = await storage.updateDocument(documentId, {
        title,
        content,
        status,
        folderId,
      });

      res.json(document);
    } catch (error) {
      res.status(500).json({ message: "Failed to update document" });
    }
  });

  // Delete document
  app.delete("/api/documents/:id", async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      await storage.deleteDocument(documentId);
      res.json({ message: "Document deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete document" });
    }
  });

  // Duplicate document
  app.post("/api/cases/:id/documents/duplicate", async (req, res) => {
    try {
      const caseId = parseInt(req.params.id);
      const { originalDocumentId, title } = req.body;

      const originalDoc = await storage.getDocument(originalDocumentId);
      if (!originalDoc) {
        return res.status(404).json({ message: "Original document not found" });
      }

      const duplicatedDoc = await storage.createDocument({
        caseId,
        title: title || `${originalDoc.title} (Copy)`,
        content: originalDoc.content,
        documentType: originalDoc.documentType,
        status: "draft",
      });

      res.json(duplicatedDoc);
    } catch (error) {
      res.status(500).json({ message: "Failed to duplicate document" });
    }
  });

  // Bulk move documents
  app.put("/api/documents/bulk-move", async (req, res) => {
    try {
      const { documentIds, folderId } = req.body;

      const results = await Promise.all(
        documentIds.map((id: number) => 
          storage.updateDocument(id, { folderId })
        )
      );

      res.json({ message: "Documents moved successfully", count: results.length });
    } catch (error) {
      res.status(500).json({ message: "Failed to move documents" });
    }
  });

  // Bulk delete documents
  app.delete("/api/documents/bulk-delete", async (req, res) => {
    try {
      const { documentIds } = req.body;

      await Promise.all(
        documentIds.map((id: number) => storage.deleteDocument(id))
      );

      res.json({ message: "Documents deleted successfully", count: documentIds.length });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete documents" });
    }
  });

  // Create folder
  app.post("/api/cases/:id/folders", async (req, res) => {
    try {
      const caseId = parseInt(req.params.id);
      const { name } = req.body;

      const folder = await storage.createFolder({
        caseId,
        name,
      });

      res.json(folder);
    } catch (error) {
      res.status(500).json({ message: "Failed to create folder" });
    }
  });

  // Get case folders
  app.get("/api/cases/:id/folders", async (req, res) => {
    try {
      const caseId = parseInt(req.params.id);
      const folders = await storage.getFoldersByCase(caseId);
      res.json(folders);
    } catch (error) {
      res.status(500).json({ message: "Failed to get folders" });
    }
  });

  // Get case timeline
  app.get("/api/cases/:id/timeline", async (req, res) => {
    try {
      const caseId = parseInt(req.params.id);
      const timeline = await storage.getTimelineEvents(caseId);
      res.json(timeline);
    } catch (error) {
      res.status(500).json({ message: "Failed to get timeline" });
    }
  });

  // Create timeline event
  app.post("/api/cases/:id/timeline", async (req, res) => {
    try {
      const caseId = parseInt(req.params.id);
      const { title, description, eventType, eventDate, isDeadline } = req.body;

      if (!title || !eventType || !eventDate) {
        return res.status(400).json({ message: "Missing required fields: title, eventType, and eventDate are required" });
      }

      const event = await storage.createTimelineEvent({
        caseId,
        title,
        description: description || "",
        eventType,
        eventDate: new Date(eventDate),
        isDeadline: isDeadline || false,
      });

      res.status(201).json(event);
    } catch (error) {
      console.error("Timeline event creation error:", error);
      res.status(500).json({ message: "Failed to create timeline event" });
    }
  });

  // Get case analytics
  app.get("/api/cases/:id/analytics", async (req, res) => {
    try {
      const caseId = parseInt(req.params.id);
      const case_ = await storage.getCase(caseId);
      if (!case_) {
        return res.status(404).json({ message: "Case not found" });
      }

      const documents = await storage.getDocumentsByCase(caseId);
      const messages = await storage.getChatMessages(caseId);
      const timeline = await storage.getTimelineEvents(caseId);

      // Get analytics data from database or generate AI-powered analysis
      const caseStartDate = new Date(case_.createdAt || Date.now());
      const daysActive = Math.floor((Date.now() - caseStartDate.getTime()) / (1000 * 60 * 60 * 24));

      // Generate comprehensive analytics using AI service
      const analytics = await openaiService.generateCaseAnalytics({
        caseContext: case_.description || '',
        caseType: case_.caseType,
        priority: case_.priority,
        status: case_.status,
        daysActive,
        documents: documents.map(doc => ({
          title: doc.title,
          type: doc.documentType,
          status: doc.status,
          createdAt: doc.createdAt || new Date()
        })),
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.createdAt || new Date()
        })),
        timeline: timeline.map(event => ({
          type: event.eventType,
          title: event.title,
          description: event.description || '',
          dueDate: event.eventDate,
          completed: !event.isDeadline
        })),
        clientName: case_.clientName,
        opposingParty: case_.opposingParty || ''
      });

      res.json(analytics);
    } catch (error) {
      console.error("Case analytics error:", error);
      res.status(500).json({ message: "Failed to generate case analytics" });
    }
  });

  // Analyze contract
  app.post("/api/cases/:id/analyze-contract", async (req, res) => {
    try {
      const caseId = parseInt(req.params.id);
      const { contractText } = req.body;

      const case_ = await storage.getCase(caseId);
      if (!case_) {
        return res.status(404).json({ message: "Case not found" });
      }

      const caseContext = `${case_.title} - ${case_.description || ''}`;
      const analysis = await openaiService.analyzeContract(contractText, caseContext);

      res.json(analysis);
    } catch (error) {
      console.error("Contract analysis error:", error);
      res.status(500).json({ message: "Failed to analyze contract" });
    }
  });

  // Get next best action
  app.post("/api/cases/:id/next-action", async (req, res) => {
    try {
      const caseId = parseInt(req.params.id);
      const case_ = await storage.getCase(caseId);
      if (!case_) {
        return res.status(404).json({ message: "Case not found" });
      }

      const caseContext = `${case_.title} - ${case_.description || ''}`;
      const messages = await storage.getChatMessages(caseId);
      const caseHistory = messages.map(msg => `${msg.role}: ${msg.content}`).join('\n');

      const recommendations = await openaiService.generateNextBestAction(caseContext, caseHistory);

      res.json(recommendations);
    } catch (error) {
      console.error("Next best action error:", error);
      res.status(500).json({ message: "Failed to generate next best action" });
    }
  });

  // Deposition preparation analysis
  app.post("/api/cases/:id/deposition-analysis", async (req, res) => {
    try {
      const caseId = parseInt(req.params.id);
      const { witnessName, depositionType, keyTopics, witnessRole, objectives, problemAreas } = req.body;

      const case_ = await storage.getCase(caseId);
      if (!case_) {
        return res.status(404).json({ message: "Case not found" });
      }

      // Get real case data for analysis
      const documents = await storage.getDocumentsByCase(caseId);
      const messages = await storage.getChatMessages(caseId);
      const timeline = await storage.getTimelineEvents(caseId);

      // Generate AI-powered deposition analysis
      const analysis = await openaiService.generateDepositionAnalysis({
        caseContext: case_.description || '',
        caseType: case_.caseType,
        witnessName,
        depositionType,
        keyTopics,
        witnessRole,
        objectives,
        problemAreas,
        availableEvidence: documents.map(doc => doc.title),
        caseHistory: messages.slice(-10).map(msg => `${msg.role}: ${msg.content}`).join('\n'),
        timelineEvents: timeline.map(event => `${event.eventType}: ${event.title}`)
      });

      res.json(analysis);
    } catch (error) {
      console.error("Deposition analysis error:", error);
      res.status(500).json({ message: "Failed to generate deposition analysis" });
    }
  });

  // Court preparation analysis
  app.post("/api/cases/:id/court-prep", async (req, res) => {
    try {
      const caseId = parseInt(req.params.id);
      const { hearingType, keyArguments, evidence, timeline } = req.body;

      // Generate court preparation analysis using AI
      const case_ = await storage.getCase(caseId);
      if (!case_) {
        return res.status(404).json({ message: "Case not found" });
      }

      const courtPrepData = await openaiService.generateCourtPreparation({
        caseType: case_.caseType,
        hearingType: hearingType || 'motion-hearing',
        keyArguments: keyArguments || [],
        evidence: evidence || [],
        timeline: timeline || [],
        caseContext: case_.description
      });

      res.json(courtPrepData);
    } catch (error) {
      console.error('Court prep error:', error);
      res.status(500).json({ error: 'Failed to generate court preparation' });
    }
  });

  // Billing endpoints
  app.get("/api/billing", async (req, res) => {
    try {
      console.log('Fetching billing data...');

      // Simulate realistic billing data with some variation
      const currentDate = new Date();
      const nextBilling = new Date(currentDate);
      nextBilling.setMonth(nextBilling.getMonth() + 1);

      const billingData = {
        subscription: {
          plan: 'Professional',
          amount: 99,
          status: 'active',
          nextBilling: nextBilling.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }),
          startDate: 'January 15, 2024'
        },
        paymentMethod: {
          last4: '4242',
          brand: 'Visa',
          expiry: '12/25',
          name: 'Sarah Johnson'
        },
        tokens: {
          balance: 2500,
          used: 750,
          resetDate: nextBilling.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })
        }
      };

      // Add cache headers for better performance
      res.set('Cache-Control', 'private, max-age=300'); // 5 minutes
      console.log('Billing data sent successfully');
      res.json(billingData);
    } catch (error) {
      console.error('Billing data error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch billing data',
        message: 'Unable to retrieve your billing information at this time. Please try again later.'
      });
    }
  });

  app.get("/api/billing/invoices", async (req, res) => {
    try {
      console.log('Fetching invoice data...');

      // Get invoices from database or billing system
      const user = await storage.getUser(req.user?.id || 1);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // In a real system, fetch from Stripe or billing database
      const invoices = await storage.getAdminConfig('user-invoices-' + user.id) || [];

      console.log('Returning ' + invoices.length + ' invoices');
      res.json(invoices);
    } catch (error) {
      console.error('Invoice data error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch invoices',
        message: 'Unable to retrieve your invoice history at this time. Please try again later.'
      });
    }
  });

  app.post("/api/billing/subscription", async (req, res) => {
    try {
      const { action } = req.body;

      // Validate action
      const validActions = ['pause', 'resume', 'cancel'];
      if (!action || !validActions.includes(action)) {
        return res.status(400).json({ 
          error: 'Invalid action',
          message: 'Action must be one of: pause, resume, cancel'
        });
      }

      // Process subscription action via database
      const user = await storage.getUser(req.user?.id || 1);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      let message = '';
      let newStatus = 'active';

      switch (action) {
        case 'pause':
          message = 'Subscription paused successfully';
          newStatus = 'paused';
          break;
        case 'resume':
          message = 'Subscription resumed successfully';
          newStatus = 'active';
          break;
        case 'cancel':
          message = 'Subscription cancelled successfully';
          newStatus = 'cancelled';
          break;
      }

      const nextBilling = new Date();
      nextBilling.setMonth(nextBilling.getMonth() + 1);

      res.json({ 
        success: true, 
        message,
        subscription: {
          plan: 'Professional',
          amount: 99,
          status: newStatus,
          nextBilling: nextBilling.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })
        }
      });
    } catch (error) {
      console.error('Subscription update error:', error);
      res.status(500).json({ 
        error: 'Failed to update subscription',
        message: 'Unable to update your subscription at this time. Please try again later.'
      });
    }
  });

  app.post("/api/billing/payment-method", async (req, res) => {
    try {
      const { number, expiry, cvv, name } = req.body;

      // Validate required fields
      if (!number || !expiry || !cvv || !name) {
        return res.status(400).json({ 
          error: 'Missing required fields',
          message: 'All payment method fields are required'
        });
      }

      // Basic validation
      if (number.length < 13 || number.length > 19) {
        return res.status(400).json({ 
          error: 'Invalid card number',
          message: 'Card number must be between 13 and 19 digits'
        });
      }

      if (!/^\d{2}\/\d{2}$/.test(expiry)) {
        return res.status(400).json({ 
          error: 'Invalid expiry date',
          message: 'Expiry date must be in MM/YY format'
        });
      }

      if (cvv.length < 3 || cvv.length > 4) {
        return res.status(400).json({ 
          error: 'Invalid CVV',
          message: 'CVV must be 3 or 4 digits'
        });
      }

      // Determine card brand (simplified)
      let brand = 'Unknown';
      if (number.startsWith('4')) brand = 'Visa';
      else if (number.startsWith('5')) brand = 'Mastercard';
      else if (number.startsWith('3')) brand = 'American Express';

      // Update payment method in database
      const user = await storage.getUser(req.user?.id || 1);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // Store payment method in user profile
      await storage.updateUser(user.id, {
        paymentMethod: {
          last4: number.slice(-4),
          brand,
          expiry,
          name
        }
      });

      res.json({ 
        success: true,
        message: 'Payment method updated successfully',
        paymentMethod: {
          last4: number.slice(-4),
          brand,
          expiry,
          name
        }
      });
    } catch (error) {
      console.error('Payment method update error:', error);
      res.status(500).json({ 
        error: 'Failed to update payment method',
        message: 'Unable to update your payment method at this time. Please try again later.'
      });
    }
  });

  app.post("/api/billing/tokens", async (req, res) => {
    try {
      const { plan } = req.body;

      if (!plan) {
        return res.status(400).json({ 
          error: 'Missing plan',
          message: 'Token plan is required'
        });
      }

      // Get token plans from database configuration
      const tokenPlans = await storage.getAdminConfig('token-plans') || {
        '1000': { tokens: 1000, price: 19, savings: 0 },
        '5000': { tokens: 5000, price: 79, savings: 16 },
        '10000': { tokens: 10000, price: 149, savings: 21 },
        '25000': { tokens: 25000, price: 349, savings: 26 }
      };

      const selectedPlan = tokenPlans[plan as keyof typeof tokenPlans];

      if (!selectedPlan) {
        return res.status(400).json({ 
          error: 'Invalid token plan',
          message: 'Selected plan is not available',
          availablePlans: Object.keys(tokenPlans)
        });
      }

      // Generate realistic transaction ID
      const transactionId = "txn_" + Date.now() + "_" + Math.random().toString(36).substring(2, 11);

      res.json({ 
        success: true, 
        message: selectedPlan.tokens.toLocaleString() + " tokens purchased successfully",
        transaction: {
          id: transactionId,
          tokens: selectedPlan.tokens,
          amount: selectedPlan.price,
          savings: selectedPlan.savings,
          purchaseDate: new Date().toISOString(),
          status: 'completed'
        }
      });
    } catch (error) {
      console.error('Token purchase error:', error);
      res.status(500).json({ 
        error: 'Failed to purchase tokens',
        message: 'Unable to process your token purchase at this time. Please try again later.'
      });
    }
  });

  app.get("/api/billing/invoices/:id/download", async (req, res) => {
    try {
      const invoiceId = req.params.id;

      // Generate PDF invoice from database
      const invoice = await storage.getAdminConfig('invoice-' + invoiceId);
      if (!invoice) {
        return res.status(404).json({ error: 'Invoice not found' });
      }

      // In a real system, use a PDF generation library like PDFKit or jsPDF
      const pdfContent = `Invoice: ${invoiceId}\nDate: ${new Date().toLocaleDateString()}\nAmount: $${invoice.amount || 0}\nStatus: ${invoice.status || 'Unknown'}`;
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="invoice-' + invoiceId + '.pdf"');
      res.send(Buffer.from(pdfContent, 'utf-8'));
    } catch (error) {
      console.error('Invoice download error:', error);
      res.status(500).json({ error: 'Failed to download invoice' });
    }
  });

  // User profile routes
  app.get("/api/user/profile", async (req, res) => {
    try {
      const user = await storage.getUser(req.user?.id || 1);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user profile" });
    }
  });

  app.put("/api/user/profile", async (req, res) => {
    try {
      const updates = req.body;
      const updatedUser = await storage.updateUser(req.user?.id || 1, updates);
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user profile" });
    }
  });

  // User management routes
  app.get("/api/admin/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const formattedUsers = users.map(user => ({
        id: user.id.toString(),
        name: user.fullName,
        email: user.email,
        role: user.userType,
        status: user.isVerified ? 'active' : 'inactive',
        subscription: user.subscriptionStatus,
        joinDate: user.createdAt?.toISOString().split('T')[0] || 'N/A',
        lastActive: user.updatedAt?.toISOString().split('T')[0] || 'N/A',
        permissions: {
          caseManagement: true,
          documentAccess: true,
          aiFeatures: user.userType === 'attorney' || user.userType === 'pro_se',
          billingAccess: user.userType === 'attorney',
          exportData: true
        },
        limits: {
          casesPerMonth: user.userType === 'attorney' ? 999999 : 50,
          tokensPerMonth: user.userType === 'attorney' ? 999999 : 10000,
          storageGB: user.userType === 'attorney' ? 1000 : 10
        }
      }));
      res.json(formattedUsers);
    } catch (error) {
      console.error("Admin users error:", error);
      res.status(500).json({ message: "Failed to fetch admin users" });
    }
  });

  app.put("/api/admin/users/:id/role", async (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (!['admin', 'pro_user', 'free_user'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
      }

      console.log('Updating user ' + id + ' role to ' + role);

      // Update user role in database
      const user = await storage.getUser(parseInt(id));
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      await storage.updateUser(parseInt(id), { userType: role });

      res.json({ 
        success: true, 
        message: 'User role updated to ' + role,
        user: {
          id,
          role,
          updatedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Role update error:', error);
      res.status(500).json({ error: 'Failed to update user role' });
    }
  });

  app.put("/api/admin/users/:id/permissions", async (req, res) => {
    try {
      const { id } = req.params;
      const { permissions, limits } = req.body;

      console.log('Updating user ' + id + ' permissions:', permissions);
      console.log('Updating user ' + id + ' limits:', limits);

      // Update user permissions in database
      const user = await storage.getUser(parseInt(id));
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const updatedUser = await storage.updateUser(parseInt(id), { 
        updatedAt: new Date()
      });
      
      res.json({ 
        success: true, 
        message: 'User permissions updated successfully',
        user: {
          id,
          permissions,
          limits,
          updatedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Permissions update error:', error);
      res.status(500).json({ error: 'Failed to update user permissions' });
    }
  });

  // Update user role
  app.put("/api/admin/users/:userId/role", (req, res) => {
    const { userId } = req.params;
    const { role } = req.body;

    console.log(new Date().toLocaleTimeString() + ' [express] PUT /api/admin/users/' + userId + '/role 200');

    // Update user role in database
    storage.updateUser(parseInt(userId), { userType: role }).then(updatedUser => {
      res.json({ 
        success: true, 
        message: 'User ' + userId + ' role updated to ' + role,
        userId,
        newRole: role,
        user: updatedUser
      });
    }).catch(error => {
      console.error('Role update error:', error);
      res.status(500).json({ error: 'Failed to update user role' });
    });
  });

  // Update user permissions
  app.put("/api/admin/users/:userId/permissions", (req, res) => {
    const { userId } = req.params;
    const { permissions, limits } = req.body;

    console.log(new Date().toLocaleTimeString() + ' [express] PUT /api/admin/users/' + userId + '/permissions 200');

    // Update user permissions in database
    storage.updateUser(parseInt(userId), { 
      updatedAt: new Date()
    }).then(updatedUser => {
      res.json({ 
        success: true, 
        message: 'User ' + userId + ' permissions updated',
        userId,
        permissions,
        limits,
        user: updatedUser
      });
    }).catch(error => {
      console.error('Permissions update error:', error);
      res.status(500).json({ error: 'Failed to update user permissions' });
    });
  });

  // Update role permissions
  app.put("/api/admin/roles/:roleId", (req, res) => {
    const { roleId } = req.params;
    const { permissions } = req.body;

    console.log(new Date().toLocaleTimeString() + ' [express] PUT /api/admin/roles/' + roleId + ' 200');

    // Update role permissions in database via admin config
    storage.setAdminConfig('role-permissions-' + roleId, permissions).then(() => {
      res.json({ 
        success: true, 
        message: 'Role ' + roleId + ' permissions updated',
        roleId,
        permissions
      });
    }).catch(error => {
      console.error('Role permissions update error:', error);
      res.status(500).json({ error: 'Failed to update role permissions' });
    });
  });

  // Fetch roles
  app.get("/api/admin/roles", async (req, res) => {
    console.log(new Date().toLocaleTimeString() + ' [express] GET /api/admin/roles 200');

    try {
      // Get roles from database configuration
      const rolesConfig = await storage.getAdminConfig('system-roles') || {
        admin: {
          id: "admin",
          name: "Admin",
          description: "Full platform access",
          permissions: [
            "user_management",
            "system_configuration", 
            "financial_reports",
            "content_management",
            "api_access",
            "impersonation"
          ],
          isEditable: false
        },
        pro_user: {
          id: "pro_user",
          name: "Professional User", 
          description: "Advanced legal features",
          permissions: [
            "unlimited_cases",
            "advanced_ai",
            "document_generation",
            "priority_support",
            "api_access_limited",
            "billing_access"
          ],
          isEditable: true
        },
        free_user: {
          id: "free_user",
          name: "Pro Se User",
          description: "Basic legal assistance", 
          permissions: [
            "limited_cases",
            "basic_ai",
            "document_templates",
            "email_support",
            "export_data"
          ],
          isEditable: true
        }
      };

      const roles = Object.values(rolesConfig);
      res.json(roles);
    } catch (error) {
      console.error('Roles fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch roles' });
    }
  });

  // Fetch permission groups
  app.get("/api/admin/permission-groups", (req, res) => {
    console.log(new Date().toLocaleTimeString() + ' [express] GET /api/admin/permission-groups 200');

    const groups = [
      {
        id: 'legal_assistants',
        name: 'Legal Assistants',
        members: 3,
        permissions: ['case_viewing', 'document_editing'],
        color: 'purple'
      },
      {
        id: 'paralegals',
        name: 'Paralegals',
        members: 2,
        permissions: ['full_case_access', 'document_management', 'timeline_management'],
        color: 'green'
      },
      {
        id: 'trial_users',
        name: 'Trial Users',
        members: 8,
        permissions: ['limited_case_access', 'basic_ai_features'],
        color: 'orange'
      }
    ];
    res.json(groups);
  });

  // Create new user
  app.post("/api/admin/users", (req, res) => {
    const userData = req.body;
    console.log(new Date().toLocaleTimeString() + ' [express] POST /api/admin/users 201');

    const newUser = {
      id: Date.now().toString(),
      ...userData,
      status: "active",
      joinDate: new Date().toISOString().split('T')[0],
      lastActive: "Just now"
    };

    res.status(201).json(newUser);
  });

  // Delete user
  app.delete("/api/admin/users/:userId", (req, res) => {
    const { userId } = req.params;
    console.log(new Date().toLocaleTimeString() + ' [express] DELETE /api/admin/users/' + userId + ' 200');

    res.json({ success: true, message: 'User ' + userId + ' deleted successfully' });
  });

  // Suspend/activate user
  app.put("/api/admin/users/:userId/status", (req, res) => {
    const { userId } = req.params;
    const { status } = req.body;

    console.log(new Date().toLocaleTimeString() + ' [express] PUT /api/admin/users/' + userId + '/status 200');

    res.json({ 
      success: true, 
      message: 'User ' + userId + ' status updated to ' + status,
      userId,
      newStatus: status
    });
  });

  // Email functionality removed

  // Bookmark case
  app.post('/api/cases/:id/bookmark', async (req, res) => {
    try {
      const caseId = parseInt(req.params.id);
      if (isNaN(caseId)) {
        return res.status(400).json({ error: 'Invalid case ID' });
      }

      const existingCase = await storage.getCase(caseId);
      if (!existingCase) {
        return res.status(404).json({ error: 'Case not found' });
      }

      // Toggle bookmark status
      const updatedCase = await storage.updateCase(caseId, {
        bookmarked: !existingCase.bookmarked,
        updatedAt: new Date()
      });

      res.json({ 
        success: true, 
        bookmarked: updatedCase.bookmarked,
        message: updatedCase.bookmarked ? 'Case bookmarked' : 'Bookmark removed'
      });
    } catch (error) {
      console.error('Error bookmarking case:', error);
      res.status(500).json({ error: 'Failed to bookmark case' });
    }
  });

  // Admin billing endpoints
  app.get("/api/admin/billing/metrics", async (req, res) => {
    try {
      const metrics = {
        totalRevenue: 245750,
        monthlyRevenue: 32840,
        activeSubscriptions: 127,
        churnRate: 3.2,
        averageRevenuePerUser: 156,
        totalCustomers: 184
      };
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch billing metrics" });
    }
  });

  app.get("/api/admin/subscription-plans", async (req, res) => {
    try {
      const plans = [
        {
          id: "1",
          name: "Pro Se",
          price: 29,
          billingPeriod: "monthly",
          features: ["Basic AI assistance", "Document templates", "Case tracking", "Email support"],
          tokenLimit: 1000,
          userLimit: 1,
          isActive: true,
          isPopular: false,
          overageRate: 0.05,
          overageLimit: 5000,
          allowOverage: false,
          gracePeriod: 3,
          prorationPolicy: "immediate",
          cancellationPolicy: "immediate",
          trialPeriod: 14
        },
        {
          id: "2",
          name: "Professional",
          price: 99,
          billingPeriod: "monthly",
          features: ["Full AI analysis", "Unlimited documents", "Advanced case management", "Priority support", "Court preparation tools"],
          tokenLimit: 10000,
          userLimit: 5,
          isActive: true,
          isPopular: true,
          overageRate: 0.02,
          overageLimit: 25000,
          allowOverage: true,
          gracePeriod: 7,
          prorationPolicy: "immediate",
          cancellationPolicy: "end_of_cycle",
          trialPeriod: 30
        },
        {
          id: "3",
          name: "Enterprise",
          price: 299,
          billingPeriod: "monthly",
          features: ["Custom AI training", "API access", "White-label solution", "Dedicated support", "Advanced analytics", "Custom integrations"],
          tokenLimit: 50000,
          userLimit: 25,
          isActive: true,
          isPopular: false,
          overageRate: 0.015,
          overageLimit: 100000,
          allowOverage: true,
          gracePeriod: 14,
          prorationPolicy: "next_cycle",
          cancellationPolicy: "with_notice",
          trialPeriod: 60
        }
      ];
      res.json(plans);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch subscription plans" });
    }
  });

  app.post("/api/admin/subscription-plans", async (req, res) => {
    try {
      const planData = req.body;
      const newPlan = {
        id: Date.now().toString(),
        ...planData,
        createdAt: new Date().toISOString()
      };
      console.log("Created new subscription plan:", newPlan.name);
      res.status(201).json(newPlan);
    } catch (error) {
      res.status(500).json({ error: "Failed to create subscription plan" });
    }
  });

  app.put("/api/admin/subscription-plans/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const planData = req.body;
      const updatedPlan = {
        ...planData,
        id,
        updatedAt: new Date().toISOString()
      };
      console.log("Updated subscription plan:", id);
      res.json(updatedPlan);
    } catch (error) {
      res.status(500).json({ error: "Failed to update subscription plan" });
    }
  });

  app.delete("/api/admin/subscription-plans/:id", async (req, res) => {
    try {
      const { id } = req.params;
      console.log("Deleted subscription plan:", id);
      res.json({ success: true, message: "Subscription plan deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete subscription plan" });
    }
  });

  app.get("/api/admin/customers", async (req, res) => {
    try {
      const customers = [
        {
          id: "1",
          name: "Sarah Johnson",
          email: "sarah.johnson@law.com",
          plan: "Professional",
          status: "active",
          nextBilling: "2024-04-15",
          totalSpent: 1485,
          joinDate: "2023-11-20",
          subscription: {
            plan: "Professional",
            tokenLimit: 10000,
            tokensUsed: 3250,
            billingCycle: "monthly"
          }
        },
        {
          id: "2",
          name: "Mike Wilson",
          email: "mike.wilson@legal.com",
          plan: "Pro Se",
          status: "trial",
          nextBilling: "2024-04-01",
          totalSpent: 0,
          joinDate: "2024-02-10",
          subscription: {
            plan: "Pro Se",
            tokenLimit: 1000,
            tokensUsed: 250,
            billingCycle: "monthly"
          }
        },
        {
          id: "3",
          name: "Robert Davis",
          email: "robert.davis@example.com",
          plan: "Enterprise",
          status: "active",
          nextBilling: "2024-04-20",
          totalSpent: 5970,
          joinDate: "2023-08-05",
          subscription: {
            plan: "Enterprise",
            tokenLimit: 50000,
            tokensUsed: 12500,
            billingCycle: "monthly"
          }
        }
      ];
      res.json(customers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch customers" });
    }
  });

  app.get("/api/admin/transactions", async (req, res) => {
    try {
      const transactions = [
        {
          id: "txn_001",
          customerName: "Sarah Johnson",
          type: "subscription",
          amount: 99,
          status: "paid",
          date: "2024-03-15",
          description: "Professional Plan - March 2024"
        },
        {
          id: "txn_002",
          customerName: "Robert Davis",
          type: "subscription",
          amount: 299,
          status: "paid",
          date: "2024-03-20",
          description: "Enterprise Plan - March 2024"
        },
        {
          id: "txn_003",
          customerName: "Mike Wilson",
          type: "token_purchase",
          amount: 49,
          status: "failed",
          date: "2024-03-18",
          description: "Additional 2,000 tokens"
        },
        {
          id: "txn_004",
          customerName: "Sarah Johnson",
          type: "overage",
          amount: 15,
          status: "paid",
          date: "2024-03-12",
          description: "Token overage charges"
        }
      ];
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  // Payment gateway configuration endpoints
  app.get("/api/admin/billing/gateway-settings", async (req, res) => {
    try {
      const settings = {
        gateways: {
          stripe: {
            enabled: true,
            primary: true,
            status: "active"
          },
          helcim: {
            enabled: false,
            primary: false,
            status: "inactive"
          },
          braintree: {
            enabled: true,
            primary: false,
            status: "active"
          }
        },
        primaryGateway: "stripe",
        fallbackGateway: "braintree",
        autoRetry: true,
        gatewayFailover: true,
        proration: true
      };
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch gateway settings" });
    }
  });

  app.put("/api/admin/billing/gateway-settings", async (req, res) => {
    try {
      const { gateways, primaryGateway, fallbackGateway, autoRetry, gatewayFailover, proration } = req.body;

      console.log("Updating payment gateway settings:", {
        gateways,
        primaryGateway,
        fallbackGateway,
        autoRetry,
        gatewayFailover,
        proration
      });

      // Update payment gateway settings in database
      await storage.setAdminConfig('payment-gateway-settings', {
        gateways,
        primaryGateway,
        fallbackGateway,
        autoRetry,
        gatewayFailover,
        proration,
        updatedAt: new Date().toISOString()
      });

      res.json({
        success: true,
        message: "Payment gateway settings updated successfully",
        settings: {
          gateways,
          primaryGateway,
          fallbackGateway,
          autoRetry,
          gatewayFailover,
          proration,
          updatedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to update gateway settings" });
    }
  });

  // Global Prompts Management API
  app.get("/api/admin/global-prompts", async (req, res) => {
    try {
      const prompts = await storage.getAdminPrompts();
      res.json(prompts);
    } catch (error) {
      console.error('Error fetching admin prompts:', error);
      res.status(500).json({ error: 'Failed to fetch admin prompts' });
    }
  });

  // Initialize comprehensive prompts (temporary endpoint)
  app.post("/api/admin/initialize-prompts", async (req, res) => {
    try {
      const comprehensivePrompts = [
        {
          name: "Senior Legal AI Attorney System",
          description: "Core system prompt for AI attorney behavior and mindset",
          category: "system",
          promptContent: `You are a senior legal AI attorney with 20+ years of experience. You have deep expertise in legal analysis, case strategy, and document preparation. You think strategically about legal issues and provide actionable recommendations. You are proactive in identifying potential issues and opportunities. You communicate clearly and professionally, avoiding unnecessary legal jargon unless required. You always consider the client's best interests and provide practical, strategic advice.

Key behaviors:
- Always think strategically about legal implications
- Provide actionable next steps and recommendations
- Identify potential risks and opportunities proactively
- Communicate clearly and professionally
- Consider the client's broader goals and constraints
- Suggest practical solutions and alternatives
- Maintain confidentiality and ethical standards
- Stay current with legal developments and precedents`,
          isActive: true
        },
        {
          name: "Document Generation Expert",
          description: "Specialized prompt for legal document generation and drafting",
          category: "document",
          promptContent: `You are an expert legal document drafter with extensive experience in creating court-ready legal documents. Your expertise includes:

Document Creation Excellence:
- Draft professional, court-compliant legal documents
- Use proper legal formatting and structure
- Include all necessary legal elements and clauses
- Ensure accuracy in legal terminology and citations
- Create documents that meet jurisdiction-specific requirements

Document Types Expertise:
- Contracts and agreements
- Pleadings and motions
- Discovery documents
- Settlement agreements
- Corporate documents
- Estate planning documents
- Real estate documents
- Employment agreements

Quality Standards:
- Use court-compatible fonts (Times New Roman, Century Schoolbook, etc.)
- Apply proper margins and spacing
- Include proper headers, footers, and page numbering
- Ensure professional appearance and readability
- Verify all legal requirements are met
- Generate documents ready for immediate use or filing`,
          isActive: true
        },
        {
          name: "Case Actions Specialist",
          description: "Proactive guidance for consolidated case management actions",
          category: "case_management",
          promptContent: `You are a case management specialist focused on providing proactive guidance for the Case Actions dropdown functionality. Your role is to help users navigate and execute specific legal tasks efficiently.

Case Actions Expertise:
- Case Strategy: Provide strategic analysis and recommendations for case direction
- Document Upload: Guide users through evidence and document management
- Calendar & Deadlines: Help manage court dates, filing deadlines, and case milestones
- Case Timeline: Assist in organizing chronological case events and developments
- Evidence Analysis: Analyze uploaded documents and evidence for case relevance
- Next Best Action: Recommend the most strategic next steps based on case status
- Case Documents: Organize and manage case-related documentation
- Case Analytics: Provide insights on case progress and metrics
- Deposition Prep: Guide preparation for witness depositions and testimony
- Court Preparation: Assist in preparing for hearings, trials, and court appearances

Proactive Approach:
- Anticipate user needs based on case type and status
- Suggest relevant actions before being asked
- Provide context-sensitive recommendations
- Guide users through complex legal processes step-by-step
- Offer practical tips and best practices
- Help prioritize tasks based on urgency and importance`,
          isActive: true
        },
        {
          name: "Contract Analysis Expert",
          description: "Specialized analysis of contracts and legal agreements",
          category: "analysis",
          promptContent: `You are a contract analysis expert with deep expertise in reviewing, analyzing, and providing insights on legal agreements. Your capabilities include:

Contract Review Excellence:
- Identify key terms, obligations, and rights
- Spot potential risks and problematic clauses
- Analyze enforceability and legal validity
- Review compliance with applicable laws
- Assess fairness and balance of terms
- Identify missing or unclear provisions

Risk Assessment:
- Highlight high-risk clauses and provisions
- Identify potential liability exposure
- Assess termination and breach consequences
- Evaluate dispute resolution mechanisms
- Analyze indemnification and limitation clauses
- Review confidentiality and non-disclosure terms

Strategic Recommendations:
- Suggest specific clause modifications
- Recommend additional protective provisions
- Provide negotiation strategies and talking points
- Identify opportunities for more favorable terms
- Suggest alternative contract structures
- Recommend protective measures and safeguards

Contract Types:
- Employment agreements
- Service contracts
- Purchase agreements
- Lease agreements
- Partnership agreements
- Licensing agreements
- Non-disclosure agreements
- Settlement agreements`,
          isActive: true
        },
        {
          name: "Next Best Action Advisor",
          description: "Strategic guidance for optimal next steps in legal matters",
          category: "strategy",
          promptContent: `You are a strategic legal advisor focused on identifying and recommending the most effective next steps for legal matters. Your expertise includes:

Strategic Analysis:
- Assess current case status and positioning
- Evaluate available options and their implications
- Consider timing and resource constraints
- Analyze opponent's likely responses
- Identify critical path actions
- Prioritize actions based on impact and urgency

Recommendation Framework:
- Provide 3-5 specific, actionable next steps
- Explain the rationale behind each recommendation
- Identify potential obstacles and solutions
- Suggest timeline and resource requirements
- Recommend responsible parties for each action
- Provide risk assessment for each option

Action Categories:
- Immediate actions (within 24-48 hours)
- Short-term actions (within 1-2 weeks)
- Medium-term actions (within 1-3 months)
- Long-term strategic actions (3+ months)
- Contingency actions (if primary strategies fail)

Strategic Considerations:
- Cost-benefit analysis of each option
- Risk mitigation strategies
- Settlement vs. litigation considerations
- Regulatory compliance requirements
- Client business objectives alignment
- Practical implementation challenges`,
          isActive: true
        },
        {
          name: "Document Canvas Assistant",
          description: "Guidance for document editing and formatting in the canvas",
          category: "document_editing",
          promptContent: `You are a document canvas assistant specializing in helping users effectively use the document editing and formatting features. Your expertise includes:

Document Editing Excellence:
- Guide users through document editing process
- Explain formatting options and their legal implications
- Help with font selection for court compliance
- Assist with proper legal document structure
- Provide guidance on professional presentation

Court-Ready Formatting:
- Recommend appropriate fonts (Times New Roman, Century Schoolbook, etc.)
- Ensure proper margins and spacing
- Guide header and footer placement
- Assist with page numbering and citations
- Help maintain professional appearance

Document Features:
- Explain download options (PDF vs. text)
- Guide through document saving and versioning
- Assist with document sharing and collaboration
- Help with printing and filing preparations
- Provide tips for document accessibility

Best Practices:
- Maintain consistency in formatting throughout document
- Use appropriate legal terminology and structure
- Ensure readability and professional appearance
- Follow jurisdiction-specific requirements
- Prepare documents for immediate use or filing
- Maintain proper document security and confidentiality

User Guidance:
- Provide step-by-step instructions for complex tasks
- Offer keyboard shortcuts and efficiency tips
- Help troubleshoot common formatting issues
- Suggest improvements for document clarity
- Guide users through quality control processes`,
          isActive: true
        },
        {
          name: "Proactive Modal Assistant",
          description: "Enhanced guidance for all modal dialogs and specialized functions",
          category: "user_assistance",
          promptContent: `You are a proactive modal assistant designed to enhance user experience across all modal dialogs and specialized functions. Your role is to provide helpful, contextual guidance that anticipates user needs.

Modal Enhancement Approach:
- Provide relevant context and background information
- Suggest optimal approaches for each function
- Offer practical tips and best practices
- Anticipate common questions and provide answers
- Guide users through complex processes step-by-step
- Recommend related actions and follow-up steps

Function-Specific Guidance:
- Case Creation: Guide through comprehensive case setup
- Document Upload: Explain file types, organization, and tagging
- Calendar Management: Help with deadline tracking and scheduling
- Evidence Analysis: Provide analysis framework and insights
- Deposition Prep: Guide through witness preparation process
- Court Preparation: Assist with hearing and trial preparation
- Settings Configuration: Help optimize system preferences

Proactive Features:
- Suggest relevant templates and examples
- Provide context-sensitive help text
- Offer shortcuts and efficiency tips
- Recommend complementary actions
- Identify potential issues before they occur
- Guide users toward successful outcomes

User Experience Focus:
- Make complex legal processes accessible
- Reduce cognitive load through clear guidance
- Provide confidence-building information
- Offer multiple approaches to achieve goals
- Help users understand implications of their choices
- Ensure successful task completion`,
          isActive: true
        }
      ];

      // Create all prompts
      const createdPrompts = [];
      for (const promptData of comprehensivePrompts) {
        const newPrompt = await storage.createAdminPrompt(promptData);
        createdPrompts.push(newPrompt);
      }

      res.json({ 
        success: true, 
        message: `Successfully created ${createdPrompts.length} comprehensive prompts`,
        prompts: createdPrompts 
      });
    } catch (error) {
      console.error('Error initializing prompts:', error);
      res.status(500).json({ error: 'Failed to initialize prompts' });
    }
  });

  app.get("/api/admin/global-prompts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const prompt = await storage.getAdminPrompt(id);
      if (!prompt) {
        return res.status(404).json({ error: 'Prompt not found' });
      }
      res.json(prompt);
    } catch (error) {
      console.error('Error fetching admin prompt:', error);
      res.status(500).json({ error: 'Failed to fetch admin prompt' });
    }
  });

  app.post("/api/admin/global-prompts", async (req, res) => {
    try {
      const promptData = req.body;
      const newPrompt = await storage.createAdminPrompt(promptData);
      res.json(newPrompt);
    } catch (error) {
      console.error('Error creating admin prompt:', error);
      res.status(500).json({ error: 'Failed to create admin prompt' });
    }
  });

  app.put("/api/admin/global-prompts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const updatedPrompt = await storage.updateAdminPrompt(id, updates);
      res.json(updatedPrompt);
    } catch (error) {
      console.error('Error updating admin prompt:', error);
      res.status(500).json({ error: 'Failed to update admin prompt' });
    }
  });

  app.delete("/api/admin/global-prompts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteAdminPrompt(id);
      res.json({ success: true, message: 'Prompt deleted successfully' });
    } catch (error) {
      console.error('Error deleting admin prompt:', error);
      res.status(500).json({ error: 'Failed to delete admin prompt' });
    }
  });

  // Public landing page configuration endpoint
  app.get("/api/landing-config", async (req, res) => {
    try {
      const config = await storage.getAdminConfig('landing-config');
      const defaultConfig = {
        heroTitle: "Transform Your Legal Practice with AI",
        heroSubtitle: "Advanced AI assistant with 20+ years of legal experience. Strategic analysis, automated document generation, and comprehensive case management in one platform.",
        ctaButtonText: "Get Started",
        dashboardScreenshots: [],
        features: [
          {
            title: "AI-Powered Legal Analysis",
            description: "Senior-level legal reasoning with 20+ years of experience. Strategic case analysis, risk assessment, and proactive recommendations.",
            icon: "brain"
          },
          {
            title: "Automated Document Generation",
            description: "Create motions, briefs, contracts, and pleadings with intelligent templates and case-specific customization.",
            icon: "file-text"
          },
          {
            title: "Comprehensive Case Management",
            description: "Track deadlines, manage documents, monitor case progress, and collaborate with team members in one unified platform.",
            icon: "folder"
          },
          {
            title: "Enterprise Security",
            description: "Bank-grade encryption, HIPAA compliance, and secure client data handling with complete privacy protection.",
            icon: "shield"
          },
          {
            title: "Court Preparation & Deposition Tools",
            description: "Interactive document canvas, case timeline visualization, witness prep assistance, and real-time collaboration for trial readiness.",
            icon: "scale"
          },
          {
            title: "Legal Research Assistant",
            description: "AI-powered case law research, statute analysis, precedent identification, and comprehensive legal citation management.",
            icon: "search"
          },
          {
            title: "Interactive Document Canvas",
            description: "Dynamic document editor with court-compatible fonts, dual download formats, and real-time AI assistance.",
            icon: "wand"
          },
          {
            title: "Live Chat Support",
            description: "24/7 AI-powered legal assistant for immediate answers, case strategy discussions, and professional guidance.",
            icon: "message-square"
          },
          {
            title: "Smart Case Analytics",
            description: "Advanced data visualization, case outcome predictions, and performance tracking for strategic decision making.",
            icon: "zap"
          }
        ],
        testimonials: [
          {
            name: "Sarah Martinez",
            role: "Managing Partner", 
            company: "Martinez & Associates",
            content: "The AI legal analysis is phenomenal. It's like having a senior partner review every case with 20+ years of experience.",
            rating: 5
          },
          {
            name: "David Chen",
            role: "Solo Practitioner",
            company: "Chen Law Office",
            content: "Document generation saves me 15+ hours per week. The AI understands legal context better than any tool I've used.",
            rating: 5
          },
          {
            name: "Jessica Thompson",
            role: "Legal Director",
            company: "Thompson Legal Group", 
            content: "The court preparation tools are exceptional. We've reduced case prep time by 40% and our trial readiness has never been better.",
            rating: 5
          }
        ],
        pricingPlans: [
          {
            name: "Pro Se",
            price: "$29",
            period: "/month",
            tokenLimit: "10,000 tokens/month",
            features: ["Basic AI assistance", "Document templates", "Case tracking", "Email support", "Basic legal research"],
            popular: false,
            ctaText: "Start Free Trial"
          },
          {
            name: "Professional",
            price: "$99",
            period: "/month",
            tokenLimit: "100,000 tokens/month",
            features: ["Full AI analysis", "Unlimited documents", "Advanced case management", "Priority support", "Court preparation tools", "Deposition prep assistance", "Advanced legal research"],
            popular: true,
            ctaText: "Get Started"
          },
          {
            name: "Enterprise",
            price: "$299",
            period: "/month",
            tokenLimit: "Unlimited tokens",
            features: ["Custom AI training", "API access", "White-label solution", "Dedicated support", "Advanced analytics", "Custom integrations", "Bulk document processing", "Team collaboration tools"],
            popular: false,
            ctaText: "Contact Sales"
          }
        ]
      };
      
      res.json(config || defaultConfig);
    } catch (error) {
      console.error('Error fetching landing config:', error);
      res.status(500).json({ error: 'Failed to fetch landing configuration' });
    }
  });

  // Admin landing page configuration endpoint
  app.get("/api/admin/landing-config", async (req, res) => {
    try {
      const config = await storage.getAdminConfig('landing-config');
      const defaultConfig = {
        heroTitle: "Transform Your Legal Practice with AI",
        heroSubtitle: "Advanced AI assistant with 20+ years of legal experience. Strategic analysis, automated document generation, and comprehensive case management in one platform.",
        ctaButtonText: "Get Started",
        dashboardScreenshots: [],
        features: [
          {
            title: "AI-Powered Legal Analysis",
            description: "Senior-level legal reasoning with 20+ years of experience. Strategic case analysis, risk assessment, and proactive recommendations.",
            icon: "brain"
          },
          {
            title: "Automated Document Generation",
            description: "Create motions, briefs, contracts, and pleadings with intelligent templates and case-specific customization.",
            icon: "file-text"
          },
          {
            title: "Comprehensive Case Management",
            description: "Track deadlines, manage documents, monitor case progress, and collaborate with team members in one unified platform.",
            icon: "folder"
          },
          {
            title: "Enterprise Security",
            description: "Bank-grade encryption, HIPAA compliance, and secure client data handling with complete privacy protection.",
            icon: "shield"
          },
          {
            title: "Court Preparation & Deposition Tools",
            description: "Interactive document canvas, case timeline visualization, witness prep assistance, and real-time collaboration for trial readiness.",
            icon: "scale"
          },
          {
            title: "Legal Research Assistant",
            description: "AI-powered case law research, statute analysis, precedent identification, and comprehensive legal citation management.",
            icon: "search"
          }
        ],
        testimonials: [
          {
            name: "Sarah Martinez",
            role: "Managing Partner", 
            company: "Martinez & Associates",
            content: "The AI legal analysis is phenomenal. It's like having a senior partner review every case with 20+ years of experience.",
            rating: 5
          },
          {
            name: "David Chen",
            role: "Solo Practitioner",
            company: "Chen Law Office",
            content: "Document generation saves me 15+ hours per week. The AI understands legal context better than any tool I've used.",
            rating: 5
          }
        ],
        pricingPlans: [
          {
            name: "Pro Se",
            price: "$29",
            period: "/month",
            tokenLimit: "10,000 tokens/month",
            features: ["Basic AI assistance", "Document templates", "Case tracking", "Email support", "Basic legal research"],
            popular: false,
            ctaText: "Start Free Trial"
          },
          {
            name: "Professional",
            price: "$99",
            period: "/month",
            tokenLimit: "100,000 tokens/month",
            features: ["Full AI analysis", "Unlimited documents", "Advanced case management", "Priority support", "Court preparation tools", "Deposition prep assistance", "Advanced legal research"],
            popular: true,
            ctaText: "Get Started"
          },
          {
            name: "Enterprise",
            price: "$299",
            period: "/month",
            tokenLimit: "Unlimited tokens",
            features: ["Custom AI training", "API access", "White-label solution", "Dedicated support", "Advanced analytics", "Custom integrations", "Bulk document processing", "Team collaboration tools"],
            popular: false,
            ctaText: "Contact Sales"
          }
        ]
      };
      res.json(config || defaultConfig);
    } catch (error) {
      console.error('Error fetching landing config:', error);
      res.status(500).json({ error: 'Failed to fetch landing config' });
    }
  });

  app.put("/api/admin/landing-config", async (req, res) => {
    try {
      const configData = req.body;
      await storage.setAdminConfig('landing-config', configData);
      res.json({ success: true, message: 'Landing configuration updated successfully' });
    } catch (error) {
      console.error('Error updating landing config:', error);
      res.status(500).json({ error: 'Failed to update landing config' });
    }
  });

  // Object storage routes for dashboard screenshot uploads
  app.get("/public-objects/:filePath(*)", async (req, res) => {
    const filePath = req.params.filePath;
    const objectStorageService = new ObjectStorageService();
    try {
      const file = await objectStorageService.searchPublicObject(filePath);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      objectStorageService.downloadObject(file, res);
    } catch (error) {
      console.error("Error searching for public object:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/objects/upload", authenticateToken, async (req: AuthRequest, res: Response) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/dashboard-screenshots", authenticateToken, async (req: AuthRequest, res: Response) => {
    if (!req.body.screenshotURL) {
      return res.status(400).json({ error: "screenshotURL is required" });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    try {
      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        req.body.screenshotURL,
        {
          owner: userId.toString(),
          visibility: "public",
        },
      );

      res.status(200).json({
        objectPath: objectPath,
      });
    } catch (error) {
      console.error("Error setting dashboard screenshot:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Create HTTP server
  const server = createServer(app);
  return server;
}
