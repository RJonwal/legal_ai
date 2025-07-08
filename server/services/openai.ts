import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface ChatResponse {
  content: string;
  functionCall?: string;
  documentGenerated?: boolean;
}

export interface DocumentGenerationRequest {
  type: string;
  caseContext: string;
  specificInstructions?: string;
}

export interface DocumentGenerationResponse {
  title: string;
  content: string;
  documentType: string;
}

export class OpenAIService {
  async generateChatResponse(
    userMessage: string,
    caseContext: string,
    messageHistory: Array<{ role: string; content: string }>
  ): Promise<ChatResponse> {
    try {
      const systemPrompt = `You are a Legal AI Assistant specialized in legal case management and analysis. You are currently working on: ${caseContext}
      
      Your capabilities include:
      - Legal document analysis and review
      - Case strategy and planning
      - Contract analysis and breach identification
      - Evidence analysis and organization
      - Legal research and precedent identification
      - Document drafting and generation
      - Timeline and deadline management
      - Next best action recommendations
      
      Always provide detailed, professional legal analysis while noting that your advice should be reviewed by qualified legal counsel.`;

      const messages = [
        { role: "system", content: systemPrompt },
        ...messageHistory,
        { role: "user", content: userMessage }
      ];

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: messages as any,
        temperature: 0.7,
        max_tokens: 1000,
      });

      return {
        content: response.choices[0].message.content || "I apologize, but I couldn't generate a response.",
        functionCall: undefined,
        documentGenerated: false,
      };
    } catch (error) {
      console.error("OpenAI API error:", error);
      throw new Error("Failed to generate AI response");
    }
  }

  async generateDocument(request: DocumentGenerationRequest): Promise<DocumentGenerationResponse> {
    try {
      const prompt = `Generate a professional legal document of type: ${request.type}
      
      Case Context: ${request.caseContext}
      
      Specific Instructions: ${request.specificInstructions || "Create a comprehensive document following standard legal practices"}
      
      Please provide:
      1. An appropriate document title
      2. Professional legal document content with proper formatting
      3. All necessary legal disclaimers and standard clauses
      
      Format your response as a JSON object with 'title', 'content', and 'documentType' fields.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are a legal document drafting specialist. Generate professional legal documents with proper formatting and legal language." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 2000,
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      return {
        title: result.title || "Generated Legal Document",
        content: result.content || "Document generation failed",
        documentType: result.documentType || request.type,
      };
    } catch (error) {
      console.error("Document generation error:", error);
      throw new Error("Failed to generate document");
    }
  }

  async analyzeContract(contractText: string, caseContext: string): Promise<any> {
    try {
      const prompt = `Analyze the following contract for potential issues, breaches, and opportunities:
      
      Contract Text: ${contractText}
      Case Context: ${caseContext}
      
      Please provide a detailed analysis including:
      1. Critical issues (breaches, violations)
      2. Moderate issues (ambiguities, potential problems)
      3. Favorable provisions (client advantages)
      4. Recommendations for next steps
      
      Format your response as a JSON object with structured analysis.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are a contract analysis specialist. Provide detailed legal analysis of contracts identifying issues and opportunities." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 1500,
      });

      return JSON.parse(response.choices[0].message.content || "{}");
    } catch (error) {
      console.error("Contract analysis error:", error);
      throw new Error("Failed to analyze contract");
    }
  }

  async generateNextBestAction(caseContext: string, caseHistory: string): Promise<any> {
    try {
      const prompt = `Based on the case context and history, recommend the next best actions:
      
      Case Context: ${caseContext}
      Case History: ${caseHistory}
      
      Please provide prioritized recommendations with:
      1. Immediate actions (within 1 week)
      2. Short-term actions (within 1 month)
      3. Long-term strategic actions
      
      For each action, include timeline, priority level, and rationale.
      
      Format your response as a JSON object with structured recommendations.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are a legal strategy specialist. Provide actionable recommendations for legal case management." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.4,
        max_tokens: 1000,
      });

      return JSON.parse(response.choices[0].message.content || "{}");
    } catch (error) {
      console.error("Next best action generation error:", error);
      throw new Error("Failed to generate next best action");
    }
  }
}

export const openaiService = new OpenAIService();
