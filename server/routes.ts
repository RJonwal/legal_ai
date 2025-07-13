import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { openaiService } from "./services/openai";
import { insertChatMessageSchema, insertDocumentSchema, insertTimelineSchema } from "@shared/schema";
import { z } from "zod";
import adminRoutes from "./routes/admin";
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

  // Admin routes
  app.use("/api/admin", adminRoutes);

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
        userId: 1, // Mock user ID
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
        userId: 1, // Mock user ID
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

      // Mock file upload processing with more realistic data
      // In a real implementation, you would use multer or similar middleware
      const mockFileTypes = [
        { name: "contract_analysis.pdf", type: "application/pdf", size: 2048 * 1024 },
        { name: "evidence_photos.jpg", type: "image/jpeg", size: 1536 * 1024 },
        { name: "witness_statement.docx", type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", size: 512 * 1024 },
        { name: "email_correspondence.txt", type: "text/plain", size: 128 * 1024 }
      ];

      // Simulate 1-3 files being uploaded
      const numFiles = Math.floor(Math.random() * 3) + 1;
      const mockFiles = [];

      for (let i = 0; i < numFiles; i++) {
        const randomFile = mockFileTypes[Math.floor(Math.random() * mockFileTypes.length)];
        mockFiles.push({
          id: Date.now() + i,
          name: `${i > 0 ? i + '_' : ''}${randomFile.name}`,
          size: randomFile.size + Math.floor(Math.random() * 512 * 1024), // Add some randomness
          type: randomFile.type,
          uploadedAt: new Date().toISOString(),
          isDuplicate: Math.random() < 0.1 // 10% chance of duplicate
        });
      }

      // Create document records for uploaded files
      const documents = [];
      for (const file of mockFiles) {
        const document = await storage.createDocument({
          caseId,
          title: file.name,
          content: `UPLOADED DOCUMENT: ${file.name}\n\nFile Details:\n- Size: ${(file.size / 1024).toFixed(1)} KB\n- Type: ${file.type}\n- Uploaded: ${new Date(file.uploadedAt).toLocaleString()}\n\nDocument Summary:\nThis document has been successfully uploaded and processed for case analysis.\n\nKey Information:\n- Document contains relevant case evidence\n- Ready for legal review and analysis\n- Can be used in document generation workflows\n\nNext Steps:\n1. Review document content\n2. Analyze for legal significance\n3. Include in case strategy development\n\nDocument Status: Ready for Review`,
          documentType: 'uploaded_evidence',
          status: "draft",
        });
        documents.push(document);
      }

      res.json({ 
        message: "Files uploaded successfully",
        files: mockFiles,
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

      // Mock court preparation response
      const courtPrepData = {
        hearing: {
          type: hearingType || 'motion-hearing',
          keyArguments: keyArguments || [
            'Breach of contract is clearly established',
            'Damages are readily calculable',
            'No genuine dispute of material facts exists'
          ],
          evidence: evidence || [
            'Original contract documents',
            'Email correspondence showing breach',
            'Damage calculations and estimates'
          ],
          timeline: timeline || [
            'Contract signed: January 15, 2024',
            'Breach occurred: February 20, 2024',
            'Notice sent: February 25, 2024',
            'Lawsuit filed: March 1, 2024'
          ]
        },
        recommendations: [
          'Focus opening arguments on the clear breach',
          'Present evidence chronologically',
          'Emphasize the financial impact on client',
          'Be prepared for settlement discussions'
        ],
        potentialQuestions: [
          'What specific provisions of the contract were breached?',
          'What efforts were made to resolve this matter before litigation?',
          'How were the damages calculated?',
          'Are there any mitigating circumstances?'
        ]
      };

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

      // Mock invoice data
      const invoices = [
        {
          id: 'inv_001',
          description: 'Professional Plan - January 2024',
          amount: 99,
          date: 'January 15, 2024',
          status: 'paid',
          downloadUrl: '/api/billing/invoices/inv_001/download'
        },
        {
          id: 'inv_002',
          description: 'Professional Plan - December 2023',
          amount: 99,
          date: 'December 15, 2023',
          status: 'paid',
          downloadUrl: '/api/billing/invoices/inv_002/download'
        },
        {
          id: 'inv_003',
          description: 'Token Purchase - 5,000 tokens',
          amount: 79,
          date: 'December 8, 2023',
          status: 'paid',
          downloadUrl: '/api/billing/invoices/inv_003/download'
        }
      ];

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

      // Mock subscription action
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

      // Mock payment method update
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

      // Mock token purchase
      const tokenPlans = {
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

      // Mock PDF generation - in real app, generate actual PDF
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="invoice-' + invoiceId + '.pdf"');
      res.send(Buffer.from('Mock PDF content for invoice ' + invoiceId, 'utf-8'));
    } catch (error) {
      console.error('Invoice download error:', error);
      res.status(500).json({ error: 'Failed to download invoice' });
    }
  });

  // User profile routes
  app.get("/api/user/profile", async (req, res) => {
    try {
      const user = await storage.getUser(1); // Using default user for demo
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
      const updatedUser = await storage.updateUser(1, updates);
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user profile" });
    }
  });

  // User management routes
  app.get("/api/admin/users", async (req, res) => {
    try {
      const users = [
        {
          id: "1",
          name: "John Doe",
          email: "john.doe@example.com",
          role: "pro_user",
          status: "active",
          subscription: "Professional",
          joinDate: "2024-01-15",
          lastActive: "2 hours ago",
          permissions: {
            caseManagement: true,
            documentAccess: true,
            aiFeatures: true,
            billingAccess: false,
            exportData: true
          },
          limits: {
            casesPerMonth: 50,
            tokensPerMonth: 10000,
            storageGB: 10
          }
        },
        {
          id: "2",
          name: "Sarah Johnson",
          email: "sarah.johnson@law.com",
          role: "admin",
          status: "active",
          subscription: "Admin",
          joinDate: "2023-11-20",
          lastActive: "30 minutes ago",
          permissions: {
            caseManagement: true,
            documentAccess: true,
            aiFeatures: true,
            billingAccess: true,
            exportData: true,
            userManagement: true,
            systemConfig: true
          },
          limits: {
            casesPerMonth: 999999,
            tokensPerMonth: 999999,
            storageGB: 1000
          }
        },
        {
          id: "3",
          name: "Mike Wilson",
          email: "mike.wilson@legal.com",
          role: "free_user",
          status: "inactive",
          subscription: "Pro Se",
          joinDate: "2024-02-10",
          lastActive: "3 days ago",
          permissions: {
            caseManagement: true,
            documentAccess: true,
            aiFeatures: false,
            billingAccess: false,
            exportData: false
          },
          limits: {
            casesPerMonth: 5,
            tokensPerMonth: 1000,
            storageGB: 1
          }
        }
      ];
      res.json(users);
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

      // Mock role update
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

      // Mock permissions update
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

    // In a real implementation, this would update the database
    res.json({ 
      success: true, 
      message: 'User ' + userId + ' role updated to ' + role,
      userId,
      newRole: role
    });
  });

  // Update user permissions
  app.put("/api/admin/users/:userId/permissions", (req, res) => {
    const { userId } = req.params;
    const { permissions, limits } = req.body;

    console.log(new Date().toLocaleTimeString() + ' [express] PUT /api/admin/users/' + userId + '/permissions 200');

    // In a real implementation, this would update the database
    res.json({ 
      success: true, 
      message: 'User ' + userId + ' permissions updated',
      userId,
      permissions,
      limits
    });
  });

  // Update role permissions
  app.put("/api/admin/roles/:roleId", (req, res) => {
    const { roleId } = req.params;
    const { permissions } = req.body;

    console.log(new Date().toLocaleTimeString() + ' [express] PUT /api/admin/roles/' + roleId + ' 200');

    // In a real implementation, this would update the role in database
    res.json({ 
      success: true, 
      message: 'Role ' + roleId + ' permissions updated',
      roleId,
      permissions
    });
  });

  // Fetch roles
  app.get("/api/admin/roles", (req, res) => {
    console.log(new Date().toLocaleTimeString() + ' [express] GET /api/admin/roles 200');

    const roles = [
      {
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
      {
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
      {
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
    ];

    res.json(roles);
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

  // Send email to user
  app.post("/api/admin/users/:userId/send-email", (req, res) => {
    const { userId } = req.params;
    const { subject, message, template } = req.body;

    console.log(new Date().toLocaleTimeString() + ' [express] POST /api/admin/users/' + userId + '/send-email 200');

    res.json({ 
      success: true, 
      message: 'Email sent to user ' + userId,
      emailId: 'email_' + Date.now()
    });
  });

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

      // Mock update response
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
  app.get("/api/admin/livechat/config", (req, res) => {
    console.log(new Date().toLocaleTimeString() + ' [express] GET /api/admin/livechat/config 200');
    
    res.json(liveChatConfigState);
  });

  app.put("/api/admin/livechat/config", (req, res) => {
    console.log(new Date().toLocaleTimeString() + ' [express] PUT /api/admin/livechat/config 200');
    console.log('Updating livechat config:', req.body);
    
    // Validate the plugin configuration
    if (req.body.plugin && req.body.plugin.type) {
      console.log('Plugin type updated to:', req.body.plugin.type);
      console.log('Plugin name updated to:', req.body.plugin.name);
    }
    
    // Merge the updates into the existing state
    liveChatConfigState = {
      ...liveChatConfigState,
      ...req.body
    };
    
    // Store the updated config (in real app, save to database)
    res.json({ 
      success: true, 
      message: 'Configuration updated successfully',
      config: liveChatConfigState,
      timestamp: new Date().toISOString()
    });
  });

  app.get("/api/admin/livechat/conversations", (req, res) => {
    console.log(new Date().toLocaleTimeString() + ' [express] GET /api/admin/livechat/conversations 200');
    
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
  });

  app.get("/api/admin/livechat/conversations/:id/messages", (req, res) => {
    const { id } = req.params;
    console.log(new Date().toLocaleTimeString() + ' [express] GET /api/admin/livechat/conversations/' + id + '/messages 200');
    
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
  app.post("/api/admin/livechat/conversations/:id/upload", (req, res) => {
    const { id } = req.params;
    console.log(new Date().toLocaleTimeString() + ' [express] POST /api/admin/livechat/conversations/' + id + '/upload 200');
    
    // Mock file upload handling
    const uploadedFile = {
      id: 'file_' + Date.now(),
      name: 'uploaded-image.jpg',
      type: 'image/jpeg',
      size: '1.2MB',
      url: '/api/uploads/uploaded-image.jpg',
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      message: 'File uploaded successfully',
      file: uploadedFile
    });
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
  app.post("/api/admin/livechat/conversations/:id/upload", (req, res) => {
    const { id } = req.params;
    console.log(new Date().toLocaleTimeString() + ' [express] POST /api/admin/livechat/conversations/' + id + '/upload 200');
    
    // Mock file upload handling with better error simulation
    const uploadSuccess = Math.random() > 0.1; // 90% success rate
    
    if (!uploadSuccess) {
      return res.status(400).json({
        success: false,
        error: 'Upload failed',
        message: 'File size too large or unsupported format'
      });
    }

    const uploadedFile = {
      id: 'file_' + Date.now(),
      name: 'uploaded-file.' + (Math.random() > 0.5 ? 'jpg' : 'pdf'),
      type: Math.random() > 0.5 ? 'image/jpeg' : 'application/pdf',
      size: (Math.random() * 5 + 0.5).toFixed(1) + 'MB',
      url: '/api/uploads/uploaded-file-' + Date.now(),
      timestamp: new Date().toISOString()
    };

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

  // Admin routes
  app.use("/api/admin", adminRoutes);

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

app.get("/api/admin/impersonation/history", (req, res) => {
    console.log(new Date().toLocaleTimeString() + ' [express] GET /api/admin/impersonation/history 200');

    // Mock impersonation history
    const history = [
      {
        id: "1",
        adminId: "admin_1",
        adminName: "Admin User",
        targetUserId: "user_123",
        targetUserName: "John Doe",
        targetUserEmail: "john.doe@example.com",
        reason: "Customer support - billing inquiry",
        startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() - 2 * 60 * 60 * 1000 + 15 * 60 * 1000).toISOString(),
        duration: 15 * 60 * 1000 // 15 minutes in milliseconds
      },
      {
        id: "2",
        adminId: "admin_1",
        adminName: "Admin User",
        targetUserId: "user_456",
        targetUserName: "Mike Wilson",
        targetUserEmail: "mike.wilson@legal.com",
        reason: "Troubleshooting document generation issue",
        startTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() - 24 * 60 * 60 * 1000 + 8 * 60 * 1000).toISOString(),
        duration: 8 * 60 * 1000 // 8 minutes in milliseconds
      }
    ];

    res.json(history);
  });

  // API Management endpoints

  // AI Provider model fetching endpoint
  app.get("/api/admin/ai-providers/:id/models", async (req, res) => {
    try {
      const { id } = req.params;
      const { apiKey, refresh } = req.query;

      console.log('Fetching models for provider: ' + id + ', refresh: ' + refresh);

      // Mock model data based on provider
      const modelData = {
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

  // VoIP Management endpoints
  let voipConfig = {
    enabled: false,
    provider: 'twilio',
    credentials: {
      accountSid: '',
      authToken: '',
      phoneNumber: '',
      apiKey: '',
      username: '',
      password: '',
      customEndpoint: ''
    },
    customProvider: {
      name: '',
      description: '',
      webhookUrl: '',
      apiEndpoint: '',
      authMethod: 'apikey',
      apiKey: '',
      username: '',
      password: '',
      additionalHeaders: '',
      features: [],
      // SIP Configuration
      sipServer: '',
      sipPort: '5060',
      sipTransport: 'UDP',
      sipUsername: '',
      sipPassword: '',
      sipDomain: '',
      outboundProxy: '',
      // RTP & Media
      rtpPortMin: '10000',
      rtpPortMax: '20000',
      mediaServer: '',
      supportedCodecs: ['G.711 (PCMU)', 'G.711 (PCMA)'],
      dtmfMethod: 'RFC2833',
      // Telephony
      didNumbers: '',
      callerIdName: '',
      maxConcurrentCalls: '10',
      callTimeout: '30',
      registrationInterval: '3600',
      // Additional Webhooks
      statusCallbackUrl: '',
      fallbackUrl: ''
    },
    voiceSettings: {
      voice: 'Polly.Joanna',
      language: 'en-US',
      speed: 1.0,
      pitch: 1.0,
      volume: 1.0,
      engine: 'neural'
    },
    callFlow: {
      welcomeMessage: 'Thank you for calling LegalAI Pro. How can I assist you today?',
      businessHours: {
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
      afterHoursMessage: 'Thank you for calling. We are currently closed. Please leave a message or call back during business hours.',
      maxCallDuration: 30,
      recordCalls: true,
      transcriptionEnabled: true
    },
    humanHandoff: {
      enabled: true,
      triggerKeywords: ['human', 'agent', 'lawyer', 'attorney', 'speak to someone', 'urgent', 'emergency'],
      escalationThreshold: 3,
      forwardNumbers: ['+1234567890'],
      autoEscalateTime: 10,
      ringTimeout: 30,
      failoverNumbers: []
    },
    aiAssistant: {
      enabled: true,
      model: 'gpt-4',
      maxTokens: 300,
      temperature: 0.7,
      systemPrompt: 'You are a professional AI assistant for LegalAI Pro. Provide helpful, accurate information about legal services while maintaining confidentiality.',
      permissions: {
        // Core Legal Services
        legalConsultation: true,
        caseAnalysis: true,
        procedureGuidance: true,
        legalResearch: true,
        courtDeadlines: true,
        filingRequirements: true,
        jurisdictionAdvice: true,
        documentGuidance: true,
        caseStrategy: false,
        
        // Client Management
        clientIntake: true,
        appointmentScheduling: true,
        caseStatusInquiry: true,
        documentCollection: true,
        progressUpdates: true,
        caseFileAccess: true,
        
        // Business Operations
        serviceQuotes: true,
        pricingInformation: true,
        billingInquiries: true,
        paymentProcessing: true,
        subscriptionManagement: true,
        refundRequests: false,
        
        // Technical Support
        platformNavigation: true,
        featureGuidance: true,
        troubleshooting: true,
        accountSupport: true,
        integrationHelp: true,
        
        // Call Management
        transferToAttorney: true,
        transferToSpecialist: true,
        takeDetailedMessages: true,
        scheduleCallbacks: true,
        escalateUrgent: true,
        recordCalls: true,
        
        // Emergency Handling
        urgentLegalMatters: true,
        emergencyEscalation: true,
        afterHoursSupport: true,
        crisisManagement: true,
        
        // Sales & Marketing
        productDemos: true,
        leadQualification: true,
        salesPresentations: true,
        pricingNegotiation: false,
        contractDiscussion: false,
        
        // Customer Service
        complaintHandling: true,
        serviceIssues: true,
        accountModifications: true,
        passwordResets: true,
        dataExport: false,
        
        // Operational Tasks
        dataEntry: true,
        reportGeneration: true,
        systemUpdates: false,
        userProvisioning: false,
        backupOperations: false
      }
    },
    analytics: {
      trackCalls: true,
      recordMetrics: true,
      generateReports: true,
      enableRealTimeMonitoring: true
    }
  };

  app.get("/api/admin/voip/config", (req, res) => {
    console.log(new Date().toLocaleTimeString() + ' [express] GET /api/admin/voip/config 200');
    res.json(voipConfig);
  });

  app.put("/api/admin/voip/config", (req, res) => {
    console.log(new Date().toLocaleTimeString() + ' [express] PUT /api/admin/voip/config 200');
    console.log('Updating VoIP config:', req.body);
    
    // Merge the incoming config with the existing config
    voipConfig = { ...voipConfig, ...req.body };
    
    res.json({
      success: true,
      message: 'VoIP configuration updated successfully',
      config: voipConfig,
      timestamp: new Date().toISOString()
    });
  });

  app.post("/api/admin/voip/test-voice", (req, res) => {
    const { voice, language, speed, pitch, volume, text } = req.body;
    console.log(new Date().toLocaleTimeString() + ' [express] POST /api/admin/voip/test-voice 200');
    console.log('Testing voice settings:', { voice, language, speed, pitch, volume });
    
    // Simulate voice test
    const success = Math.random() > 0.05; // 95% success rate
    
    if (success) {
      res.json({
        success: true,
        message: 'Voice test completed successfully',
        audioUrl: `data:audio/mp3;base64,test_audio_${Date.now()}`,
        settings: { voice, language, speed, pitch, volume },
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Voice test failed',
        error: 'Voice engine unavailable',
        timestamp: new Date().toISOString()
      });
    }
  });

  app.get("/api/admin/voip/active-calls", (req, res) => {
    console.log(new Date().toLocaleTimeString() + ' [express] GET /api/admin/voip/active-calls 200');
    
    // Simulate active calls data
    const activeCalls = [
      {
        id: 'call_001',
        caller: '+1-555-0123',
        duration: Math.floor(Math.random() * 600) + 60, // 1-10 minutes
        status: Math.random() > 0.7 ? 'Human Agent' : 'AI Handling',
        topic: ['Legal consultation', 'Billing inquiry', 'Account support', 'Case status'][Math.floor(Math.random() * 4)],
        confidence: Math.floor(Math.random() * 40) + 60, // 60-100%
        startTime: new Date(Date.now() - Math.random() * 600000).toISOString()
      },
      {
        id: 'call_002',
        caller: '+1-555-0456',
        duration: Math.floor(Math.random() * 600) + 60,
        status: Math.random() > 0.7 ? 'Human Agent' : 'AI Handling',
        topic: ['Document request', 'Emergency legal matter', 'Appointment scheduling', 'Payment processing'][Math.floor(Math.random() * 4)],
        confidence: Math.floor(Math.random() * 40) + 60,
        startTime: new Date(Date.now() - Math.random() * 600000).toISOString()
      }
    ];
    
    res.json({
      calls: activeCalls,
      totalActive: activeCalls.length,
      totalToday: Math.floor(Math.random() * 50) + 10,
      averageDuration: '4.5 minutes',
      aiResolutionRate: '92%'
    });
  });

  app.put("/api/admin/voip/config", (req, res) => {
    console.log(new Date().toLocaleTimeString() + ' [express] PUT /api/admin/voip/config 200');
    console.log('Updating VoIP config:', req.body);
    
    res.json({
      success: true,
      message: 'VoIP configuration updated successfully',
      config: req.body,
      timestamp: new Date().toISOString()
    });
  });

  app.post("/api/admin/voip/test-call", (req, res) => {
    const { number } = req.body;
    console.log(new Date().toLocaleTimeString() + ' [express] POST /api/admin/voip/test-call 200');
    console.log('Initiating test call to:', number);
    
    // Simulate test call
    const success = Math.random() > 0.1; // 90% success rate
    
    if (success) {
      res.json({
        success: true,
        message: `Test call initiated to ${number}`,
        callId: 'test_call_' + Date.now(),
        status: 'connecting',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Test call failed',
        error: 'Number unreachable or invalid configuration',
        timestamp: new Date().toISOString()
      });
    }
  });

  app.get("/api/admin/voip/analytics", (req, res) => {
    console.log(new Date().toLocaleTimeString() + ' [express] GET /api/admin/voip/analytics 200');
    
    const analytics = {
      activeCalls: 5,
      callsToday: 42,
      aiResolutionRate: 87,
      avgCallDuration: 8.5,
      humanHandoffs: 6,
      customerSatisfaction: 4.6,
      callVolume: [
        { hour: '09:00', calls: 3 },
        { hour: '10:00', calls: 7 },
        { hour: '11:00', calls: 12 },
        { hour: '12:00', calls: 8 },
        { hour: '13:00', calls: 5 },
        { hour: '14:00', calls: 9 },
        { hour: '15:00', calls: 11 },
        { hour: '16:00', calls: 6 }
      ],
      recentCalls: [
        {
          id: 'call_001',
          number: '+1-555-0123',
          duration: '4:32',
          status: 'completed',
          aiHandled: true,
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString()
        },
        {
          id: 'call_002',
          number: '+1-555-0456',
          duration: '12:45',
          status: 'transferred',
          aiHandled: false,
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString()
        },
        {
          id: 'call_003',
          number: '+1-555-0789',
          duration: '2:18',
          status: 'completed',
          aiHandled: true,
          timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString()
        }
      ]
    };
    
    res.json(analytics);
  });

  // Enhanced call monitoring endpoints
  app.get("/api/admin/voip/call-monitor", (req, res) => {
    console.log(new Date().toLocaleTimeString() + ' [express] GET /api/admin/voip/call-monitor 200');
    
    const activeCalls = [
      {
        id: 'call_live_001',
        callerNumber: '+1-555-0123',
        callerName: 'John Smith',
        duration: '00:03:42',
        status: 'ai_handling',
        topic: 'Billing inquiry',
        aiConfidence: 0.85,
        escalationRisk: 'low',
        startTime: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
        audioQuality: 'high',
        transcript: [
          { speaker: 'AI', text: 'How can I assist you with your legal matter today?', timestamp: '00:00:05' },
          { speaker: 'Caller', text: 'I need help with understanding my contract terms...', timestamp: '00:00:15' },
          { speaker: 'AI', text: 'I\'d be happy to help you review your contract. Can you tell me what specific terms you\'re concerned about?', timestamp: '00:00:25' }
        ]
      },
      {
        id: 'call_live_002',
        callerNumber: '+1-555-0456',
        callerName: 'Sarah Johnson',
        duration: '00:07:15',
        status: 'human_transferred',
        topic: 'Complex legal matter',
        aiConfidence: 0.45,
        escalationRisk: 'high',
        startTime: new Date(Date.now() - 7 * 60 * 1000).toISOString(),
        audioQuality: 'medium',
        transcript: []
      },
      {
        id: 'call_live_003',
        callerNumber: '+1-555-0789',
        callerName: 'Mike Wilson',
        duration: '00:01:23',
        status: 'ai_handling',
        topic: 'Account questions',
        aiConfidence: 0.92,
        escalationRisk: 'low',
        startTime: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
        audioQuality: 'high',
        transcript: [
          { speaker: 'AI', text: 'Hello, how can I help you today?', timestamp: '00:00:02' },
          { speaker: 'Caller', text: 'I have questions about my account settings', timestamp: '00:00:10' }
        ]
      }
    ];
    
    res.json(activeCalls);
  });

  app.post("/api/admin/voip/start-listening", (req, res) => {
    const { callId } = req.body;
    console.log(new Date().toLocaleTimeString() + ' [express] POST /api/admin/voip/start-listening 200');
    console.log('Starting audio stream for call:', callId);
    
    res.json({
      success: true,
      message: 'Audio stream started',
      callId,
      streamUrl: `wss://voip-stream.example.com/call/${callId}`,
      audioFormat: 'webm',
      sampleRate: 16000,
      timestamp: new Date().toISOString()
    });
  });

  app.post("/api/admin/voip/stop-listening", (req, res) => {
    const { callId } = req.body;
    console.log(new Date().toLocaleTimeString() + ' [express] POST /api/admin/voip/stop-listening 200');
    console.log('Stopping audio stream for call:', callId);
    
    res.json({
      success: true,
      message: 'Audio stream stopped',
      callId,
      timestamp: new Date().toISOString()
    });
  });

  app.post("/api/admin/voip/test-audio-quality", (req, res) => {
    console.log(new Date().toLocaleTimeString() + ' [express] POST /api/admin/voip/test-audio-quality 200');
    
    // Simulate quality test
    const qualities = ['high', 'medium', 'low'];
    const quality = qualities[Math.floor(Math.random() * qualities.length)];
    const latency = Math.floor(Math.random() * 200) + 50; // 50-250ms
    const packetLoss = Math.random() * 5; // 0-5%
    
    res.json({
      success: true,
      quality,
      metrics: {
        latency: `${latency}ms`,
        packetLoss: `${packetLoss.toFixed(2)}%`,
        bandwidth: '64 kbps',
        jitter: `${Math.floor(Math.random() * 20)}ms`
      },
      timestamp: new Date().toISOString()
    });
  });

  app.post("/api/admin/voip/call/:id/intercept", (req, res) => {
    const { id } = req.params;
    const { action } = req.body; // 'take_over', 'monitor', 'end_call'
    
    console.log(new Date().toLocaleTimeString() + ' [express] POST /api/admin/voip/call/' + id + '/intercept 200');
    console.log('Call intercept action:', action, 'for call:', id);
    
    res.json({
      success: true,
      message: `Call ${id} ${action} successful`,
      callId: id,
      action,
      timestamp: new Date().toISOString()
    });
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
  app.get('/api/admin/analytics/ai-usage', (req, res) => {
    const { dateRange = '30d', provider = 'all', userId } = req.query;

    console.log(new Date().toLocaleTimeString() + ' [express] GET /api/admin/analytics/ai-usage 200');

    // Mock AI usage data with cost calculations
    const aiUsageData = [
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

  app.get('/api/admin/analytics/profitability', (req, res) => {
    const { sortBy = 'profit', sortOrder = 'desc' } = req.query;

    console.log(new Date().toLocaleTimeString() + ' [express] GET /api/admin/analytics/profitability 200');

    // Mock user profitability data
    const profitabilityData = [
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

  app.get('/api/admin/analytics/profit-loss', (req, res) => {
    const { period = 'monthly' } = req.query;

    console.log(new Date().toLocaleTimeString() + ' [express] GET /api/admin/analytics/profit-loss 200');

    // Mock P&L data
    const plData = {
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

      // Mock schedule creation
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

      // Mock scheduled reports data
      const schedules = [
        {
          id: 'sched_001',
          reportType: 'comprehensive',
          frequency: 'weekly',
          dateRange: '30d',
          format: 'pdf',
          recipients: ['admin@legalai.com', 'manager@legalai.com'],
          nextExecution: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          lastExecuted: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'sched_002',
          reportType: 'profitability',
          frequency: 'monthly',
          dateRange: '90d',
          format: 'csv',
          recipients: ['finance@legalai.com'],
          nextExecution: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active',
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          lastExecuted: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

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

    const router = adminRoutes;
// Get email configuration
router.get("/admin/email/config", (req: Request, res: Response) => {
  console.log(`${new Date().toLocaleTimeString()} [express] GET /api/admin/email/config 200`);
  res.json({
    smtp: {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      user: '',
      password: '',
      fromName: 'Wizzered',
      fromEmail: 'noreply@wizzered.com',
      operationalEmails: ['support@wizzered.com', 'admin@wizzered.com']
    },
    templates: [
      {
        id: '1',
        name: 'Welcome Email',
        subject: 'Welcome to Wizzered - Your Legal Assistant is Ready!',
        content: 'Dear {{name}}, Welcome to Wizzered! We are thrilled to have you join our community...',
        type: 'signup',
        enabled: true,
        lastModified: new Date().toISOString(),
        variables: ['name', 'email', 'account_type']
      },
      {
        id: '2',
        name: 'Payment Confirmation',
        subject: 'Payment Confirmed - Wizzered Subscription Active',
        content: 'Dear {{name}}, Thank you for your payment! Your Wizzered subscription is now active...',
        type: 'payment',
        enabled: true,
        lastModified: new Date().toISOString(),
        variables: ['name', 'plan_name', 'amount', 'invoice_id', 'next_billing_date']
      }
    ],
    emailLogs: [
      {
        id: '1',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        type: 'received',
        to: 'support@wizzered.com',
        from: 'user@example.com',
        subject: 'Question about billing',
        content: 'Hi, I have a question about my recent billing statement...',
        status: 'pending',
        aiProcessed: false,
        humanCorrected: false,
        forwardedToHuman: false,
        priority: 'medium',
        tags: ['billing', 'inquiry']
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        type: 'sent',
        to: 'client@example.com',
        from: 'support@wizzered.com',
        subject: 'Case Update Notification',
        content: 'Your case has been updated with new information...',
        status: 'success',
        aiProcessed: true,
        humanCorrected: false,
        forwardedToHuman: false,
        priority: 'high',
        tags: ['case-update', 'automated']
      }
    ],
    signatures: [
      {
        id: '1',
        name: 'Default Support',
        content: 'Best regards,\nWizzered Support Team\n\nEmail: support@wizzered.com\nPhone: +1 (555) 123-4567\nWebsite: https://wizzered.com',
        isDefault: true,
        department: 'support'
      },
      {
        id: '2',
        name: 'Legal Team',
        content: 'Best regards,\nWizzered Legal Team\n\nEmail: legal@wizzered.com\nPhone: +1 (555) 123-4567\nWebsite: https://wizzered.com',
        isDefault: false,
        department: 'legal'
      }
    ],
    aiAssistant: {
      enabled: true,
      provider: 'openai',
      model: 'gpt-4',
      permissions: {
        legalConsultation: true,
        caseAnalysis: true,
        documentReview: true,
        legalResearch: true,
        procedureGuidance: true,
        filingDeadlines: true,
        courtRequirements: true,
        jurisdictionAdvice: true,
        legalFormCompletion: true,
        caseStrategyAdvice: false,
        clientOnboarding: true,
        caseStatusUpdates: true,
        appointmentScheduling: true,
        documentRequests: true,
        caseFileAccess: true,
        clientCommunication: true,
        progressReporting: true,
        billingInquiries: true,
        paymentProcessing: true,
        subscriptionManagement: true,
        servicePlanChanges: true,
        refundProcessing: false,
        invoiceGeneration: true,
        platformNavigation: true,
        featureExplanation: true,
        troubleshooting: true,
        accountSetup: true,
        dataExport: true,
        systemIntegration: true,
        userAccountManagement: true,
        accessPermissions: false,
        dataBackup: true,
        reportGeneration: true,
        auditTrails: true,
        urgentLegalMatters: true,
        escalateToAttorney: true,
        escalateToHuman: true,
        emergencyContact: true
      },
      responseSettings: {
        maxTokens: 500,
        temperature: 0.7,
        systemPrompt: 'You are a helpful AI assistant for Wizzered.',
        autoResponse: true,
        escalationThreshold: 80
      }
    },
    adminTools: {
      canRespond: true,
      canIntercept: true,
      canViewAll: true,
      canEditResponses: true,
      notificationSettings: {
        newEmails: true,
        escalations: true,
        failedDeliveries: true
      }
    }
  });
});

// Update email configuration
router.put("/admin/email/config", (req: Request, res: Response) => {
  console.log(`${new Date().toLocaleTimeString()} [express] PUT /api/admin/email/config 200`);
  res.json({ success: true, message: "Configuration updated successfully" });
});

// Get email templates
router.get("/admin/email/templates", (req: Request, res: Response) => {
  console.log(`${new Date().toLocaleTimeString()} [express] GET /api/admin/email/templates 200`);
  res.json([
    {
      id: '1',
      name: 'Welcome Email',
      subject: 'Welcome to Wizzered - Your Legal Assistant is Ready!',
      content: 'Dear {{name}}, Welcome to Wizzered! We are thrilled to have you join our community...',
      type: 'signup',
      enabled: true,
      lastModified: new Date().toISOString(),
      variables: ['name', 'email', 'account_type']
    }
  ]);
});

// Create email template
router.post("/admin/email/templates", (req: Request, res: Response) => {
  console.log(`${new Date().toLocaleTimeString()} [express] POST /api/admin/email/templates 200`);
  const newTemplate = {
    id: Date.now().toString(),
    ...req.body,
    lastModified: new Date().toISOString(),
    enabled: true
  };
  res.json(newTemplate);
});

// Update email template
router.put("/admin/email/templates/:id", (req: Request, res: Response) => {
  console.log(`${new Date().toLocaleTimeString()} [express] PUT /api/admin/email/templates/${req.params.id} 200`);
  const updatedTemplate = {
    id: req.params.id,
    ...req.body,
    lastModified: new Date().toISOString()
  };
  res.json(updatedTemplate);
});

// Delete email template
router.delete("/admin/email/templates/:id", (req: Request, res: Response) => {
  console.log(`${new Date().toLocaleTimeString()} [express] DELETE /api/admin/email/templates/${req.params.id} 200`);
  res.json({ success: true, message: "Template deleted successfully" });
});

// Send test email
router.post("/admin/email/test", (req: Request, res: Response) => {
  console.log(`${new Date().toLocaleTimeString()} [express] POST /api/admin/email/test 200`);
  res.json({ success: true, message: "Test email sent successfully" });
});

// Send email response
router.post("/admin/email/respond", (req: Request, res: Response) => {
  console.log(`${new Date().toLocaleTimeString()} [express] POST /api/admin/email/respond 200`);
  res.json({ success: true, message: "Response sent successfully" });
});

// Export email logs
router.get("/admin/email/logs/export", (req: Request, res: Response) => {
  console.log(`${new Date().toLocaleTimeString()} [express] GET /api/admin/email/logs/export 200`);
  
  const csvData = `ID,Timestamp,Type,To,From,Subject,Status,AI Processed,Priority
1,${new Date().toISOString()},received,support@wizzered.com,user@example.com,Question about billing,pending,false,medium
2,${new Date().toISOString()},sent,client@example.com,support@wizzered.com,Case Update,success,true,high`;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="email_logs.csv"');
  res.send(csvData);
});

// Update signature
router.put("/admin/email/signatures/:id", (req: Request, res: Response) => {
  console.log(`${new Date().toLocaleTimeString()} [express] PUT /api/admin/email/signatures/${req.params.id} 200`);
  const updatedSignature = {
    id: req.params.id,
    ...req.body
  };
  res.json(updatedSignature);
});

// Delete signature
router.delete("/admin/email/signatures/:id", (req: Request, res: Response) => {
  console.log(`${new Date().toLocaleTimeString()} [express] DELETE /api/admin/email/signatures/${req.params.id} 200`);
  res.json({ success: true, message: "Signature deleted successfully" });
        status: 'success',
        aiProcessed: true,
        humanCorrected: false,
        forwardedToHuman: false
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        type: 'sent',
        to: 'user@example.com',
        from: 'support@legalai.pro',
        subject: 'Re: Question about billing',
        content: 'Thank you for your inquiry. Your billing statement shows...',
        status: 'success',
        aiProcessed: true,
        humanCorrected: true,
        forwardedToHuman: false
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        type: 'forwarded',
        to: 'admin@legalai.pro',
        from: 'support@legalai.pro',
        subject: 'Complex legal question - needs human review',
        content: 'Forwarding complex inquiry that requires human expertise...',
        status: 'success',
        aiProcessed: true,
        humanCorrected: false,
        forwardedToHuman: true
      }
    ],
    aiAssistant: {
      enabled: true,
      provider: 'openai',
      model: 'gpt-4',
      permissions: {
        userManagement: false,
        billingInquiries: true,
        technicalSupport: true,
        accountSettings: true,
        caseManagement: false,
        documentGeneration: false,
        paymentProcessing: false,
        subscriptionChanges: false,
        dataExport: false,
        systemStatus: true,
        generalInquiries: true,
        escalateToHuman: true
      },
      responseSettings: {
        maxTokens: 500,
        temperature: 0.7,
        systemPrompt: 'You are a helpful AI assistant for LegalAI Pro.'
      }
    },
    liveChat: {
      enabled: true,
      provider: 'internal',
      permissions: {
        viewUserProfiles: true,
        accessCaseHistory: true,
        modifyUserAccounts: false,
        processPayments: false,
        scheduleAppointments: true,
        accessDocuments: true,
        generateReports: false,
        systemAdministration: false,
        escalationManagement: true,
        knowledgeBaseAccess: true
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
        escalationMessage: 'Let me connect you with a human agent who can better assist you.'
      },
      realTimeMonitoring: {
        enabled: true,
        allowIntercept: true,
        showTypingIndicator: true
      }
    }
  });
});

// Create email template
router.post("/admin/email/templates", (req: Request, res: Response) => {
  const template = {
    ...req.body,
    id: Date.now().toString(),
    lastModified: new Date().toISOString()
  };
  console.log(`${new Date().toLocaleTimeString()} [express] POST /api/admin/email/templates 201`);
  res.status(201).json(template);
});

// Update email configuration
router.put("/admin/email/config", (req: Request, res: Response) => {
  console.log(`${new Date().toLocaleTimeString()} [express] PUT /api/admin/email/config 200`);
  res.json({ success: true, config: req.body });
});

// Send test email
router.post("/admin/email/test", (req: Request, res: Response) => {
  const { email, templateId } = req.body;
  console.log(`${new Date().toLocaleTimeString()} [express] POST /api/admin/email/test 200`);
  res.json({ 
    success: true, 
    message: `Test email sent to ${email}`,
    templateId 
  });
});

// Send email response
router.post("/admin/email/respond", (req: Request, res: Response) => {
  const { emailId, content, signature } = req.body;
  console.log(`${new Date().toLocaleTimeString()} [express] POST /api/admin/email/respond 200`);
  res.json({ 
    success: true, 
    message: `Response sent for email ${emailId}`,
    responseId: 'resp_' + Date.now()
  });
});

// Intercept AI email response
router.post("/admin/email/intercept", (req: Request, res: Response) => {
  const { emailId, action } = req.body;
  console.log(`${new Date().toLocaleTimeString()} [express] POST /api/admin/email/intercept 200`);
  res.json({ 
    success: true, 
    message: `Email ${emailId} ${action}`,
    interceptedAt: new Date().toISOString()
  });
});

// Get email signatures
router.get("/admin/email/signatures", (req: Request, res: Response) => {
  console.log(`${new Date().toLocaleTimeString()} [express] GET /api/admin/email/signatures 200`);
  res.json([
    {
      id: '1',
      name: 'Default Support',
      content: 'Best regards,\nLegalAI Pro Support Team\n\nEmail: support@legalai.pro\nPhone: +1 (555) 123-4567\nWebsite: https://legalai.pro',
      isDefault: true,
      department: 'support'
    },
    {
      id: '2',
      name: 'Legal Team',
      content: 'Best regards,\nLegalAI Pro Legal Team\n\nEmail: legal@legalai.pro\nPhone: +1 (555) 123-4567\nWebsite: https://legalai.pro',
      isDefault: false,
      department: 'legal'
    }
  ]);
});

// Create email signature
router.post("/admin/email/signatures", (req: Request, res: Response) => {
  const signature = {
    ...req.body,
    id: Date.now().toString(),
    isDefault: false
  };
  console.log(`${new Date().toLocaleTimeString()} [express] POST /api/admin/email/signatures 201`);
  res.status(201).json(signature);
});

// Update email signature
router.put("/admin/email/signatures/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  console.log(`${new Date().toLocaleTimeString()} [express] PUT /api/admin/email/signatures/${id} 200`);
  res.json({ success: true, signature: { ...req.body, id } });
});

// Delete email signature
router.delete("/admin/email/signatures/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  console.log(`${new Date().toLocaleTimeString()} [express] DELETE /api/admin/email/signatures/${id} 200`);
  res.json({ success: true, message: `Signature ${id} deleted` });
});

// Create email template
router.post("/admin/email/templates", (req: Request, res: Response) => {
  const template = {
    ...req.body,
    id: Date.now().toString(),
    lastModified: new Date().toISOString()
  };
  console.log(`${new Date().toLocaleTimeString()} [express] POST /api/admin/email/templates 201`);
  res.status(201).json(template);
});

// Update email configuration
router.put("/admin/email/config", (req: Request, res: Response) => {
  console.log(`${new Date().toLocaleTimeString()} [express] PUT /api/admin/email/config 200`);
  res.json({ success: true, config: req.body });
});

// Send test email
router.post("/admin/email/test", (req: Request, res: Response) => {
  const { email, templateId } = req.body;
  console.log(`${new Date().toLocaleTimeString()} [express] POST /api/admin/email/test 200`);
  res.json({ 
    success: true, 
    message: `Test email sent to ${email}`,
    templateId 
  });
});

// Send email response
router.post("/admin/email/respond", (req: Request, res: Response) => {
  const { emailId, content, signature } = req.body;
  console.log(`${new Date().toLocaleTimeString()} [express] POST /api/admin/email/respond 200`);
  res.json({ 
    success: true, 
    message: `Response sent for email ${emailId}`,
    responseId: 'resp_' + Date.now()
  });
});

// Intercept AI email response
router.post("/admin/email/intercept", (req: Request, res: Response) => {
  const { emailId, action } = req.body;
  console.log(`${new Date().toLocaleTimeString()} [express] POST /api/admin/email/intercept 200`);
  res.json({ 
    success: true, 
    message: `Email ${emailId} ${action}`,
    interceptedAt: new Date().toISOString()
  });
});

// Get email signatures
router.get("/admin/email/signatures", (req: Request, res: Response) => {
  console.log(`${new Date().toLocaleTimeString()} [express] GET /api/admin/email/signatures 200`);
  res.json([
    {
      id: '1',
      name: 'Default Support',
      content: 'Best regards,\nLegalAI Pro Support Team\n\nEmail: support@legalai.pro\nPhone: +1 (555) 123-4567\nWebsite: https://legalai.pro',
      isDefault: true,
      department: 'support'
    },
    {
      id: '2',
      name: 'Legal Team',
      content: 'Best regards,\nLegalAI Pro Legal Team\n\nEmail: legal@legalai.pro\nPhone: +1 (555) 123-4567\nWebsite: https://legalai.pro',
      isDefault: false,
      department: 'legal'
    }
  ]);
});

// Create email signature
router.post("/admin/email/signatures", (req: Request, res: Response) => {
  const signature = {
    ...req.body,
    id: Date.now().toString(),
    isDefault: false
  };
  console.log(`${new Date().toLocaleTimeString()} [express] POST /api/admin/email/signatures 201`);
  res.status(201).json(signature);
});

// Update email signature
router.put("/admin/email/signatures/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  console.log(`${new Date().toLocaleTimeString()} [express] PUT /api/admin/email/signatures/${id} 200`);
  res.json({ success: true, signature: { ...req.body, id } });
});

// Delete email signature
router.delete("/admin/email/signatures/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  console.log(`${new Date().toLocaleTimeString()} [express] DELETE /api/admin/email/signatures/${id} 200`);
  res.json({ success: true, message: `Signature ${id} deleted` });
});

  // This API defines report export and scheduling endpoints.

// Mock cases data
const mockCases = [
  {
    id: 1,
    title: "Smith v. Johnson",
    description: "Contract dispute regarding construction project delays and breach of performance deadlines",
    clientName: "Smith Construction LLC",
    caseType: "Contract Dispute",
    status: "active",
    priority: "high",
    createdAt: "2024-01-15T00:00:00Z",
    updatedAt: "2024-03-15T00:00:00Z",
    caseNumber: "CV-2024-001",
    court: "Superior Court of California",
    attorney: "Sarah Johnson",
    estimatedValue: "$150,000",
    nextDeadline: "2024-04-01T00:00:00Z"
  },
  {
    id: 2,
    title: "ABC Corp Merger",
    description: "Corporate merger and acquisition legal review involving due diligence and regulatory compliance",
    clientName: "ABC Corporation",
    caseType: "Corporate Law",
    status: "pending",
    priority: "medium",
    createdAt: "2024-02-01T00:00:00Z",
    updatedAt: "2024-03-10T00:00:00Z",
    caseNumber: "CORP-2024-002",
    court: "Delaware Chancery Court",
    attorney: "Sarah Johnson",
    estimatedValue: "$2,500,000",
    nextDeadline: "2024-04-15T00:00:00Z"
  },
  {
    id: 3,
    title: "Estate Planning - Davis",
    description: "Comprehensive estate planning and will preparation for high-net-worth individual",
    clientName: "Robert Davis",
    caseType: "Estate Law",
    status: "active",
    priority: "low",
    createdAt: "2024-01-20T00:00:00Z",
    updatedAt: "2024-03-12T00:00:00Z",
    caseNumber: "EST-2024-003",
    court: "Probate Court",
    attorney: "Sarah Johnson",
    estimatedValue: "$850,000",
    nextDeadline: "2024-03-30T00:00:00Z"
  }
];

  // GDPR/CCPA Compliance API
  app.get("/api/compliance/privacy-settings", (req, res) => {
    const defaultSettings = {
      marketing: false,
      analytics: false,
      dataProcessing: true,
      dataRetention: true,
      thirdPartySharing: false,
      profileVisibility: true,
      communicationPreferences: {
        email: true,
        sms: false,
        push: false,
        marketing: false
      }
    };
    res.json(defaultSettings);
  });

  app.put("/api/compliance/privacy-settings", (req, res) => {
    const updatedSettings = req.body;
    res.json({ success: true, settings: updatedSettings });
  });

  app.post("/api/compliance/privacy-request", (req, res) => {
    const { type, description } = req.body;
    
    if (!type || !description) {
      return res.status(400).json({ error: "Type and description are required" });
    }

    const newRequest = {
      id: Date.now().toString(),
      type,
      description,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      userId: req.body.userId || 'anonymous'
    };

    res.status(201).json(newRequest);
  });

  app.get("/api/compliance/data-export", (req, res) => {
    const exportData = {
      personalData: {
        name: "John Doe",
        email: "john.doe@example.com",
        accountCreated: "2024-01-15T10:00:00Z",
        lastLogin: new Date().toISOString()
      },
      privacySettings: {
        marketing: false,
        analytics: false,
        dataProcessing: true
      },
      activityLog: [
        {
          action: "login",
          timestamp: new Date().toISOString(),
          ipAddress: "192.168.1.1"
        }
      ],
      dataProcessingActivities: [
        {
          purpose: "Service Provision",
          legalBasis: "Contract Performance",
          dataTypes: ["Account Information", "Usage Data"]
        }
      ],
      exportedAt: new Date().toISOString()
    };

    res.json(exportData);
  });

  app.delete("/api/compliance/data-deletion", (req, res) => {
    const deletionRequest = {
      requestId: Date.now().toString(),
      status: 'processing',
      submittedAt: new Date().toISOString(),
      estimatedCompletion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };

    res.json(deletionRequest);
  });

  app.get("/api/compliance/cookie-preferences", (req, res) => {
    const preferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
      consentDate: null
    };
    res.json(preferences);
  });

  app.put("/api/compliance/cookie-preferences", (req, res) => {
    const { necessary, analytics, marketing, functional } = req.body;
    
    const updatedPreferences = {
      necessary: true,
      analytics: !!analytics,
      marketing: !!marketing,
      functional: !!functional,
      consentDate: new Date().toISOString()
    };

    res.json(updatedPreferences);
  });

  app.get("/api/compliance/encryption-status", (req, res) => {
    const encryptionStatus = {
      atRest: {
        algorithm: "AES-256-GCM",
        keyManagement: "Hardware Security Module",
        status: "Active"
      },
      inTransit: {
        protocol: "TLS 1.3",
        certificate: "Extended Validation SSL",
        status: "Active"
      },
      database: {
        encryption: "Transparent Data Encryption",
        backups: "Encrypted",
        status: "Active"
      },
      lastAudit: "2024-12-15T10:00:00Z",
      complianceLevel: "SOC 2 Type II"
    };

    res.json(encryptionStatus);
  });

  // Health Check Endpoints
  app.get("/health", async (req, res) => {
    const { healthCheckService } = await import("./services/monitoring");
    const health = await healthCheckService.getHealthStatus();
    
    res.status(health.status === 'healthy' ? 200 : 503).json(health);
  });

  app.get("/health/live", (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.get("/health/ready", async (req, res) => {
    const { healthCheckService } = await import("./services/monitoring");
    const checks = await healthCheckService.runHealthChecks();
    const isReady = Object.values(checks).every(check => check);
    
    res.status(isReady ? 200 : 503).json({
      status: isReady ? 'ready' : 'not ready',
      checks,
      timestamp: new Date().toISOString()
    });
  });

  // Performance Monitoring Endpoints
  app.get("/api/monitoring/metrics", async (req, res) => {
    const { metricsService } = await import("./services/monitoring");
    const metrics = metricsService.getMetrics();
    
    res.json(metrics);
  });

  app.get("/api/monitoring/performance", async (req, res) => {
    const { cacheService } = await import("./services/cache");
    
    const performance = {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      timestamp: new Date().toISOString(),
      cache: await cacheService.getStats(),
      eventLoop: {
        delay: process.hrtime.bigint(),
        utilization: process.cpuUsage().user / (process.cpuUsage().user + process.cpuUsage().system)
      }
    };
    
    res.json(performance);
  });

  app.get("/api/monitoring/logs", async (req, res) => {
    const fs = require('fs');
    const path = require('path');
    
    try {
      const logsDir = path.join(process.cwd(), 'logs');
      const logFiles = fs.existsSync(logsDir) ? fs.readdirSync(logsDir) : [];
      
      const logs = [];
      for (const file of logFiles.slice(0, 5)) { // Last 5 log files
        const filePath = path.join(logsDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n').filter(line => line.trim()).slice(-100); // Last 100 lines
        
        logs.push({
          file,
          lines,
          size: fs.statSync(filePath).size,
          modified: fs.statSync(filePath).mtime
        });
      }
      
      res.json({ logs, timestamp: new Date().toISOString() });
    } catch (error) {
      res.status(500).json({ error: 'Failed to read logs', timestamp: new Date().toISOString() });
    }
  });

  app.post("/api/monitoring/cache/clear", async (req, res) => {
    const { cacheService } = await import("./services/cache");
    
    try {
      await cacheService.flushAll();
      res.json({ success: true, message: 'Cache cleared successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to clear cache' });
    }
  });

  app.get("/api/monitoring/cache/stats", async (req, res) => {
    const { cacheService } = await import("./services/cache");
    const stats = await cacheService.getStats();
    
    res.json(stats);
  });

  const httpServer = createServer(app);
  return httpServer;
}