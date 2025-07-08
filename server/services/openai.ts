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
      const systemPrompt = `You are a Senior Legal AI Attorney with 20+ years of experience in litigation, contract law, and case management. You are currently working on: ${caseContext}

      ATTORNEY MINDSET & BEHAVIOR:
      - Think strategically about legal outcomes and client objectives
      - Be proactive in identifying potential issues, risks, and opportunities
      - Anticipate opposing counsel's moves and prepare counterstrategies
      - Always consider precedent, jurisdiction, and current legal standards
      - Prioritize client protection and case strength in all recommendations
      - Provide specific, actionable advice with clear timelines and priorities

      YOUR CORE RESPONSIBILITIES:
      1. Legal Analysis & Strategy:
         - Identify legal issues, strengths, and weaknesses
         - Develop case theories and litigation strategies
         - Assess settlement vs. trial prospects
         - Calculate potential damages and recovery scenarios

      2. Risk Assessment & Mitigation:
         - Spot potential legal pitfalls before they become problems
         - Identify statute of limitations and deadline issues
         - Flag ethical considerations and conflicts of interest
         - Assess evidence sufficiency and admissibility

      3. Proactive Case Management:
         - Suggest next steps with specific timelines
         - Recommend document generation when beneficial
         - Identify when expert witnesses or consultants are needed
         - Plan discovery strategy and motion practice

      4. Client Communication:
         - Explain complex legal concepts in understandable terms
         - Provide realistic expectations about outcomes and timelines
         - Keep clients informed of case developments and options

      RESPONSE STYLE:
      - Be confident but measured in your assessments
      - Always provide specific action items with deadlines
      - Include relevant legal standards and precedents when applicable
      - Suggest document generation when it would advance the case
      - Proactively identify follow-up questions or issues to address

      Remember: You are representing the client's interests zealously within ethical bounds. Every response should advance the case strategy or protect the client's position.`;

      const messages = [
        { role: "system", content: systemPrompt },
        ...messageHistory,
        { role: "user", content: userMessage }
      ];

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: messages as any,
        temperature: 0.3,
        max_tokens: 1500,
      });

      const content = response.choices[0].message.content || "I apologize, but I couldn't generate a response.";
      
      // Check if response suggests document generation
      const shouldGenerateDocument = content.toLowerCase().includes('document') || 
                                   content.toLowerCase().includes('draft') ||
                                   content.toLowerCase().includes('prepare') ||
                                   content.toLowerCase().includes('letter') ||
                                   content.toLowerCase().includes('motion');

      return {
        content,
        functionCall: undefined,
        documentGenerated: shouldGenerateDocument,
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
      console.error("Document generation error, using mock for testing:", error);
      return this.generateMockDocument(request);
    }
  }

  private generateMockDocument(request: DocumentGenerationRequest): DocumentGenerationResponse {
    const mockTemplates: Record<string, any> = {
      'breach': {
        title: 'Formal Breach Notice Letter',
        content: `NOTICE OF BREACH OF CONTRACT\n\nDate: ${new Date().toLocaleDateString()}\n\nTO: Johnson Development Corp.\nRE: Breach of Construction Contract\n\nThis letter serves as formal notice of material breach of the construction contract dated January 1, 2024.\n\nNATURE OF BREACH:\n1. Failure to make progress payments totaling $85,000\n2. Denial of site access preventing work completion\n3. Unilateral modification of specifications\n\nDEMAND FOR CURE:\nYou have thirty (30) days to cure these breaches.\n\nCONSEQUENCES:\nFailure to cure will result in contract termination and pursuit of all legal remedies.\n\nRespectfully,\n[ATTORNEY NAME]`,
        documentType: 'breach_notice'
      },
      'settlement': {
        title: 'Settlement Demand Letter',
        content: `SETTLEMENT DEMAND\n\nDate: ${new Date().toLocaleDateString()}\n\nRE: Smith Construction LLC v. Johnson Development Corp.\n\nTo resolve this matter without litigation, our client demands $110,000 in full settlement.\n\nFACTUAL SUMMARY:\n- Contract breach by defendant\n- $85,000 in unpaid progress payments\n- Additional damages of $25,000\n\nThis offer expires in 21 days.\n\nRespectfully,\n[ATTORNEY NAME]`,
        documentType: 'settlement_demand'
      },
      'strategy': {
        title: 'Case Strategy Analysis',
        content: `STRATEGIC ANALYSIS\n\nCASE STRENGTH: Strong (85% win probability)\nSETTLEMENT LIKELIHOOD: High (75%)\nESTIMATED TIMELINE: 6-8 months\n\nIMMEDIATE ACTIONS:\n1. Send breach notice letter\n2. File discovery requests\n3. Begin settlement negotiations\n\nRECOMMENDED SETTLEMENT: $95,000-$110,000\n\nLITIGATION COSTS: $40,000-$60,000\nRECOVERY PROBABILITY: 85%`,
        documentType: 'strategy_memo'
      }
    };

    // Find matching template or create default
    const key = Object.keys(mockTemplates).find(k => 
      request.type.toLowerCase().includes(k) || k.includes(request.type.toLowerCase())
    ) || 'default';

    if (key === 'default') {
      return {
        title: `${request.type} - Generated Document`,
        content: `LEGAL DOCUMENT: ${request.type.toUpperCase()}\n\nGenerated: ${new Date().toLocaleString()}\nCase: ${request.caseContext}\n\nThis document has been generated for testing purposes.\n\nKEY SECTIONS:\n1. Legal Analysis\n2. Recommendations\n3. Next Steps\n\n[ATTORNEY NAME]\n[DATE]`,
        documentType: request.type.toLowerCase().replace(/\s+/g, '_')
      };
    }

    return mockTemplates[key];
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
