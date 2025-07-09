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
      
      // Mock file upload processing for now
      // In a real implementation, you would use multer or similar middleware
      const mockFiles = [
        {
          id: Date.now(),
          name: "uploaded_document.pdf",
          size: 1024 * 1024, // 1MB
          type: "application/pdf",
          uploadedAt: new Date().toISOString(),
          isDuplicate: false
        }
      ];

      // Create document records for uploaded files
      const documents = [];
      for (const file of mockFiles) {
        const document = await storage.createDocument({
          caseId,
          title: file.name,
          content: `Document uploaded: ${file.name}\n\nFile Details:\n- Size: ${(file.size / 1024).toFixed(1)} KB\n- Type: ${file.type}\n- Uploaded: ${new Date(file.uploadedAt).toLocaleString()}\n\nThis document has been successfully uploaded and is available for analysis and review.`,
          documentType: 'uploaded_file',
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
      const { title, content, status } = req.body;

      const document = await storage.updateDocument(documentId, {
        title,
        content,
        status,
      });

      res.json(document);
    } catch (error) {
      res.status(500).json({ message: "Failed to update document" });
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