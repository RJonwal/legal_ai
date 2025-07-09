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

  // Search cases
  app.get("/api/cases/search", async (req, res) => {
    try {
      const { query } = req.query;
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Search query is required' });
      }

      const results = await storage.searchCases(query);
      res.json(results);
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get specific case
  app.get("/api/cases/:id", async (req, res) => {
    try {
      const caseId = parseInt(req.params.id);
      const case_ = await storage.getCase(caseId);
      if (!case_) {
        return res.status(404).json({ message: "Case not found" });
      }
      res.json(case_);
    } catch (error) {
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
      const { content } = req.body;

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

      // Generate AI response
      const caseContext = `${case_.title} - ${case_.description}`;
      const aiResponse = await openaiService.generateChatResponse(
        content,
        caseContext,
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
      const { hearingType, keyArguments, anticipatedQuestions, evidenceList, opposingCounsel } = req.body;
      
      const case_ = await storage.getCase(caseId);
      if (!case_) {
        return res.status(404).json({ message: "Case not found" });
      }

      const documents = await storage.getDocumentsByCase(caseId);
      const timeline = await storage.getTimelineEvents(caseId);

      // Enhanced mock court preparation analysis
      const analysis = {
        hearing: {
          type: hearingType || 'Motion Hearing',
          preparationScore: keyArguments && evidenceList ? 92 : keyArguments ? 78 : 65,
          estimatedDuration: hearingType === 'trial' ? '3-5 days' : hearingType === 'summary-judgment' ? '2-4 hours' : '1-3 hours',
          jurisdiction: 'Superior Court of California, County of Los Angeles',
          judge: 'Hon. Michael Thompson',
          courtroom: 'Courtroom 3A',
          location: '111 N Hill St, Los Angeles, CA 90012',
          scheduledDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          scheduledTime: '9:00 AM'
        },
        legalStrategy: {
          primaryArguments: keyArguments ? keyArguments.split('\n').filter(arg => arg.trim()) : [
            'Material breach of contract clearly established',
            'Liquidated damages clause is enforceable',
            'Defendant failed to provide timely notice of delays',
            'Plaintiff has properly mitigated damages'
          ],
          evidenceStrength: evidenceList ? 'Very Strong' : documents.length > 5 ? 'Strong' : 'Moderate',
          winProbability: hearingType === 'summary-judgment' ? '85%' : hearingType === 'trial' ? '75%' : '70%',
          settlementLikelihood: '65%',
          keyLegalStandards: [
            'Material breach requires substantial failure to perform',
            'Liquidated damages must be reasonable estimate of harm',
            'Burden of proof on plaintiff to show damages',
            'Mitigation duty requires reasonable efforts'
          ],
          precedentCases: [
            'Smith v. ABC Construction (2023) - Similar breach of contract',
            'Jones v. Reliable Contractors (2022) - Liquidated damages upheld',
            'Davis v. BuildCorp (2021) - Timeline requirements enforced'
          ]
        },
        preparation: {
          timeRequired: hearingType === 'trial' ? '6-8 weeks' : hearingType === 'summary-judgment' ? '3-4 weeks' : '2-3 weeks',
          keyTasks: [
            'Complete evidence exhibit preparation',
            'Finalize witness testimony outlines',
            'Draft and rehearse opening statement',
            'Prepare cross-examination questions',
            'Review all case law and legal precedents',
            'Coordinate with client on testimony',
            'Prepare demonstrative aids and technology',
            'File all pre-hearing motions and briefs'
          ],
          criticalDeadlines: [
            { 
              task: 'Pre-trial motions due', 
              date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              priority: 'high',
              completed: false
            },
            { 
              task: 'Witness list and exhibits filing', 
              date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
              priority: 'high',
              completed: false
            },
            { 
              task: 'Expert witness reports due', 
              date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
              priority: 'medium',
              completed: true
            },
            { 
              task: 'Settlement conference', 
              date: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(),
              priority: 'medium',
              completed: false
            }
          ]
        },
        evidence: {
          availableDocuments: documents.length,
          totalExhibits: Math.min(12, documents.length + 3),
          exhibitList: [
            {
              exhibit: 'Exhibit A',
              title: 'Original Construction Contract',
              type: 'Contract',
              relevance: 'Critical',
              status: 'Ready',
              pages: 15
            },
            {
              exhibit: 'Exhibit B',
              title: 'Email Communications',
              type: 'Correspondence',
              relevance: 'High',
              status: 'Ready',
              pages: 23
            },
            {
              exhibit: 'Exhibit C',
              title: 'Project Timeline Documentation',
              type: 'Evidence',
              relevance: 'High',
              status: 'Pending Review',
              pages: 8
            },
            {
              exhibit: 'Exhibit D',
              title: 'Expert Construction Analysis',
              type: 'Expert Report',
              relevance: 'Critical',
              status: 'Ready',
              pages: 12
            },
            {
              exhibit: 'Exhibit E',
              title: 'Damage Calculation Worksheets',
              type: 'Financial',
              relevance: 'High',
              status: 'Ready',
              pages: 6
            }
          ],
          missingEvidence: evidenceList ? [] : [
            'Signed change orders (if any)',
            'Daily progress photos',
            'Subcontractor communications',
            'Weather reports for relevant dates'
          ],
          evidenceStrengthScore: evidenceList ? 9.2 : 7.5
        },
        risks: [
          {
            type: 'procedural_compliance',
            level: keyArguments ? 'low' : 'medium',
            description: keyArguments ? 'All procedural requirements well-documented' : 'Need to review local court rules compliance',
            mitigation: 'Double-check all filing requirements and deadlines'
          },
          {
            type: 'evidence_admissibility',
            level: evidenceList ? 'low' : 'high',
            description: evidenceList ? 'Strong foundation for all evidence' : 'Some evidence may face admissibility challenges',
            mitigation: 'Prepare authentication witnesses and business records foundations'
          },
          {
            type: 'opposing_counsel_strategy',
            level: 'medium',
            description: 'Experienced defense attorney known for aggressive motion practice',
            mitigation: 'Prepare for numerous objections and procedural challenges'
          },
          {
            type: 'settlement_pressure',
            level: 'low',
            description: 'Court may encourage settlement during hearing',
            mitigation: 'Prepare client for potential settlement discussions'
          },
          {
            type: 'witness_availability',
            level: anticipatedQuestions ? 'low' : 'medium',
            description: 'Key witnesses may have scheduling conflicts',
            mitigation: 'Confirm witness availability and prepare backup testimony options'
          }
        ],
        checklist: {
          documentation: [
            { task: 'File notice of appearance', completed: true, dueDate: 'Completed' },
            { task: 'Serve opposing counsel with all pleadings', completed: true, dueDate: 'Completed' },
            { task: 'Prepare and organize all exhibits', completed: false, dueDate: '7 days before hearing' },
            { task: 'Submit pre-trial brief', completed: false, dueDate: '10 days before hearing' },
            { task: 'File witness list and exhibit list', completed: false, dueDate: '14 days before hearing' },
            { task: 'Prepare jury instructions (if applicable)', completed: false, dueDate: '7 days before hearing' }
          ],
          preparation: [
            { task: 'Review all case law and legal precedents', completed: true, dueDate: 'Ongoing' },
            { task: 'Prepare detailed opening statement', completed: false, dueDate: '3 days before hearing' },
            { task: 'Practice direct examination of witnesses', completed: false, dueDate: '1 week before hearing' },
            { task: 'Prepare cross-examination questions', completed: false, dueDate: '1 week before hearing' },
            { task: 'Draft closing argument outline', completed: false, dueDate: '3 days before hearing' },
            { task: 'Coordinate with client on testimony', completed: false, dueDate: '1 week before hearing' },
            { task: 'Prepare responses to anticipated objections', completed: false, dueDate: '3 days before hearing' }
          ],
          logistics: [
            { task: 'Confirm court date and time', completed: true, dueDate: 'Completed' },
            { task: 'Arrange client transportation to courthouse', completed: false, dueDate: 'Day before hearing' },
            { task: 'Coordinate witness schedules', completed: false, dueDate: '1 week before hearing' },
            { task: 'Test all technology and demonstratives', completed: false, dueDate: 'Day before hearing' },
            { task: 'Prepare backup copies of all documents', completed: false, dueDate: 'Day before hearing' },
            { task: 'Coordinate court reporter (if needed)', completed: false, dueDate: '1 week before hearing' },
            { task: 'Arrange parking and courthouse security', completed: false, dueDate: 'Day before hearing' }
          ]
        },
        recommendations: {
          immediate: [
            'Complete exhibit preparation within 3 days',
            'Schedule witness preparation sessions',
            'File outstanding pre-trial motions',
            'Prepare comprehensive settlement authority from client'
          ],
          strategic: [
            'Consider mediation before hearing date',
            'Prepare alternative legal theories',
            'Develop contingency plans for adverse rulings',
            'Coordinate with insurance counsel if applicable'
          ],
          tactical: [
            'Arrive 30 minutes early on hearing day',
            'Bring multiple copies of all exhibits',
            'Prepare technology backup plans',
            'Have client dress professionally and arrive early'
          ]
        },
        timeline: {
          currentStatus: 'Preparation Phase',
          nextMilestone: 'Pre-trial motions due in 7 days',
          criticalPath: [
            { phase: 'Motion Filing', deadline: '7 days', status: 'pending' },
            { phase: 'Witness Preparation', deadline: '14 days', status: 'in_progress' },
            { phase: 'Settlement Conference', deadline: '18 days', status: 'scheduled' },
            { phase: 'Final Preparation', deadline: '21 days', status: 'upcoming' },
            { phase: 'Court Hearing', deadline: '21 days', status: 'scheduled' }
          ]
        }
      };

      res.json(analysis);
    } catch (error) {
      console.error("Court preparation analysis error:", error);
      res.status(500).json({ message: "Failed to generate court preparation analysis" });
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

  // Case search route
  app.get("/api/cases/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      const cases = await storage.searchCases(query || "");
      res.json(cases);
    } catch (error) {
      res.status(500).json({ message: "Failed to search cases" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}