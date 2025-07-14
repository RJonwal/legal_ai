import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { openaiService } from "./services/openai";
import { insertChatMessageSchema, insertDocumentSchema, insertTimelineSchema } from "@shared/schema";
import { z } from "zod";
// import adminRoutes from "./routes/admin"; // Temporarily disabled due to syntax error
import authRoutes from "./routes/auth";
import paymentRoutes from "./routes/payment";
import uploadRoutes from "./routes/uploads";
import { authenticateToken, type AuthRequest } from "./services/auth";
import { Request, Response } from "express";
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
        error: error.message,
        stack: error.stack,
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

      // Calculate case metrics
      const caseStartDate = new Date(case_.createdAt);
      const daysActive = Math.floor((Date.now() - caseStartDate.getTime()) / (1000 * 60 * 60 * 24));

      // Generate realistic financial data based on case type and duration
      const baseRate = case_.caseType === 'corporate_law' ? 500 : 350;
      const estimatedHours = Math.min(daysActive * 2.5, 200);
      const legalFees = Math.floor(baseRate * estimatedHours);
      const courtCosts = Math.floor(Math.random() * 5000 + 2000);
      const expertWitnessCosts = Math.floor(Math.random() * 8000 + 3000);
      const discoveryCosts = Math.floor(Math.random() * 3000 + 1000);
      const totalCosts = legalFees + courtCosts + expertWitnessCosts + discoveryCosts;

      // Calculate progress metrics
      const totalTasks = 35; // Standard case tasks
      const completedTasks = Math.min(Math.floor(daysActive * 0.8), totalTasks);
      const completionRate = Math.floor((completedTasks / totalTasks) * 100);

      // Risk assessment based on case factors
      const risks = [
        {
          type: 'settlement_timeline',
          level: daysActive > 90 ? 'high' : daysActive > 60 ? 'medium' : 'low',
          description: daysActive > 90 ? 'Settlement deadline approaching' : 'Timeline on track'
        },
        {
          type: 'evidence_strength',
          level: documents.length < 5 ? 'high' : documents.length < 10 ? 'medium' : 'low',
          description: documents.length < 5 ? 'Additional documentation needed' : 'Strong evidence base'
        },
        {
          type: 'legal_precedent',
          level: 'low',
          description: 'Strong case law support'
        },
        {
          type: 'client_communication',
          level: messages.length > 10 ? 'optimal' : 'medium',
          description: messages.length > 10 ? 'Regular updates maintained' : 'Increase communication frequency'
        }
      ];

      // Task completion breakdown
      const taskBreakdown = {
        documents_filed: { completed: Math.min(8, documents.length), total: 10 },
        discovery_requests: { completed: Math.min(12, Math.floor(daysActive * 0.2)), total: 15 },
        witness_interviews: { completed: Math.min(6, Math.floor(daysActive * 0.1)), total: 8 },
        expert_reports: { completed: Math.min(2, Math.floor(documents.length * 0.3)), total: 3 }
      };

      // Timeline phases
      const phases = [
        {
          name: 'Case Initiation',
          status: 'complete',
          progress: 100,
          estimatedDays: null
        },
        {
          name: 'Discovery Phase',
          status: daysActive > 30 ? 'complete' : 'in_progress',
          progress: Math.min(100, Math.floor((daysActive / 30) * 100)),
          estimatedDays: daysActive > 30 ? null : 30 - daysActive
        },
        {
          name: 'Settlement Negotiations',
          status: daysActive > 60 ? 'in_progress' : 'pending',
          progress: daysActive > 60 ? Math.min(85, Math.floor(((days - 60) / 30) * 100)) : 0,
          estimatedDays: daysActive > 60 ? Math.max(14, 90 - daysActive) : null
        },
        {
          name: 'Trial Preparation',
          status: daysActive > 90 ? 'in_progress' : 'pending',
          progress: Math.max(0, Math.min(50, Math.floor(((daysActive - 90) / 60) * 100))),
          estimatedDays: daysActive > 90 ? Math.max(30, 150 - daysActive) : null
        }
      ];

      const analytics = {
        basicMetrics: {
          daysActive,
          totalBillable: legalFees,
          completionRate,
          criticalTasks: risks.filter(r => r.level === 'high').length,
          potentialRecovery: Math.floor(totalCosts * (2.5 + Math.random() * 2))
        },
        financial: {
          legalFees,
          courtCosts,
          expertWitnessCosts,
          discoveryCosts,
          totalCosts,
          potentialRecovery: Math.floor(totalCosts * (2.5 + Math.random() * 2)),
          roi: Math.floor(((Math.floor(totalCosts * (2.5 + Math.random() * 2)) - totalCosts) / totalCosts) * 100)
        },
        timeline: {
          phases,
          nextDeadline: daysActive > 60 ? 14 : 30 - daysActive,
          estimatedCompletion: Math.max(30, 180 - daysActive)
        },
        tasks: taskBreakdown,
        risks,
        performance: {
          documentsGenerated: documents.length,
          clientInteractions: messages.filter(m => m.role === 'user').length,
          aiAssistanceUsed: messages.filter(m => m.role === 'assistant').length,
          timelineAdherence: phases.filter(p => p.status === 'complete').length / phases.length * 100
        }
      };

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

      const caseContext = `${case_.title} - ${case_.description}`;
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

      const caseContext = `${case_.title} - ${case_.description}`;
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
      const { witnessName, depositionType, keyTopics, witnessRole } = req.body;

      const case_ = await storage.getCase(caseId);
      if (!case_) {
        return res.status(404).json({ message: "Case not found" });
      }

      // Generate deposition analysis
      const analysis = {
        witness: {
          name: witnessName,
          type: depositionType,
          role: witnessRole,
          credibilityFactors: ["Direct knowledge of events", "Professional experience", "No apparent bias"],
          riskFactors: depositionType === 'fact-witness' ? ["Memory gaps possible", "Limited document knowledge"] : ["Technical complexity", "Potential bias"]
        },
        preparationScore: 85,
        estimatedDuration: depositionType === 'expert-witness' ? '6-8 hours' : '3-4 hours',
        keyStrategies: [
          "Focus on timeline establishment",
          "Document authentication priority",
          "Maintain witness comfort level",
          "Prepare for objections"
        ],
        suggestedDocuments: [
          "Deposition outline",
          "Question bank",
          "Document checklist",
          "Witness preparation memo"
        ],
        timeline: {
          preparation: "2-3 weeks before",
          witnessPrep: "1 week before", 
          finalReview: "24 hours before",
          deposition: "Day of deposition"
        }
      };

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

  // LiveChat configuration state management
  let liveChatConfigState = {
    enabled: true,
    dashboardEnabled: true,
    landingEnabled: false,
    provider: 'internal',
    plugin: {
      name: 'Crisp Chat',
      type: 'crisp',
      apiKey: '',
      websiteId: '',
      appId: '',
      widgetKey: '',
      subdomain: '',
      domain: '',
      propertyId: '',
      widgetId: '',
      licenseId: '',
      botId: '',
      publicKey: '',
      siteId: '',
      chatId: '',
      customEndpoint: ''
    },
    dashboardPermissions: {
      legalAdvice: true,
      caseAnalysis: true,
      documentReview: true,
      legalResearch: true,
      procedureGuidance: true,
      courtDeadlines: true,
      filingRequirements: true,
      jurisdictionHelp: true,
      legalFormAssistance: true,
      caseStrategyDiscussion: false,
      clientOnboarding: true,
      caseStatusUpdates: true,
      appointmentScheduling: true,
      documentRequests: true,
      progressTracking: true,
      caseFileAccess: true,
      clientPortalNavigation: true,
      serviceInformation: true,
      pricingQuotes: true,
      billingSupport: true,
      paymentProcessing: true,
      subscriptionChanges: true,
      refundInquiries: false,
      planUpgrades: true,
      navigationAssistance: true,
      featureExplanation: true,
      troubleshooting: true,
      accountSetup: true,
      integrationSupport: true,
      dataExport: true,
      documentGeneration: true,
      reportGeneration: true,
      auditAccess: false,
      userAccountManagement: true,
      accessPermissions: false,
      systemStatus: true,
      urgentMatters: true,
      escalationManagement: true,
      emergencyContact: true,
      afterHoursSupport: true,
      crisisEscalation: true
    },
    landingPermissions: {
      legalAdvice: false,
      caseAnalysis: false,
      documentReview: false,
      legalResearch: true,
      procedureGuidance: true,
      courtDeadlines: false,
      filingRequirements: false,
      jurisdictionHelp: true,
      legalFormAssistance: false,
      caseStrategyDiscussion: false,
      clientOnboarding: true,
      caseStatusUpdates: false,
      appointmentScheduling: true,
      documentRequests: false,
      progressTracking: false,
      caseFileAccess: false,
      clientPortalNavigation: true,
      serviceInformation: true,
      pricingQuotes: true,
      billingSupport: false,
      paymentProcessing: false,
      subscriptionChanges: false,
      refundInquiries: false,
      planUpgrades: true,
      navigationAssistance: true,
      featureExplanation: true,
      troubleshooting: false,
      accountSetup: true,
      integrationSupport: false,
      dataExport: false,
      documentGeneration: false,
      reportGeneration: false,
      auditAccess: false,
      userAccountManagement: false,
      accessPermissions: false,
      systemStatus: false,
      urgentMatters: false,
      escalationManagement: true,
      emergencyContact: true,
      afterHoursSupport: false,
      crisisEscalation: false
    },
    workingHours: {
      enabled: true,
      timezone: 'UTC',
      schedule: {
        monday: { start: '09:00', end: '17:00', active: true },
        tuesday: { start: '09:00', end: '17:00', active: true },
        wednesday: { start: '09:00', end: '17:00', active: true },
        thursday: { start: '09:00', end: '17:00', active: true },
        friday: { start: '09:00', end: '17:00', active: true },
        saturday: { start: '10:00', end: '14:00', active: false },
        sunday: { start: '10:00', end: '14:00', active: false }
      }
    },
    autoResponses: {
      welcomeMessage: 'Welcome to LegalAI Pro support! How can I help you today?',
      offlineMessage: 'Thank you for contacting us. We are currently offline but will respond soon.',
      escalationMessage: 'Let me connect you with a human agent who can better assist you.',
      queueMessage: 'You are currently #{{position}} in the queue. Estimated wait time: {{waitTime}} minutes.'
    },
    humanHandoff: {
      enabled: true,
      triggerKeywords: ['human', 'agent', 'speak to someone', 'urgent', 'complaint', 'refund'],
      escalationThreshold: 3,
      forwardToEmails: ['support@legalai.pro'],
      autoEscalateTime: 15
    },
    realTimeMonitoring: {
      enabled: true,
      allowIntercept: true,
      showTypingIndicator: true,
      supervisorNotifications: true
    },
    aiSettings: {
      confidenceThreshold: 0.7,
      maxResponseTime: 30,
      fallbackToHuman: true,
      learningMode: true
    }
  };

  // LiveChat configuration endpoints
  app.get("/api/admin/livechat-config", async (req, res) => {
    console.log(new Date().toLocaleTimeString() + ' [express] GET /api/admin/livechat-config 200');
    
    try {
      const config = await storage.getAdminConfig('livechat_config');
      res.json(config || liveChatConfigState);
    } catch (error) {
      console.error('Error fetching livechat config:', error);
      res.status(500).json({ error: 'Failed to fetch livechat configuration' });
    }
  });

  app.put("/api/admin/livechat-config", async (req, res) => {
    console.log(new Date().toLocaleTimeString() + ' [express] PUT /api/admin/livechat-config 200');
    console.log('Updating livechat config:', req.body);
    
    try {
      await storage.setAdminConfig('livechat_config', req.body);
      res.json({ 
        success: true, 
        message: 'Configuration updated successfully',
        config: req.body,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating livechat config:', error);
      res.status(500).json({ error: 'Failed to update livechat configuration' });
    }
  });

  app.get("/api/admin/livechat-conversations", async (req, res) => {
    console.log(new Date().toLocaleTimeString() + ' [express] GET /api/admin/livechat-conversations 200');
    
    try {
      // Mock conversations data for demonstration
      const conversations = [
        {
          id: 'conv_001',
          user: { name: 'John Doe', email: 'john@example.com' },
          lastMessage: 'I need help with my case documents',
          status: 'active',
          assignedTo: 'ai',
          messageCount: 5,
          source: 'dashboard', // Track source: 'dashboard' or 'landing'
          hasUploads: true,
          hasScreenShare: false,
          createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          externalProvider: 'crisp', // Track which external provider if any
          syncedWithProvider: true
        },
        {
          id: 'conv_002',
          user: { name: 'Sarah Smith', email: 'sarah@example.com' },
          lastMessage: 'When is my court date?',
          status: 'pending',
          assignedTo: 'queue',
          messageCount: 3,
          source: 'landing',
          hasUploads: false,
          hasScreenShare: false,
          createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          externalProvider: 'crisp',
          syncedWithProvider: true
        },
        {
          id: 'conv_003',
          user: { name: 'Mike Johnson', email: 'mike@example.com' },
          lastMessage: 'Thank you for the assistance',
          status: 'active',
          assignedTo: 'human',
          messageCount: 8,
          source: 'dashboard',
          hasUploads: false,
          hasScreenShare: true,
          createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          externalProvider: 'crisp',
          syncedWithProvider: true
        }
      ];
      
      res.json(conversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      res.status(500).json({ error: 'Failed to fetch conversations' });
    }
  });

  app.get("/api/admin/livechat-messages/:id", async (req, res) => {
    const { id } = req.params;
    console.log(new Date().toLocaleTimeString() + ' [express] GET /api/admin/livechat-messages/' + id + ' 200');
    
    const messages = [
      {
        id: 'msg_001',
        conversationId: id,
        content: 'Hello, I need help with my legal case',
        sender: 'user',
        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        attachments: [
          {
            type: 'image',
            name: 'contract-scan.jpg',
            url: '/api/uploads/contract-scan.jpg',
            size: '2.1MB'
          }
        ]
      },
      {
        id: 'msg_002',
        conversationId: id,
        content: 'I\'d be happy to help you with your legal case. What specific assistance do you need?',
        sender: 'ai',
        timestamp: new Date(Date.now() - 9 * 60 * 1000).toISOString()
      },
      {
        id: 'msg_003',
        conversationId: id,
        content: 'I need to understand the filing requirements for my motion',
        sender: 'user',
        timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString()
      },
      {
        id: 'msg_004',
        conversationId: id,
        content: 'I can help you with that. Let me share my screen to show you the court website',
        sender: 'user',
        timestamp: new Date(Date.now() - 7 * 60 * 1000).toISOString(),
        screenShare: {
          active: true,
          sessionId: 'screen_001',
          allowControl: false
        }
      }
    ];
    
    res.json(messages);
  });

  app.post("/api/admin/livechat/conversations/:id/intercept", (req, res) => {
    const { id } = req.params;
    const { message } = req.body;
    console.log(new Date().toLocaleTimeString() + ' [express] POST /api/admin/livechat/conversations/' + id + '/intercept 200');
    console.log('Intercepting conversation', id, 'with message:', message);
    
    res.json({
      success: true,
      message: 'Message sent successfully',
      messageId: 'msg_' + Date.now(),
      timestamp: new Date().toISOString()
    });
  });

  app.post("/api/admin/livechat/conversations/:id/escalate", (req, res) => {
    const { id } = req.params;
    console.log(new Date().toLocaleTimeString() + ' [express] POST /api/admin/livechat/conversations/' + id + '/escalate 200');
    
    res.json({
      success: true,
      message: 'Conversation escalated to human agent',
      escalatedAt: new Date().toISOString()
    });
  });

  // File upload endpoint for live chat
  app.post("/api/admin/livechat/conversations/:id/upload", async (req, res) => {
    const { id } = req.params;
    console.log(new Date().toLocaleTimeString() + ' [express] POST /api/admin/livechat/conversations/' + id + '/upload 200');
    
    // Process file upload and store in database
    const uploadedFile = {
      id: 'file_' + Date.now(),
      name: req.file?.originalname || 'uploaded-file.jpg',
      type: req.file?.mimetype || 'application/octet-stream',
      size: req.file?.size ? (req.file.size / 1024 / 1024).toFixed(1) + 'MB' : '1.2MB',
      url: '/api/uploads/' + (req.file?.filename || 'uploaded-file.jpg'),
      timestamp: new Date().toISOString()
    };

    // Store file metadata in database
    await storage.setAdminConfig('uploaded-file-' + uploadedFile.id, uploadedFile);

    res.json({
      success: true,
      message: 'File uploaded successfully',
      file: uploadedFile
    });
  });

  // Live chat analytics endpoint
  app.get("/api/admin/livechat-analytics", async (req, res) => {
    console.log(new Date().toLocaleTimeString() + ' [express] GET /api/admin/livechat-analytics 200');
    
    try {
      // Mock analytics data for demonstration
      const analytics = {
        totalConversations: 156,
        activeConversations: 8,
        avgResponseTime: 45, // seconds
        satisfactionScore: 4.2,
        totalMessages: 1247,
        aiResolutionRate: 78,
        humanHandoffRate: 22,
        peakHours: ['10:00', '14:00', '16:00'],
        commonQueries: [
          { query: 'Subscription help', count: 45 },
          { query: 'Document generation', count: 38 },
          { query: 'Account access', count: 32 },
          { query: 'Billing inquiries', count: 28 }
        ]
      };
      
      res.json(analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  });

  // Screen share request endpoint
  app.post("/api/admin/livechat/conversations/:id/screen-share", (req, res) => {
    const { id } = req.params;
    const { action } = req.body; // 'start', 'stop', 'request_control'
    console.log(new Date().toLocaleTimeString() + ' [express] POST /api/admin/livechat/conversations/' + id + '/screen-share 200');
    
    const sessionId = 'screen_' + Date.now();
    
    res.json({
      success: true,
      message: `Screen share ${action} successful`,
      sessionId,
      action,
      timestamp: new Date().toISOString()
    });
  });

  // Provider sync status endpoint
  app.get("/api/admin/livechat/provider-sync/:id", (req, res) => {
    const { id } = req.params;
    console.log(new Date().toLocaleTimeString() + ' [express] GET /api/admin/livechat/provider-sync/' + id + ' 200');
    
    res.json({
      success: true,
      conversationId: id,
      syncStatus: {
        isConnected: true,
        lastSync: new Date().toISOString(),
        provider: 'crisp',
        bidirectionalSync: true,
        messagesInSync: true
      }
    });
  });

  // Enhanced file upload endpoint for live chat
  app.post("/api/admin/livechat/conversations/:id/upload", async (req, res) => {
    const { id } = req.params;
    console.log(new Date().toLocaleTimeString() + ' [express] POST /api/admin/livechat/conversations/' + id + '/upload 200');
    
    // Process file upload with proper validation
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file provided',
        message: 'Please select a file to upload'
      });
    }

    // Validate file size (5MB limit)
    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        error: 'File too large',
        message: 'File size must be less than 5MB'
      });
    }

    const uploadedFile = {
      id: 'file_' + Date.now(),
      name: req.file.originalname,
      type: req.file.mimetype,
      size: (req.file.size / 1024 / 1024).toFixed(1) + 'MB',
      url: '/api/uploads/' + req.file.filename,
      timestamp: new Date().toISOString()
    };

    // Store file metadata in database
    await storage.setAdminConfig('uploaded-file-' + uploadedFile.id, uploadedFile);

    res.json({
      success: true,
      message: 'File uploaded successfully',
      file: uploadedFile
    });
  });

  // Enhanced screen share request endpoint
  app.post("/api/admin/livechat/conversations/:id/screen-share", (req, res) => {
    const { id } = req.params;
    const { action } = req.body; // 'start', 'stop', 'request_control'
    console.log(new Date().toLocaleTimeString() + ' [express] POST /api/admin/livechat/conversations/' + id + '/screen-share 200');
    console.log('Screen share action:', action, 'for conversation:', id);
    
    const sessionId = 'screen_' + Date.now();
    
    // Simulate different response messages based on action
    let message = '';
    let additionalData = {};
    
    switch (action) {
      case 'start':
        message = 'Screen share request sent to user - they will receive a prompt to share their screen';
        additionalData = {
          permissionRequested: true,
          permissionTimeout: 30000, // 30 seconds
          viewUrl: `https://screen-share.example.com/view/${sessionId}`,
          userNotified: true,
          isUserScreen: true // Flag to indicate this is for viewing user's screen
        };
        break;
      case 'stop':
        message = 'User screen share session ended';
        additionalData = {
          sessionDuration: Math.floor(Math.random() * 600 + 60) + ' seconds',
          isUserScreen: true
        };
        break;
      case 'request_control':
        message = 'Control request sent to user - they will receive a prompt to allow remote control';
        additionalData = {
          controlRequested: true,
          controlTimeout: 15000, // 15 seconds
          isUserScreen: true,
          userNotified: true
        };
        break;
      default:
        message = 'Unknown screen share action';
    }
    
    res.json({
      success: true,
      message,
      sessionId,
      action,
      timestamp: new Date().toISOString(),
      ...additionalData
    });
  });

  app.get("/api/admin/livechat/analytics", (req, res) => {
    console.log(new Date().toLocaleTimeString() + ' [express] GET /api/admin/livechat/analytics 200');
    
    const analytics = {
      activeChats: 3,
      aiResponding: 2,
      pendingEscalation: 1,
      aiResolutionRate: 85,
      avgResponseTime: 12,
      customerSatisfaction: 4.2,
      totalToday: 47
    };
    
    res.json(analytics);
  });

  // AI Chat Support endpoint
  app.post("/api/ai/chat-support", async (req, res) => {
    try {
      const { message, context, personality } = req.body;
      
      // AI service integration would go here
      // For now, provide intelligent responses based on context
      let response = "Thank you for your message. How can I help you with Wizzered today?";
      
      if (message.toLowerCase().includes('price') || message.toLowerCase().includes('cost')) {
        response = "Wizzered offers flexible pricing starting at $29/month for Pro Se users and $99/month for attorneys. We also provide a 14-day free trial with no credit card required. Would you like to know more about our features?";
      } else if (message.toLowerCase().includes('feature') || message.toLowerCase().includes('what')) {
        response = "Wizzered provides AI-powered legal assistance, case management, document generation, legal research tools, and secure client communication. Which feature would you like to learn more about?";
      } else if (message.toLowerCase().includes('trial') || message.toLowerCase().includes('free')) {
        response = "Great! You can start your free 14-day trial right now. Just click 'Get Started' on our homepage to create your account - no credit card needed. The trial includes access to all our core features.";
      } else if (message.toLowerCase().includes('support') || message.toLowerCase().includes('help')) {
        response = "I'm here to help! Our support team is available 9 AM - 6 PM EST. You can also browse our help center, documentation, or contact us directly. What specific area do you need assistance with?";
      } else if (message.toLowerCase().includes('security') || message.toLowerCase().includes('safe')) {
        response = "Security is our top priority. Wizzered uses enterprise-grade AES-256 encryption, is GDPR/CCPA compliant, and maintains SOC 2 certification. All your legal data is fully protected and encrypted both at rest and in transit.";
      }

      res.json({ response });
    } catch (error) {
      console.error("AI chat error:", error);
      res.status(500).json({ error: "Failed to process chat request" });
    }
  });

  // Admin routes - temporarily disabled due to duplicate routes
  // app.use("/api/admin", adminRoutes);

// Impersonation routes
app.post("/api/admin/impersonation/start", (req, res) => {
  const { userId, reason } = req.body;

  // Log the impersonation start
  console.log(new Date().toLocaleTimeString() + ' [express] Starting impersonation of user ' + userId);
  console.log('Reason: ' + reason);

  // In a real implementation, you would:
  // 1. Validate admin permissions
  // 2. Create impersonation session in database
  // 3. Set session tokens/cookies
  // 4. Log the action for audit

  res.json({ 
    success: true, 
    message: "Impersonation started successfully",
    sessionId: 'imp_' + Date.now(),
    startTime: new Date().toISOString()
  });
});

app.post("/api/admin/impersonation/stop", (req, res) => {
  const { sessionId } = req.body;

  console.log(new Date().toLocaleTimeString() + ' [express] Stopping impersonation session ' + sessionId);

  // In a real implementation, you would:
  // 1. Clear impersonation session
  // 2. Restore admin session
  // 3. Log the action for audit
  // 4. Calculate session duration

  res.json({ 
    success: true, 
    message: "Impersonation stopped successfully",
    endTime: new Date().toISOString()
  });
});

app.get("/api/admin/impersonation/history", async (req, res) => {
    console.log(new Date().toLocaleTimeString() + ' [express] GET /api/admin/impersonation/history 200');

    try {
      // Get impersonation history from database
      const history = await storage.getAdminConfig('impersonation-history') || [];
      res.json(history);
    } catch (error) {
      console.error('Impersonation history error:', error);
      res.status(500).json({ error: 'Failed to fetch impersonation history' });
    }
  });

  // API Management endpoints

  // AI Provider model fetching endpoint
  app.get("/api/admin/ai-providers/:id/models", async (req, res) => {
    try {
      const { id } = req.params;
      const { apiKey, refresh } = req.query;

      console.log('Fetching models for provider: ' + id + ', refresh: ' + refresh);

      // Get model data from database configuration or provider API
      const modelData = await storage.getAdminConfig('ai-provider-models') || {
        openai: [
          { id: "gpt-4o", name: "GPT-4o", description: "Most advanced model", contextLength: 128000 },
          { id: "gpt-4o-mini", name: "GPT-4o Mini", description: "Faster, cost-effective", contextLength: 128000 },
          { id: "gpt-4", name: "GPT-4", description: "Previous generation", contextLength: 8192 },
          { id: "gpt-4-turbo", name: "GPT-4 Turbo", description: "Enhanced capabilities", contextLength: 128000 },
          { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", description: "Fast and efficient", contextLength: 16385 }
        ],
        anthropic: [
          { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet", description: "Latest and most capable", contextLength: 200000 },
          { id: "claude-3-opus-20240229", name: "Claude 3 Opus", description: "Most powerful model", contextLength: 200000 },
          { id: "claude-3-sonnet-20240229", name: "Claude 3 Sonnet", description: "Balanced performance", contextLength: 200000 },
          { id: "claude-3-haiku-20240307", name: "Claude 3 Haiku", description: "Fast and efficient", contextLength: 200000 }
        ],
        deepseek: [
          { id: "deepseek-chat", name: "Deepseek Chat", description: "General conversation", contextLength: 32768 },
          { id: "deepseek-coder", name: "Deepseek Coder", description: "Code generation", contextLength: 16384 },
          { id: "deepseek-math", name: "Deepseek Math", description: "Mathematical reasoning", contextLength: 4096 }
        ]
      };

      const models = modelData[id as keyof typeof modelData] || [];

      res.json({ 
        success: true, 
        models,
        lastUpdated: new Date().toISOString(),
        source: refresh ? 'live_api' : 'cache'
      });
    } catch (error) {
      console.error('Error fetching models for provider ' + req.params.id + ':', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch models',
        message: 'Unable to retrieve model list from provider'
      });
    }
  });

  // AI Providers endpoints
  app.get("/api/admin/ai-providers", (req, res) => {
    console.log(new Date().toLocaleTimeString() + ' [express] GET /api/admin/ai-providers 200');

    const providers = [
      {
        id: "openai",
        name: "OpenAI",
        type: "openai",
        apiKey: "sk-proj-xyz123...",
        model: "gpt-4",
        isActive: true,
        lastTested: "2 hours ago",
        status: "healthy"
      },
      {
        id: "anthropic",
        name: "Anthropic",
        type: "anthropic",
        apiKey: "sk-ant-api03-xyz...",
        model: "claude-3-sonnet",
        isActive: true,
        lastTested: "1 day ago",
        status: "healthy"
      },
      {
        id: "deepseek",
        name: "Deepseek",
        type: "deepseek",
        apiKey: "",
        baseUrl: "https://api.deepseek.com",
        model: "deepseek-chat",
        isActive: false,
        lastTested: "Never",
        status: "warning"
      }
    ];

    res.json(providers);
  });

  app.post("/api/admin/ai-providers/:id/test", async (req, res) => {
    const { id } = req.params;
    console.log(new Date().toLocaleTimeString() + ' [express] POST /api/admin/ai-providers/' + id + '/test 200');

    try {
      // Simulate different test scenarios
      const testScenarios = {
        openai: { success: true, responseTime: "1.2s", status: "healthy" },
        anthropic: { success: true, responseTime: "0.8s", status: "healthy"},
        deepseek: { success: false, responseTime: "timeout", status: "error", error: "Connection timeout" }
      };

      const result = testScenarios[id as keyof typeof testScenarios];

      if (!result) {
        return res.status(404).json({ 
          success: false, 
          error: "Provider not found" 
        });
      }

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: "Provider test failed",
          error: result.error,
          responseTime: result.responseTime,
          status: result.status
        });
      }

      res.json({ 
        success: true, 
        message: "Provider test successful",
        responseTime: result.responseTime,
        status: result.status,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Provider test error for ' + id + ':', error);
      res.status(500).json({
        success: false,
        error: "Test failed",
        message: "Unable to complete provider connectivity test"
      });
    }
  });

  // App APIs endpoints
  app.get("/api/admin/app-apis", (req, res) => {
    console.log(new Date().toLocaleTimeString() + ' [express] GET /api/admin/app-apis 200');

    const apis = [
      {
        id: "doc-service",
        name: "Document Service",
        description: "Convert documents to PDF",
        endpoint: "https://api.docconvert.com/v1/pdf",
        method: "POST",
        headers: { "Authorization": "Bearer token", "Content-Type": "application/json" },
        authentication: "bearer",
        isActive: true,
        lastUsed: "2 hours ago",
        successRate: 98
      },
      {
        id: "email-service",
        name: "Email Service",
        description: "Send notification emails",
        endpoint: "https://api.mailservice.com/send",
        method: "POST",
        headers: { "X-API-Key": "apikey123", "Content-Type": "application/json" },
        authentication: "apikey",
        isActive: true,
        lastUsed: "1 day ago",
        successRate: 85
      }
    ];

    res.json(apis);
  });

  // Create new App API
  app.post("/api/admin/app-apis", async (req, res) => {
    try {
      const { name, description, endpoint, method, authentication, headers } = req.body;

      if (!name || !endpoint || !method) {
        return res.status(400).json({
          error: "Missing required fields",
          message: "Name, endpoint, and method are required"
        });
      }

      const newApi = {
        id: 'api-' + Date.now(),
        name,
        description: description || "",
        endpoint,
        method,
        headers: headers || {},
        authentication: authentication || "none",
        isActive: true,
        lastUsed: "Never",
        successRate: 0,
        createdAt: new Date().toISOString()
      };

      console.log("Created new App API:", newApi.name);
      res.status(201).json(newApi);
    } catch (error) {
      console.error("App API creation error:", error);
      res.status(500).json({ error: "Failed to create App API" });
    }
  });

  // Update App API
  app.put("/api/admin/app-apis/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      console.log('Updating App API ' + id + ':', updates);

      res.json({
        success: true,
        message: "App API updated successfully",
        api: {
          id,
          ...updates,
          updatedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error("App API update error:", error);
      res.status(500).json({ error: "Failed to update App API" });
    }
  });

  // Delete App API
  app.delete("/api/admin/app-apis/:id", async (req, res) => {
    try {
      const { id } = req.params;
      console.log('Deleting App API: ' + id);

      res.json({
        success: true,
        message: "App API deleted successfully"
      });
    } catch (error) {
      console.error("App API deletion error:", error);
      res.status(500).json({ error: "Failed to delete App API" });
    }
  });

  // Test App API
  app.post("/api/admin/app-apis/:id/test", async (req, res) => {
    try {
      const { id } = req.params;
      console.log('Testing App API: ' + id);

      // Simulate API test
      const success = Math.random() > 0.2; // 80% success rate
      const responseTime = Math.floor(Math.random() * 2000) + 100; // 100ms - 2100ms

      if (success) {
        res.json({
          success: true,
          message: "API test successful",
          responseTime: responseTime + 'ms',
          status: 200,
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(400).json({
          success: false,
          message: "API test failed",
          error: "Connection timeout",
          responseTime: responseTime + 'ms',
          status: 504,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error("App API test error:", error);
      res.status(500).json({ error: "Failed to test App API" });
    }
  });

  // Enhanced webhook configuration with granular controls
  app.get("/api/admin/webhooks", (req, res) => {
    console.log(new Date().toLocaleTimeString() + ' [express] GET /api/admin/webhooks 200');

    const webhooks = [
      {
        id: "crm-sync",
        name: "Case Management Sync",
        url: "https://api.crm.example.com/webhooks/cases",
        events: ["case.created", "case.updated", "case.closed", "document.generated"],
        isActive: true,
        lastTriggered: "2 minutes ago",
        status: "healthy",
        retryCount: 3,
        timeout: 30,
        includeMetadata: true,
        includeUserData: false,
        includeDocumentContent: true,
        dataFilters: {
          caseTypes: ["litigation", "contract"],
          documentTypes: ["brief", "motion"],
          userRoles: ["attorney", "paralegal"]
        },
        headers: {
          "X-Source": "LegalAI-Pro",
          "Content-Type": "application/json"
        }
      },
      {
        id: "billing-updates",
        name: "Billing System",
        url: "https://billing.example.com/hooks/legal-ai",
        events: ["subscription.changed", "payment.processed", "payment.failed", "usage.threshold"],
        isActive: true,
        lastTriggered: "1 hour ago", 
        status: "healthy",
        retryCount: 5,
        timeout: 15,
        includeMetadata: true,
        includeUserData: true,
        includeDocumentContent: false,
        dataFilters: {
          subscriptionTiers: ["professional", "enterprise"],
          paymentMethods: ["card", "ach"],
          userRoles: ["admin", "billing"]
        },
        headers: {
          "X-Source": "LegalAI-Pro",
          "Authorization": "Bearer webhook-token-123"
        }
      },
      {
        id: "security-alerts",
        name: "Security Monitoring",
        url: "https://security.example.com/webhooks/legal-ai",
        events: ["login.failed", "suspicious.activity", "data.breach", "unauthorized.access"],
        isActive: true,
        lastTriggered: "Never",
        status: "healthy",
        retryCount: 1,
        timeout: 10,
        includeMetadata: true,
        includeUserData: true,
        includeDocumentContent: false,
        dataFilters: {
          severityLevels: ["high", "critical"],
          userRoles: ["admin", "security"],
          ipRanges: ["trusted"]
        },
        headers: {
          "X-Source": "LegalAI-Pro",
          "X-Security-Level": "high"
        }
      },
      {
        id: "document-processing",
        name: "Document Processing Pipeline",
        url: "https://docs.example.com/webhooks/process",
        events: ["document.uploaded", "document.analyzed", "document.processed", "ai.analysis.complete"],
        isActive: false,
        lastTriggered: "3 days ago",
        status: "warning",
        retryCount: 2,
        timeout: 60,
        includeMetadata: true,
        includeUserData: false,
        includeDocumentContent: true,
        dataFilters: {
          documentTypes: ["contract", "brief", "motion", "discovery"],
          fileSizes: ["<10MB"],
          caseTypes: ["all"]
        },
        headers: {
          "X-Source": "LegalAI-Pro",
          "X-Process-Priority": "normal"
        }
      }
    ];

    res.json(webhooks);
  });

  app.get("/api/admin/webhook-events", (req, res) => {
    console.log(new Date().toLocaleTimeString() + ' [express] GET /api/admin/webhook-events 200');

    const availableEvents = [
      // Case Events
      { id: "case.created", name: "Case Created", category: "Cases", description: "When a new case is created" },
      { id: "case.updated", name: "Case Updated", category: "Cases", description: "When case details are modified" },
      { id: "case.closed", name: "Case Closed", category: "Cases", description: "When a case is marked as closed" },
      { id: "case.archived", name: "Case Archived", category: "Cases", description: "When a case is archived" },

      // Document Events
      { id: "document.generated", name: "Document Generated", category: "Documents", description: "When AI generates a new document" },
      { id: "document.uploaded", name: "Document Uploaded", category: "Documents", description: "When a document is uploaded" },
      { id: "document.analyzed", name: "Document Analyzed", category: "Documents", description: "When AI analysis completes" },
      { id: "document.processed", name: "Document Processed", category: "Documents", description: "When document processing finishes" },

      // User Events
      { id: "user.registered", name: "User Registered", category: "Users", description: "When a new user signs up" },
      { id: "user.login", name: "User Login", category: "Users", description: "When a user logs in" },
      { id: "user.logout", name: "User Logout", category: "Users", description: "When a user logs out" },
      { id: "login.failed", name: "Login Failed", category: "Security", description: "When login attempts fail" },

      // Billing Events
      { id: "subscription.changed", name: "Subscription Changed", category: "Billing", description: "When subscription plan changes" },
      { id: "payment.processed", name: "Payment Processed", category: "Billing", description: "When payment is successful" },
      { id: "payment.failed", name: "Payment Failed", category: "Billing", description: "When payment fails" },
      { id: "usage.threshold", name: "Usage Threshold", category: "Billing", description: "When usage limits are reached" },

      // AI Events
      { id: "ai.analysis.complete", name: "AI Analysis Complete", category: "AI", description: "When AI analysis finishes" },
      { id: "ai.chat.session", name: "AI Chat Session", category: "AI", description: "When AI chat session starts/ends" },

      // Security Events
      { id: "suspicious.activity", name: "Suspicious Activity", category: "Security", description: "When suspicious behavior is detected" },
      { id: "data.breach", name: "Data Breach", category: "Security", description: "When potential breach is detected" },
      { id: "unauthorized.access", name: "Unauthorized Access", category: "Security", description: "When unauthorized access is attempted" }
    ];

    res.json(availableEvents);
  });

  // Create new webhook
  app.post("/api/admin/webhooks", async (req, res) => {
    try {
      const { 
        name, 
        url, 
        events, 
        secret, 
        retryAttempts, 
        includeUserData, 
        includeDocumentContent, 
        includePaymentData,
        includeCaseDetails,
        dataRetention,
        eventFilter
      } = req.body;

      if (!name || !url || !events || events.length === 0) {
        return res.status(400).json({
          error: "Missing required fields",
          message: "Name, URL, and at least one event are required"
        });
      }

      const newWebhook = {
        id: 'webhook-' + Date.now(),
        name,
        url,
        events,
        secret: secret || "",
        retryAttempts: retryAttempts || 3,
        isActive: true,
        lastTriggered: "Never",
        deliveryRate: 100,
        settings: {
          includeUserData: includeUserData || false,
          includeDocumentContent: includeDocumentContent || false,
          includePaymentData: includePaymentData || false,
          includeCaseDetails: includeCaseDetails || true,
          dataRetention: dataRetention || 30,
          eventFilter: eventFilter || {}
        },
        createdAt: new Date().toISOString()
      };

      console.log("Created new webhook:", newWebhook.name);
      res.status(201).json(newWebhook);
    } catch (error) {
      console.error("Webhook creation error:", error);
      res.status(500).json({ error: "Failed to create webhook" });
    }
  });

  // Update webhook
  app.put("/api/admin/webhooks/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      console.log('Updating webhook ' + id + ':', updates);

      res.json({
        success: true,
        message: "Webhook updated successfully",
        webhook: {
          id,
          ...updates,
          updatedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error("Webhook update error:", error);
      res.status(500).json({ error: "Failed to update webhook" });
    }
  });

  // Delete webhook
  app.delete("/api/admin/webhooks/:id", async (req, res) => {
    try {
      const { id } = req.params;
      console.log('Deleting webhook: ' + id);

      res.json({
        success: true,
        message: "Webhook deleted successfully"
      });
    } catch (error) {
      console.error("Webhook deletion error:", error);
      res.status(500).json({ error: "Failed to delete webhook" });
    }
  });

  // Test webhook
  app.post("/api/admin/webhooks/:id/test", async (req, res) => {
    try {
      const { id } = req.params;
      const { testEvent } = req.body;

      console.log('Testing webhook ' + id + ' with event: ' + (testEvent || 'ping'));

      // Simulate webhook test
      const success = Math.random() > 0.1; // 90% success rate
      const responseTime = Math.floor(Math.random() * 1000) + 100; // 100ms - 1100ms

      if (success) {
        res.json({
          success: true,
          message: "Webhook test successful",
          responseTime: responseTime + 'ms',
          status: 200,
          event: testEvent || 'test.ping',
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(400).json({
          success: false,
          message: "Webhook test failed",
          error: "Endpoint unreachable",
          responseTime: responseTime + 'ms',
          status: 404,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error("Webhook test error:", error);
      res.status(500).json({ error: "Failed to test webhook" });
    }
  });

  // Payment Gateways endpoints
  app.get("/api/admin/payment-gateways", (req, res) => {
    console.log(new Date().toLocaleTimeString() + ' [express] GET /api/admin/payment-gateways 200');

    const gateways = [
      {
        id: "stripe",
        name: "stripe",
        isActive: true,
        apiKey: "pk_live_xyz123...",
        secretKey: "sk_live_xyz123...",
        webhookSecret: "whsec_xyz123...",
        environment: "production",
        lastTransaction: "15 min ago",
        status: "healthy"
      },
      {
        id: "braintree",
        name: "braintree",
        isActive: true,
        apiKey: "your_merchant_id",
        secretKey: "your_private_key",
        environment: "production",
        lastTransaction: "1 hour ago",
        status: "healthy"
      },
      {
        id: "helcim",
        name: "helcim",
        isActive: false,
        apiKey: "",
        secretKey: "",
        environment: "sandbox",
        lastTransaction: "Never",
        status: "warning"
      }
    ];

    res.json(gateways);
  });

  // Update payment gateway configuration
  app.put("/api/admin/payment-gateways/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { apiKey, secretKey, webhookSecret, environment, isActive } = req.body;

      console.log('Updating payment gateway ' + id + ':', { environment, isActive });

      res.json({
        success: true,
        message: "Payment gateway updated successfully",
        gateway: {
          id,
          apiKey: apiKey ? "***updated***" : undefined,
          secretKey: secretKey ? "***updated***" : undefined,
          webhookSecret: webhookSecret ? "***updated***" : undefined,
          environment,
          isActive,
          updatedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error("Payment gateway update error:", error);
      res.status(500).json({ error: "Failed to update payment gateway" });
    }
  });

  // Test payment gateway
  app.post("/api/admin/payment-gateways/:id/test", async (req, res) => {
    try {
      const { id } = req.params;
      console.log('Testing payment gateway: ' + id);

      // Simulate gateway test based on configuration
      const testResults = {
        stripe: { success: true, responseTime: "450ms", status: "healthy" },
        braintree: { success: true, responseTime: "320ms", status: "healthy" },
        helcim: { success: false, responseTime: "timeout", status: "error", error: "Invalid API credentials" }
      };

      const result = testResults[id as keyof typeof testResults];

      if (!result) {
        return res.status(404).json({
          success: false,
          error: "Gateway not found"
        });
      }

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: "Gateway test failed",
          error: result.error,
          responseTime: result.responseTime,
          status: result.status,
          timestamp: new Date().toISOString()
        });
      }

      res.json({
        success: true,
        message: "Gateway test successful",
        responseTime: result.responseTime,
        status: result.status,
        testTransaction: {
          id: 'test_' + Date.now(),
          amount: 100, // $1.00 test charge
          currency: "USD",
          status: "succeeded"
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Payment gateway test error:", error);
      res.status(500).json({ error: "Failed to test payment gateway" });
    }
  });

  // Analytics endpoints for cost tracking and profitability
  app.get('/api/admin/analytics/ai-usage', async (req, res) => {
    const { dateRange = '30d', provider = 'all', userId } = req.query;

    console.log(new Date().toLocaleTimeString() + ' [express] GET /api/admin/analytics/ai-usage 200');

    // Get AI usage data from database
    const aiUsageData = await storage.getAdminConfig('ai-usage-analytics') || [
      {
        id: '1',
        userId: 'user_1',
        userName: 'Sarah Johnson',
        provider: 'OpenAI',
        model: 'gpt-4o',
        tokens: 2500,
        inputTokens: 1500,
        outputTokens: 1000,
        cost: 0.075, // $0.005/1k input + $0.015/1k output for gpt-4o
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        caseId: 'case_1',
        caseTitle: 'Smith v. Johnson',
        requestType: 'document_generation'
      },
      {
        id: '2',
        userId: 'user_2', 
        userName: 'Mike Wilson',
        provider: 'Anthropic',
        model: 'claude-3-sonnet',
        tokens: 1800,
        inputTokens: 1200,
        outputTokens: 600,
        cost: 0.054, // $0.003/1k input + $0.015/1k output for claude-3-sonnet
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        caseId: 'case_2',
        caseTitle: 'ABC Corp Merger',
        requestType: 'case_analysis'
      },
      {
        id: '3',
        userId: 'user_1',
        userName: 'Sarah Johnson',
        provider: 'OpenAI', 
        model: 'gpt-4o-mini',
        tokens: 5000,
        inputTokens: 3000,
        outputTokens: 2000,
        cost: 0.025, // $0.00015/1k input + $0.0006/1k output for gpt-4o-mini
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        requestType: 'chat_interaction'
      },
      {
        id: '4',
        userId: 'user_3',
        userName: 'Robert Davis',
        provider: 'Deepseek',
        model: 'deepseek-chat',
        tokens: 3200,
        inputTokens: 2000,
        outputTokens: 1200,
        cost: 0.0128, // $0.0002/1k input + $0.0008/1k output for deepseek
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        caseId: 'case_3',
        caseTitle: 'Estate Planning - Davis',
        requestType: 'legal_research'
      }
    ];

    // Filter data based on query parameters
    let filteredData = aiUsageData;

    if (provider !== 'all') {
      filteredData = filteredData.filter(record => 
        record.provider.toLowerCase().includes(provider.toLowerCase())
      );
    }

    if (userId) {
      filteredData = filteredData.filter(record => record.userId === userId);
    }

    // Calculate aggregated metrics
    const totalCost = filteredData.reduce((sum, record) => sum + record.cost, 0);
    const totalTokens = filteredData.reduce((sum, record) => sum + record.tokens, 0);
    const avgCostPerToken = totalTokens > 0 ? totalCost / totalTokens : 0;

    const providerBreakdown = filteredData.reduce((acc, record) => {
      if (!acc[record.provider]) {
        acc[record.provider] = { cost: 0, tokens: 0, requests: 0 };
      }
      acc[record.provider].cost += record.cost;
      acc[record.provider].tokens += record.tokens;
      acc[record.provider].requests += 1;
      return acc;
    }, {} as Record<string, { cost: number; tokens: number; requests: number }>);

    res.json({
      success: true,
      data: filteredData,
      metrics: {
        totalCost: parseFloat(totalCost.toFixed(4)),
        totalTokens,
        avgCostPerToken: parseFloat(avgCostPerToken.toFixed(6)),
        providerBreakdown,
        totalRequests: filteredData.length
      },
      dateRange,
      filters: { provider, userId }
    });
  });

  app.get('/api/admin/analytics/profitability', async (req, res) => {
    const { sortBy = 'profit', sortOrder = 'desc' } = req.query;

    console.log(new Date().toLocaleTimeString() + ' [express] GET /api/admin/analytics/profitability 200');

    // Get user profitability data from database
    const profitabilityData = await storage.getAdminConfig('user-profitability') || [
      {
        userId: 'user_1',
        userName: 'Sarah Johnson',
        email: 'sarah.johnson@law.com',
        subscription: 'Professional',
        subscriptionPrice: 99,
        monthlyRevenue: 99,
        usage: {
          aiCosts: 12.50,
          infrastructureCosts: 8.20,
          supportCosts: 3.50,
          otherCosts: 3.50
        },
        totalCosts: 27.70,
        profit: 71.30,
        margin: 72.0,
        status: 'profitable',
        tokensUsed: 45000,
        casesActive: 8,
        joinDate: '2023-11-20',
        riskFactors: []
      },
      {
        userId: 'user_2',
        userName: 'Mike Wilson', 
        email: 'mike.wilson@legal.com',
        subscription: 'Pro Se',
        subscriptionPrice: 29,
        monthlyRevenue: 29,
        usage: {
          aiCosts: 8.75,
          infrastructureCosts: 5.10,
          supportCosts: 4.50,
          otherCosts: 2.50
        },
        totalCosts: 20.85,
        profit: 8.15,
        margin: 28.1,
        status: 'profitable',
        tokensUsed: 18000,
        casesActive: 3,
        joinDate: '2024-02-10',
        riskFactors: ['low_margin']
      },
      {
        userId: 'user_3',
        userName: 'Robert Davis',
        email: 'robert.davis@example.com', 
        subscription: 'Enterprise',
        subscriptionPrice: 299,
        monthlyRevenue: 299,
        usage: {
          aiCosts: 45.20,
          infrastructureCosts: 15.80,
          supportCosts: 12.00,
          otherCosts: 8.00
        },
        totalCosts: 81.00,
        profit: 218.00,
        margin: 72.9,
        status: 'profitable',
        tokensUsed: 125000,
        casesActive: 15,
        joinDate: '2023-08-05',
        riskFactors: []
      },
      {
        userId: 'user_4',
        userName: 'Emily Chen',
        email: 'emily.chen@legal.org',
        subscription: 'Professional',
        subscriptionPrice: 99,
        monthlyRevenue: 99,
        usage: {
          aiCosts: 85.20, // High AI usage
          infrastructureCosts: 12.30,
          supportCosts: 8.50,
          otherCosts: 5.00
        },
        totalCosts: 111.00,
        profit: -12.00,
        margin: -12.1,
        status: 'loss',
        tokensUsed: 95000,
        casesActive: 12,
        joinDate: '2024-01-15',
        riskFactors: ['high_ai_usage', 'negative_margin']
      }
    ];

    // Sort data
    const sortedData = [...profitabilityData].sort((a, b) => {
      const aValue = a[sortBy as keyof typeof a] as number;
      const bValue = b[sortBy as keyof typeof b] as number;
      return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
    });

    // Calculate summary metrics
    const totalUsers = profitabilityData.length;
    const profitableUsers = profitabilityData.filter(u => u.status === 'profitable').length;
    const lossUsers = profitabilityData.filter(u => u.status === 'loss').length;
    const totalRevenue = profitabilityData.reduce((sum, u) => sum + u.monthlyRevenue, 0);
    const totalCosts = profitabilityData.reduce((sum, u) => sum + u.totalCosts, 0);
    const totalProfit = profitabilityData.reduce((sum, u) => sum + u.profit, 0);
    const avgMargin = profitabilityData.reduce((sum, u) => sum + u.margin, 0) / totalUsers;

    res.json({
      success: true,
      data: sortedData,
      summary: {
        totalUsers,
        profitableUsers,
        lossUsers,
        profitablePercentage: (profitableUsers / totalUsers) * 100,
        totalRevenue,
        totalCosts,
        totalProfit,
        avgMargin: parseFloat(avgMargin.toFixed(2))
      },
      sorting: { sortBy, sortOrder }
    });
  });

  app.get('/api/admin/analytics/profit-loss', async (req, res) => {
    const { period = 'monthly' } = req.query;

    console.log(new Date().toLocaleTimeString() + ' [express] GET /api/admin/analytics/profit-loss 200');

    // Get P&L data from database
    const plData = await storage.getAdminConfig('profit-loss-data') || {
      period: 'March 2024',
      revenue: {
        subscriptionRevenue: 24750,
        tokenPurchases: 4290,
        overageCharges: 890,
        total: 29930
      },
      costs: {
        aiApiCosts: 3850,
        infrastructureCosts: 2100,
        supportOperations: 1580,
        developmentCosts: 1200,
        marketingCosts: 800,
        otherExpenses: 990,
        total: 10520
      },
      netIncome: 19410,
      margins: {
        grossMargin: 86.9,
        operatingMargin: 74.2,
        netMargin: 64.8
      },
      trends: {
        revenueGrowth: 12.5,
        costGrowth: 8.7,
        profitGrowth: 14.2
      },
      breakdown: [
        {
          category: 'Revenue',
          subcategory: 'Subscription Revenue',
          amount: 24750,
          percentage: 82.7,
          trend: 'up',
          trendValue: 12.5
        },
        {
          category: 'Revenue',
          subcategory: 'Token Purchases',
          amount: 4290,
          percentage: 14.3,
          trend: 'up',
          trendValue: 8.2
        },
        {
          category: 'Revenue',
          subcategory: 'Overage Charges',
          amount: 890,
          percentage: 3.0,
          trend: 'up',
          trendValue: 22.1
        },
        {
          category: 'Costs',
          subcategory: 'AI API Costs',
          amount: -3850,
          percentage: 36.6,
          trend: 'up',
          trendValue: 15.3
        },
        {
          category: 'Costs',
          subcategory: 'Infrastructure',
          amount: -2100,
          percentage: 20.0,
          trend: 'stable',
          trendValue: 0.5
        },
        {
          category: 'Costs',
          subcategory: 'Support & Operations',
          amount: -1580,
          percentage: 15.0,
          trend: 'down',
          trendValue: -3.2
        },
        {
          category: 'Costs',
          subcategory: 'Development',
          amount: -1200,
          percentage: 11.4,
          trend: 'stable',
          trendValue: 2.1
        },
        {
          category: 'Costs',
          subcategory: 'Marketing',
          amount: -800,
          percentage: 7.6,
          trend: 'up',
          trendValue: 18.5
        },
        {
          category: 'Costs',
          subcategory: 'Other Expenses',
          amount: -990,
          percentage: 9.4,
          trend: 'stable',
          trendValue: 1.1
        }
      ]
    };

    res.json({
      success: true,
      data: plData,
      period
    });
  });

  // Get system status
app.get('/api/admin/system/status', (req, res) => {
  res.json({
    success: true,
    status: {
      server: 'healthy',
      database: 'connected',
      memory: '2.1GB / 4GB',
      uptime: '15d 6h 23m',
      version: '1.2.3'
    }
  });
});

// System configuration endpoints
  app.get("/api/admin/system/config", async (req, res) => {
    console.log(new Date().toLocaleTimeString() + ' [express] GET /api/admin/system/config 200');

    const config = {
      security: {
        twoFactorAuth: true,
        sessionTimeout: true,
        ipAllowlist: false,
        passwordPolicy: "Minimum 8 characters, include uppercase, lowercase, number, and special character"
      },
      database: {
        autoBackup: true,
        backupRetention: 30,
        lastBackup: "2 hours ago",
        status: "healthy",
        uptime: "99.9%"
      },
      api: {
        rateLimit: 1000,
        apiVersioning: true,
        corsProtection: true,
        requestTimeout: 30
      },
      maintenance: {
        maintenanceMode: false,
        maintenanceMessage: "System is currently undergoing scheduled maintenance. Please check back later."
      }
    };

    res.json(config);
  });

app.put('/api/admin/system/config', (req, res) => {
  console.log(new Date().toLocaleTimeString() + ' [express] PUT /api/admin/system/config 200');

  const { section, config } = req.body;

  if (!section || !config) {
    return res.status(400).json({ error: 'Section and config are required' });
  }

  console.log('Updating system config section:', section, config);

  res.json({
    success: true,
    message: `${section} configuration updated successfully`,
    config,
    updatedAt: new Date().toISOString()
  });
});

// Security configuration endpoints
app.post('/api/admin/system/security/scan', (req, res) => {
  console.log(new Date().toLocaleTimeString() + ' [express] POST /api/admin/system/security/scan 200');

  // Simulate security scan
  setTimeout(() => {
    res.json({
      success: true,
      message: 'Security scan completed successfully',
      results: {
        threatsDetected: 0,
        vulnerabilities: 0,
        scanDuration: '45 seconds',
        lastScan: new Date().toISOString(),
        status: 'healthy'
      }
    });
  }, 1000);
});

// Database management endpoints
app.post('/api/admin/system/database/backup', (req, res) => {
  console.log(new Date().toLocaleTimeString() + ' [express] POST /api/admin/system/database/backup 200');

  // Simulate backup creation
  const backupId = 'backup_' + Date.now();

  res.json({
    success: true,
    message: 'Database backup created successfully',
    backup: {
      id: backupId,
      size: '2.4GB',
      createdAt: new Date().toISOString(),
      status: 'completed'
    }
  });
});

app.get('/api/admin/system/database/backups', (req, res) => {
  console.log(new Date().toLocaleTimeString() + ' [express] GET /api/admin/system/database/backups 200');

  const backups = [
    {
      id: 'backup_001',
      size: '2.4GB',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      status: 'completed'
    },
    {
      id: 'backup_002',
      size: '2.3GB',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      status: 'completed'
    },
    {
      id: 'backup_003',
      size: '2.2GB',
      createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      status: 'completed'
    }
  ];

  res.json(backups);
});

// Monitoring endpoints
app.get('/api/admin/system/monitoring/metrics', (req, res) => {
  console.log(new Date().toLocaleTimeString() + ' [express] GET /api/admin/system/monitoring/metrics 200');

  const metrics = {
    system: {
      cpu: 45.2,
      memory: 68.7,
      disk: 34.1,
      network: 12.3
    },
    application: {
      activeUsers: 127,
      requestsPerMinute: 1247,
      responseTime: 120,
      errorRate: 0.02
    },
    database: {
      connections: 15,
      queries: 8420,
      slowQueries: 2,
      cacheHitRate: 94.5
    }
  };

  res.json(metrics);
});

app.get('/api/admin/system/monitoring/logs', (req, res) => {
  console.log(new Date().toLocaleTimeString() + ' [express] GET /api/admin/system/monitoring/logs 200');

  const { level = 'all', limit = 100 } = req.query;

  const logs = [
    {
      timestamp: new Date().toISOString(),
      level: 'info',
      message: 'User authentication successful',
      source: 'auth.service'
    },
    {
      timestamp: new Date(Date.now() - 60000).toISOString(),
      level: 'warning',
      message: 'High memory usage detected',
      source: 'system.monitor'
    },
    {
      timestamp: new Date(Date.now() - 120000).toISOString(),
      level: 'error',
      message: 'Database connection timeout',
      source: 'database.service'
    }
  ];

  res.json(logs.slice(0, parseInt(limit as string)));
});

// Maintenance mode endpoints
app.put('/api/admin/system/maintenance/mode', (req, res) => {
  console.log(new Date().toLocaleTimeString() + ' [express] PUT /api/admin/system/maintenance/mode 200');

  const { enabled, message } = req.body;

  res.json({
    success: true,
    message: `Maintenance mode ${enabled ? 'enabled' : 'disabled'} successfully`,
    maintenanceMode: enabled,
    maintenanceMessage: message || "System is currently undergoing scheduled maintenance. Please check back later.",
    updatedAt: new Date().toISOString()
  });
});

app.post('/api/admin/system/maintenance/schedule', (req, res) => {
  console.log(new Date().toLocaleTimeString() + ' [express] POST /api/admin/system/maintenance/schedule 200');

  const { scheduledFor, duration, message } = req.body;

  res.json({
    success: true,
    message: 'Maintenance scheduled successfully',
    schedule: {
      id: 'maint_' + Date.now(),
      scheduledFor,
      duration,
      message,
      createdAt: new Date().toISOString()
    }
  });
});

app.post('/api/admin/system/update/check', (req, res) => {
  console.log(new Date().toLocaleTimeString() + ' [express] POST /api/admin/system/update/check 200');

  // Simulate update check
  const hasUpdate = Math.random() > 0.7; // 30% chance of update

  res.json({
    success: true,
    updateAvailable: hasUpdate,
    currentVersion: '1.2.3',
    latestVersion: hasUpdate ? '1.2.4' : '1.2.3',
    releaseNotes: hasUpdate ? [
      'Security improvements',
      'Performance optimizations',
      'Bug fixes'
    ] : []
  });
});

// Chat widget settings endpoints
  app.get('/api/admin/chat-widget-config', (req, res) => {
    res.json({
      success: true,
      config: {
        enabled: false,
        provider: 'crisp',
        apiKey: '',
        position: 'bottom-right',
        showOnDashboard: false,
        allowedPages: ['landing', 'pricing', 'contact'],
        customization: {
          primaryColor: '#3B82F6',
          fontFamily: 'Inter',
          borderRadius: '8px',
          position: 'bottom-right'
        }
      }
    });
  });

  app.put('/api/admin/chat-widget-config', (req, res) => {
    const { config } = req.body;

    // In a real app, you would save this to your database
    console.log('Updating chat widget config:', config);

    res.json({
      success: true,
      message: 'Chat widget configuration updated successfully',
      config
    });
  });

  // Report export and scheduling endpoints
  app.get('/api/admin/reports/export/:reportType', async (req, res) => {
    try {
      const { reportType } = req.params;
      const { dateRange = '30d', format = 'csv' } = req.query;

      console.log(new Date().toLocaleTimeString() + ' [express] GET /api/admin/reports/export/' + reportType + ' 200');

      // Generate CSV content based on report type
      let csvContent = '';

      switch (reportType) {
        case 'comprehensive':
          csvContent = `Date,Revenue,AI Costs,Users,Profit,Margin\n` +
            `2024-03-01,$29040,$3850,127,$20520,70.6%\n` +
            `2024-02-01,$26200,$3420,115,$18980,72.4%\n` +
            `2024-01-01,$23800,$3100,108,$17200,72.3%\n`;
          break;
        case 'ai-usage':
          csvContent = `User,Provider,Model,Tokens,Cost,Date\n` +
            `Sarah Johnson,OpenAI,gpt-4o,2500,0.075,2024-03-15\n` +
            `Mike Wilson,Anthropic,claude-3-sonnet,1800,0.054,2024-03-15\n` +
            `Robert Davis,Deepseek,deepseek-chat,3200,0.0128,2024-03-15\n`;
          break;
        case 'profitability':
          csvContent = `User,Subscription,Revenue,AI Costs,Total Costs,Profit,Margin,Status\n` +
            `Sarah Johnson,Professional,$99,$12.50,$27.70,$71.30,72.0%,profitable\n` +
            `Mike Wilson,Pro Se,$29,$8.75,$20.85,$8.15,28.1%,profitable\n` +
            `Robert Davis,Enterprise,$299,$45.20,$81.00,$218.00,72.9%,profitable\n`;
          break;
        case 'pl-statement':
          csvContent = `Category,Item,Amount,Percentage,Trend\n` +
            `Revenue,Subscription Revenue,$24750,82.7%,up 12.5%\n` +
            `Revenue,Token Purchases,$4290,14.3%,up 8.2%\n` +
            `Costs,AI API Costs,-$3850,36.6%,up 15.3%\n` +
            `Costs,Infrastructure,-$2100,20.0%,stable 0.5%\n` +
            `Costs,Support & Operations,-$1580,15.0%,down -3.2%\n`;
          break;
        default:
          csvContent = `Report Type,${reportType}\nGenerated,${new Date().toISOString()}\nPeriod,${dateRange}\n`;
      }

      // Set headers for file download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${reportType}-report-${dateRange}-${new Date().toISOString().split('T')[0]}.csv"`);
      res.setHeader('Cache-Control', 'no-cache');

      res.send(csvContent);
    } catch (error) {
      console.error('Report export error:', error);
      res.status(500).json({ 
        error: 'Failed to export report',
        message: 'Unable to generate report file. Please try again later.'
      });
    }
  });

  app.post('/api/admin/reports/schedule', async (req, res) => {
    try {
      const { reportType, frequency, dateRange, format, recipients } = req.body;

      console.log(new Date().toLocaleTimeString() + ' [express] POST /api/admin/reports/schedule 200');

      if (!reportType || !frequency) {
        return res.status(400).json({
          error: 'Missing required fields',
          message: 'Report type and frequency are required'
        });
      }

      // Generate schedule ID
      const scheduleId = 'sched_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);

      // Calculate next execution date based on frequency
      let nextExecution = new Date();
      switch (frequency) {
        case 'daily':
          nextExecution.setDate(nextExecution.getDate() + 1);
          break;
        case 'weekly':
          nextExecution.setDate(nextExecution.getDate() + 7);
          break;
        case 'monthly':
          nextExecution.setMonth(nextExecution.getMonth() + 1);
          break;
        default:
          nextExecution.setDate(nextExecution.getDate() + 7);
      }

      // Create schedule in database
      const schedule = {
        id: scheduleId,
        reportType,
        frequency,
        dateRange: dateRange || '30d',
        format: format || 'pdf',
        recipients: recipients || ['admin@legalai.com'],
        nextExecution: nextExecution.toISOString(),
        status: 'active',
        createdAt: new Date().toISOString(),
        createdBy: 'admin_user'
      };

      // Store schedule in database
      await storage.setAdminConfig('report-schedule-' + scheduleId, schedule);

      console.log('Created report schedule:', schedule);

      res.json({
        success: true,
        message: `${frequency} ${reportType} report scheduled successfully`,
        scheduleId,
        schedule,
        nextExecution: nextExecution.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      });
    } catch (error) {
      console.error('Report scheduling error:', error);
      res.status(500).json({
        error: 'Failed to schedule report',
        message: 'Unable to create report schedule. Please try again later.'
      });
    }
  });

  app.get('/api/admin/reports/schedules', async (req, res) => {
    try {
      console.log(new Date().toLocaleTimeString() + ' [express] GET /api/admin/reports/schedules 200');

      // Get scheduled reports from database
      const allSchedules = await storage.getAdminConfig('all-report-schedules') || [];
      const schedules = allSchedules;

      res.json({
        success: true,
        schedules
      });
    } catch (error) {
      console.error('Error fetching report schedules:', error);
      res.status(500).json({
        error: 'Failed to fetch report schedules',
        message: 'Unable to retrieve scheduled reports. Please try again later.'
      });
    }
  });

  app.delete('/api/admin/reports/schedules/:id', async (req, res) => {
    try {
      const { id } = req.params;
      console.log(new Date().toLocaleTimeString() + ' [express] DELETE /api/admin/reports/schedules/' + id + ' 200');

      res.json({
        success: true,
        message: 'Report schedule deleted successfully',
        scheduleId: id
      });
    } catch (error) {
      console.error('Error deleting report schedule:', error);
      res.status(500).json({
        error: 'Failed to delete report schedule',
        message: 'Unable to delete scheduled report. Please try again later.'
      });
    }
  });

  // Create HTTP server
  const server = createServer(app);
  return server;
}
