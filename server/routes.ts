import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { openaiService } from "./services/openai";
import { insertChatMessageSchema, insertDocumentSchema, insertTimelineSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get current user (mock for now)
  app.get("/api/user", async (req, res) => {
    try {
      const user = await storage.getUser(1); // Mock user ID
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // Get user cases
  app.get("/api/cases", async (req, res) => {
    try {
      const cases = await storage.getCasesByUser(1); // Mock user ID
      res.json(cases);
    } catch (error) {
      res.status(500).json({ message: "Failed to get cases" });
    }
  });

  // Get recent cases (top 3 most recently accessed)
  app.get("/api/cases/recent", async (req, res) => {
    try {
      const recentCases = await storage.getRecentCases(1, 3); // Get top 3 recent cases for user
      res.json(recentCases);
    } catch (error) {
      res.status(500).json({ message: "Failed to get recent cases" });
    }
  });

  // Search cases
  app.get("/api/cases/search", async (req, res) => {
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
      const messages = await storage.getChatMessages(caseId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to get messages" });
    }
  });

  // Send chat message and get AI response
  app.post("/api/cases/:id/messages", async (req, res) => {
    try {
      const caseId = parseInt(req.params.id);
      const { content, caseContext } = req.body;

      if (!content) {
        return res.status(400).json({ message: "Message content is required" });
      }

      // Get case context
      const case_ = await storage.getCase(caseId);
      if (!case_) {
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

      res.json({
        userMessage,
        assistantMessage,
        aiResponse,
      });
    } catch (error) {
      console.error("Chat message error:", error);
      res.status(500).json({ message: "Failed to process message" });
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
          progress: daysActive > 60 ? Math.min(85, Math.floor(((daysActive - 60) / 30) * 100)) : 0,
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

      console.log(`Returning ${invoices.length} invoices`);
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
    ```text
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
      const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      res.json({ 
        success: true, 
        message: `${selectedPlan.tokens.toLocaleString()} tokens purchased successfully`,
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
      res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoiceId}.pdf"`);
      res.send(Buffer.from(`Mock PDF content for invoice ${invoiceId}`, 'utf-8'));
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



  const httpServer = createServer(app);
  return httpServer;
}

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