import OpenAI from "openai";
import { aiServiceProvider } from "./ai-service-provider";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

// Initialize OpenAI client with fallback provider support
const getAIClient = () => {
  return aiServiceProvider.getPrimaryClient();
};

// Fallback to direct OpenAI client for now until all services are migrated
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY!
});

// System prompts for different AI services
const SYSTEM_PROMPTS = {
  SENIOR_ATTORNEY: `You are a senior legal AI attorney with 20+ years of experience. You think strategically, proactively identify legal issues, and provide comprehensive legal analysis. Always consider:
- Procedural requirements and deadlines
- Evidentiary standards and burdens of proof
- Applicable statutes and case law
- Strategic advantages and risks
- Alternative legal theories and defenses
Provide actionable recommendations with clear reasoning.`,

  CONTRACT_ANALYZER: `You are an expert contract attorney specializing in contract analysis. Analyze contracts for:
- Key terms and conditions
- Potential risks and liabilities
- Missing or ambiguous clauses
- Unfavorable terms
- Negotiation points
- Compliance with applicable laws
Provide a structured analysis with specific recommendations.`,

  DOCUMENT_GENERATOR: `You are a legal document drafting expert. Generate professional legal documents that are:
- Properly formatted with court-compliant styling
- Legally sound and comprehensive
- Clear and persuasive
- Tailored to the specific case and jurisdiction
- Include all necessary legal citations and references
Follow standard legal document formatting conventions.`,

  CASE_STRATEGIST: `You are a litigation strategist with expertise in case planning. Provide:
- Strategic case assessment
- Strengths and weaknesses analysis
- Recommended next steps with priorities
- Timeline and milestone planning
- Risk assessment and mitigation strategies
- Alternative dispute resolution options
Be specific and actionable in your recommendations.`,

  LEGAL_CHAT: `You are a helpful legal assistant AI. Provide clear, accurate legal information while being professional and supportive. 
- Answer questions about legal procedures and concepts
- Explain legal terms in plain language
- Provide general guidance while noting when specific legal advice is needed
- Be empathetic and understanding of legal challenges
Always remind users that AI assistance supplements but doesn't replace professional legal counsel when appropriate.`
};

export class OpenAIService {
  // Analyze a contract using AI
  async analyzeContract(contractText: string, caseContext?: any): Promise<any> {
    try {
      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPTS.CONTRACT_ANALYZER },
          { 
            role: "user", 
            content: `Analyze the following contract and provide a comprehensive legal analysis:\n\n${contractText}\n\nCase Context: ${JSON.stringify(caseContext || {})}` 
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 2000
      });

      const analysis = JSON.parse(response.choices[0].message.content || "{}");
      
      return {
        success: true,
        analysis: {
          summary: analysis.summary || "Contract analysis completed",
          keyTerms: analysis.keyTerms || [],
          risks: analysis.risks || [],
          opportunities: analysis.opportunities || [],
          recommendations: analysis.recommendations || [],
          redFlags: analysis.redFlags || [],
          negotiationPoints: analysis.negotiationPoints || [],
          compliance: analysis.compliance || {},
          overallAssessment: analysis.overallAssessment || "Requires further review"
        }
      };
    } catch (error: any) {
      console.error("Contract analysis error:", error);
      throw new Error(`Failed to analyze contract: ${error.message}`);
    }
  }

  // Get next best action recommendations
  async getNextBestAction(caseData: any): Promise<any> {
    try {
      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPTS.CASE_STRATEGIST },
          { 
            role: "user", 
            content: `Based on the following case information, provide strategic next action recommendations:\n\nCase Data: ${JSON.stringify(caseData)}` 
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.4,
        max_tokens: 1500
      });

      const strategy = JSON.parse(response.choices[0].message.content || "{}");
      
      return {
        success: true,
        strategy: {
          immediateActions: strategy.immediateActions || [],
          shortTermStrategy: strategy.shortTermStrategy || [],
          longTermStrategy: strategy.longTermStrategy || [],
          criticalDeadlines: strategy.criticalDeadlines || [],
          riskAssessment: strategy.riskAssessment || {},
          alternativeOptions: strategy.alternativeOptions || [],
          priorityLevel: strategy.priorityLevel || "medium",
          estimatedTimeline: strategy.estimatedTimeline || "To be determined"
        }
      };
    } catch (error: any) {
      console.error("Next action strategy error:", error);
      throw new Error(`Failed to generate strategy: ${error.message}`);
    }
  }

  // Generate legal document
  async generateDocument(documentType: string, caseData: any, requirements?: any): Promise<any> {
    try {
      const prompt = `Generate a professional legal ${documentType} with the following details:
      Case Information: ${JSON.stringify(caseData)}
      Specific Requirements: ${JSON.stringify(requirements || {})}
      
      Format the document properly with:
      - Appropriate legal headers and captions
      - Numbered paragraphs where applicable
      - Proper legal formatting and structure
      - Professional legal language`;

      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPTS.DOCUMENT_GENERATOR },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 3000
      });

      const content = response.choices[0].message.content || "";
      
      return {
        success: true,
        document: {
          type: documentType,
          content: content,
          title: `${documentType.charAt(0).toUpperCase() + documentType.slice(1)} Document`,
          generatedAt: new Date().toISOString(),
          wordCount: content.split(/\s+/).length,
          requiresReview: true
        }
      };
    } catch (error: any) {
      console.error("Document generation error:", error);
      throw new Error(`Failed to generate document: ${error.message}`);
    }
  }

  // Chat with AI assistant
  async chatWithAssistant(message: string, conversationHistory?: any[]): Promise<string> {
    try {
      const messages: any[] = [
        { role: "system", content: SYSTEM_PROMPTS.LEGAL_CHAT }
      ];

      // Add conversation history if provided
      if (conversationHistory && conversationHistory.length > 0) {
        messages.push(...conversationHistory.slice(-10)); // Keep last 10 messages for context
      }

      messages.push({ role: "user", content: message });

      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: messages,
        temperature: 0.7,
        max_tokens: 800
      });

      return response.choices[0].message.content || "I apologize, but I couldn't generate a response. Please try again.";
    } catch (error: any) {
      console.error("Chat assistant error:", error);
      throw new Error(`Chat service temporarily unavailable: ${error.message}`);
    }
  }

  // Get case insights and analysis
  async getCaseInsights(caseData: any): Promise<any> {
    try {
      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPTS.SENIOR_ATTORNEY },
          { 
            role: "user", 
            content: `Provide comprehensive legal insights for this case:\n\nCase Information: ${JSON.stringify(caseData)}` 
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.4,
        max_tokens: 2000
      });

      const insights = JSON.parse(response.choices[0].message.content || "{}");
      
      return {
        success: true,
        insights: {
          caseStrength: insights.caseStrength || "Moderate",
          keyIssues: insights.keyIssues || [],
          legalTheories: insights.legalTheories || [],
          potentialDefenses: insights.potentialDefenses || [],
          evidenceNeeded: insights.evidenceNeeded || [],
          proceduraalConsiderations: insights.proceduralConsiderations || [],
          settlementRange: insights.settlementRange || {},
          successProbability: insights.successProbability || "50%",
          recommendations: insights.recommendations || []
        }
      };
    } catch (error: any) {
      console.error("Case insights error:", error);
      throw new Error(`Failed to generate insights: ${error.message}`);
    }
  }

  // Analyze evidence
  async analyzeEvidence(evidenceDescription: string, caseContext?: any): Promise<any> {
    try {
      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPTS.SENIOR_ATTORNEY },
          { 
            role: "user", 
            content: `Analyze the following evidence for legal significance:\n\nEvidence: ${evidenceDescription}\n\nCase Context: ${JSON.stringify(caseContext || {})}` 
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 1500
      });

      const analysis = JSON.parse(response.choices[0].message.content || "{}");
      
      return {
        success: true,
        analysis: {
          relevance: analysis.relevance || "Potentially relevant",
          admissibility: analysis.admissibility || {},
          strengths: analysis.strengths || [],
          weaknesses: analysis.weaknesses || [],
          authentication: analysis.authentication || {},
          foundationRequired: analysis.foundationRequired || [],
          potentialObjections: analysis.potentialObjections || [],
          strategicUse: analysis.strategicUse || [],
          recommendations: analysis.recommendations || []
        }
      };
    } catch (error: any) {
      console.error("Evidence analysis error:", error);
      throw new Error(`Failed to analyze evidence: ${error.message}`);
    }
  }

  // Generate case summary
  async generateCaseSummary(caseData: any): Promise<any> {
    try {
      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPTS.SENIOR_ATTORNEY },
          { 
            role: "user", 
            content: `Generate a comprehensive case summary:\n\nCase Data: ${JSON.stringify(caseData)}` 
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 1500
      });

      const summary = JSON.parse(response.choices[0].message.content || "{}");
      
      return {
        success: true,
        summary: {
          overview: summary.overview || "",
          parties: summary.parties || {},
          claims: summary.claims || [],
          keyFacts: summary.keyFacts || [],
          proceduralHistory: summary.proceduralHistory || [],
          currentStatus: summary.currentStatus || "",
          upcomingDeadlines: summary.upcomingDeadlines || [],
          strategicConsiderations: summary.strategicConsiderations || []
        }
      };
    } catch (error: any) {
      console.error("Case summary error:", error);
      throw new Error(`Failed to generate summary: ${error.message}`);
    }
  }
}

export const openAIService = new OpenAIService();