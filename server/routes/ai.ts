import { Router, Request, Response } from "express";
import { openAIService } from "../services/openai-service";
import { authenticateToken } from "../services/auth";

const router = Router();

// Contract analysis endpoint
router.post("/cases/:caseId/analyze-contract", authenticateToken, async (req: Request, res: Response) => {
  try {
    const { contractText } = req.body;
    const { caseId } = req.params;
    
    if (!contractText) {
      return res.status(400).json({ error: "Contract text is required" });
    }

    // Get case context if needed (could fetch from database)
    const caseContext = {
      caseId,
      timestamp: new Date().toISOString()
    };

    const result = await openAIService.analyzeContract(contractText, caseContext);
    res.json(result);
  } catch (error: any) {
    console.error("Contract analysis error:", error);
    res.status(500).json({ 
      error: "Failed to analyze contract", 
      message: error.message 
    });
  }
});

// Next best action endpoint
router.post("/cases/:caseId/next-action", authenticateToken, async (req: Request, res: Response) => {
  try {
    const { caseId } = req.params;
    const caseData = req.body.caseData || {
      caseId,
      type: req.body.caseType || "general",
      status: req.body.status || "active",
      lastActivity: new Date().toISOString()
    };

    const result = await openAIService.getNextBestAction(caseData);
    res.json(result);
  } catch (error: any) {
    console.error("Next action error:", error);
    res.status(500).json({ 
      error: "Failed to generate next actions", 
      message: error.message 
    });
  }
});

// Document generation endpoint
router.post("/cases/:caseId/documents/generate", authenticateToken, async (req: Request, res: Response) => {
  try {
    const { type, requirements } = req.body;
    const { caseId } = req.params;
    
    if (!type) {
      return res.status(400).json({ error: "Document type is required" });
    }

    const caseData = {
      caseId,
      ...req.body.caseData
    };

    const result = await openAIService.generateDocument(type, caseData, requirements);
    res.json(result);
  } catch (error: any) {
    console.error("Document generation error:", error);
    res.status(500).json({ 
      error: "Failed to generate document", 
      message: error.message 
    });
  }
});

// Case insights endpoint
router.post("/cases/:caseId/insights", authenticateToken, async (req: Request, res: Response) => {
  try {
    const { caseId } = req.params;
    const caseData = req.body.caseData || {
      caseId,
      description: req.body.description,
      parties: req.body.parties,
      claims: req.body.claims
    };

    const result = await openAIService.getCaseInsights(caseData);
    res.json(result);
  } catch (error: any) {
    console.error("Case insights error:", error);
    res.status(500).json({ 
      error: "Failed to generate insights", 
      message: error.message 
    });
  }
});

// Evidence analysis endpoint
router.post("/cases/:caseId/analyze-evidence", authenticateToken, async (req: Request, res: Response) => {
  try {
    const { evidenceDescription } = req.body;
    const { caseId } = req.params;
    
    if (!evidenceDescription) {
      return res.status(400).json({ error: "Evidence description is required" });
    }

    const caseContext = {
      caseId,
      ...req.body.caseContext
    };

    const result = await openAIService.analyzeEvidence(evidenceDescription, caseContext);
    res.json(result);
  } catch (error: any) {
    console.error("Evidence analysis error:", error);
    res.status(500).json({ 
      error: "Failed to analyze evidence", 
      message: error.message 
    });
  }
});

// Case summary endpoint
router.post("/cases/:caseId/summary", authenticateToken, async (req: Request, res: Response) => {
  try {
    const { caseId } = req.params;
    const caseData = req.body.caseData || {
      caseId,
      ...req.body
    };

    const result = await openAIService.generateCaseSummary(caseData);
    res.json(result);
  } catch (error: any) {
    console.error("Case summary error:", error);
    res.status(500).json({ 
      error: "Failed to generate summary", 
      message: error.message 
    });
  }
});

// Chat endpoint for AI assistant
router.post("/chat", authenticateToken, async (req: Request, res: Response) => {
  try {
    const { message, conversationHistory } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const response = await openAIService.chatWithAssistant(message, conversationHistory);
    res.json({ 
      success: true,
      response,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("Chat error:", error);
    res.status(500).json({ 
      error: "Chat service unavailable", 
      message: error.message 
    });
  }
});

// Live chat support endpoint (no auth required for landing page)
router.post("/chat/support", async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const response = await openAIService.chatWithAssistant(message);
    res.json({ 
      success: true,
      response,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("Support chat error:", error);
    res.status(500).json({ 
      error: "Support chat unavailable", 
      message: error.message 
    });
  }
});

export default router;