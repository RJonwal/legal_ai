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
    // For now, always use mock documents
    console.log("Using mock document generation for:", request.type);
    return this.generateMockDocument(request);
  }

  private generateMockDocument(request: DocumentGenerationRequest): DocumentGenerationResponse {
    const mockTemplates = {
      'contract': {
        title: 'Contract Analysis Report',
        content: `CONTRACT ANALYSIS REPORT\n\nExecutive Summary:\nComprehensive review of the contract dated ${new Date().toLocaleDateString()} reveals several critical areas requiring immediate attention.\n\nKey Findings:\n1. CRITICAL ISSUE: Breach of Section 4.2 - Delivery Timeline\n   The contract stipulates completion by February 15, 2024. Current status shows 30-day delay.\n\n2. MODERATE ISSUE: Ambiguous termination language in Section 7.1\n   Termination clause lacks clarity on notice periods and cure provisions.\n\n3. FAVORABLE: Strong liquidated damages provision (Section 9.3)\n   Well-drafted clause providing $1,667 per day for delays.\n\nRecommendations:\n1. Send formal breach notice immediately\n2. Calculate damages for 30-day delay period\n3. Consider settlement negotiations\n4. Prepare for potential litigation\n\nRisk Assessment: MODERATE to HIGH\nEstimated Damages: $50,000-$75,000\nSettlement Likelihood: 75%`,
        documentType: 'contract_analysis'
      },
      'brief': {
        title: 'Legal Brief',
        content: `LEGAL BRIEF\n\nDate: ${new Date().toLocaleDateString()}\n\nTO THE HONORABLE COURT:\n\nI. INTRODUCTION\nThis brief addresses the motion for summary judgment filed by defendant.\n\nII. STATEMENT OF FACTS\n1. Plaintiff and defendant entered into contract on January 15, 2024\n2. Contract required completion by February 15, 2024\n3. Defendant failed to complete work as of March 15, 2024\n\nIII. ARGUMENT\nA. Legal Standard\nSummary judgment is appropriate when no genuine issue of material fact exists.\n\nB. Analysis\nDefendant's breach is undisputed and damages are readily calculable.\n\nIV. CONCLUSION\nFor the foregoing reasons, plaintiff's motion should be granted.\n\nRespectfully submitted,\n[ATTORNEY NAME]`,
        documentType: 'legal_brief'
      },
      'memo': {
        title: 'Case Strategy Analysis',
        content: `STRATEGIC ANALYSIS\n\nCASE STRENGTH: Strong (85% win probability)\nSETTLEMENT LIKELIHOOD: High (75%)\nESTIMATED TIMELINE: 6-8 months\n\nIMMEDIATE ACTIONS:\n1. Send breach notice letter\n2. File discovery requests\n3. Begin settlement negotiations\n\nRECOMMENDED SETTLEMENT: $95,000-$110,000\n\nLITIGATION COSTS: $40,000-$60,000\nRECOVERY PROBABILITY: 85%`,
        documentType: 'strategy_memo'
      },
      'discovery': {
        title: 'Discovery Request Document',
        content: `DISCOVERY REQUEST\n\nDate: ${new Date().toLocaleDateString()}\n\nRE: Request for Production of Documents\n\nPursuant to Rule 34 of the Federal Rules of Civil Procedure, plaintiff requests defendant produce the following documents:\n\n1. All contracts related to the construction project\n2. Payment records and invoices\n3. Correspondence between parties\n4. Project specifications and change orders\n\nThese documents must be produced within 30 days.\n\nRespectfully,\n[ATTORNEY NAME]`,
        documentType: 'discovery_request'
      },
      'motion': {
        title: 'Motion for Summary Judgment',
        content: `MOTION FOR SUMMARY JUDGMENT\n\nDate: ${new Date().toLocaleDateString()}\n\nTO THE HONORABLE COURT:\n\nPlaintiff respectfully moves for summary judgment on all claims against defendant.\n\nSTATEMENT OF FACTS:\n1. Undisputed material breach by defendant\n2. Clear contractual obligations\n3. Damages are calculable and proven\n\nCONCLUSION:\nNo genuine issue of material fact exists. Judgment should be entered in favor of plaintiff.\n\nRespectfully,\n[ATTORNEY NAME]`,
        documentType: 'motion_summary_judgment'
      },
      'management': {
        title: 'Document Management Report',
        content: `DOCUMENT MANAGEMENT REPORT\n\nGenerated: ${new Date().toLocaleString()}\n\nDOCUMENT INVENTORY:\n• Total Documents: 25\n• Evidence Files: 8\n• Generated Drafts: 12\n• Final Documents: 5\n\nFOLDER ORGANIZATION:\n├── Evidence (8 files)\n├── Generated Drafts (12 files)\n├── Final Documents (5 files)\n└── Correspondence (0 files)\n\nRECENT ACTIVITY:\n• 3 documents generated today\n• 2 documents moved to Evidence folder\n• 1 document marked as final\n\nRECOMMENDATIONS:\n1. Archive completed discovery documents\n2. Organize correspondence by date\n3. Create subfolder for expert reports\n4. Review draft status on older documents\n\nDOCUMENT STATUS SUMMARY:\n• Draft: 18 documents\n• Final: 7 documents\n• Archived: 0 documents`,
        documentType: 'document_management_report'
      },
      'index': {
        title: 'Document Index Report',
        content: `CASE DOCUMENT INDEX\n\nGenerated: ${new Date().toLocaleString()}\n\nDOCUMENT LISTING BY CATEGORY:\n\nI. PLEADINGS & MOTIONS\n   1. Complaint - Filed 01/15/2024\n   2. Answer - Filed 02/01/2024\n   3. Motion for Summary Judgment - Filed 03/01/2024\n\nII. DISCOVERY MATERIALS\n   1. Request for Production - Served 02/15/2024\n   2. Interrogatories - Served 02/15/2024\n   3. Document Production - Received 03/15/2024\n\nIII. EVIDENCE & EXHIBITS\n   1. Contract Agreement - Exhibit A\n   2. Email Correspondence - Exhibit B\n   3. Project Photos - Exhibit C\n   4. Expert Report - Exhibit D\n\nIV. CORRESPONDENCE\n   1. Demand Letter - Sent 01/05/2024\n   2. Settlement Discussions - 02/20/2024\n   3. Extension Requests - Various dates\n\nV. WORK PRODUCT\n   1. Case Strategy Memo\n   2. Legal Research\n   3. Damage Calculations\n   4. Witness Interview Notes\n\nDOCUMENT COUNT: 25 total documents\nLAST UPDATED: ${new Date().toLocaleDateString()}`,
        documentType: 'document_index_report'
      }
    };

    // Safely handle request.type that might be undefined
    const requestType = request.type || 'General Document';
    const lowerType = requestType.toLowerCase();

    console.log('Generating mock document for type:', requestType);

    // Enhanced matching for document types
    let matchedKey = 'default';

    for (const [key, template] of Object.entries(mockTemplates)) {
      if (lowerType.includes(key) || 
          key.includes(lowerType) ||
          lowerType.includes(template.documentType) ||
          template.title.toLowerCase().includes(lowerType)) {
        matchedKey = key;
        break;
      }
    }

    // Additional specific matches
    if (lowerType.includes('notice') || lowerType.includes('breach')) matchedKey = 'breach';
    if (lowerType.includes('settlement') || lowerType.includes('demand')) matchedKey = 'settlement';
    if (lowerType.includes('discovery') || lowerType.includes('production')) matchedKey = 'discovery';
    if (lowerType.includes('summary') || lowerType.includes('judgment')) matchedKey = 'motion';
    if (lowerType.includes('compel')) matchedKey = 'compel';
    if (lowerType.includes('deposition') || lowerType.includes('witness')) matchedKey = 'deposition';
    if (lowerType.includes('damage') || lowerType.includes('calculation')) matchedKey = 'damages';
    if (lowerType.includes('strategy') || lowerType.includes('analysis') || lowerType.includes('memo')) matchedKey = 'strategy';

    if (matchedKey === 'default') {
      return {
        title: `${requestType}`,
        content: `${requestType.toUpperCase()}\n\nGenerated: ${new Date().toLocaleString()}\nCase: ${request.caseContext}\n\nThis is a comprehensive legal document prepared for your case.\n\nEXECUTIVE SUMMARY:\nThis document addresses the specific legal requirements and strategic considerations for your matter.\n\nKEY FINDINGS:\n1. Legal Analysis and Recommendations\n2. Procedural Requirements and Deadlines\n3. Strategic Options and Risk Assessment\n4. Next Steps and Implementation Plan\n\nRECOMMENDATIONS:\nBased on our analysis, we recommend proceeding with the outlined strategy to maximize favorable outcomes while minimizing risk exposure.\n\nCONCLUSION:\nThis matter requires prompt attention and strategic implementation of the recommended actions.\n\nPrepared by: [ATTORNEY NAME]\nDate: ${new Date().toLocaleDateString()}`,
        documentType: requestType.toLowerCase().replace(/\s+/g, '_')
      };
    }

    const template = mockTemplates[matchedKey];
    console.log('Using template:', matchedKey, 'for document type:', requestType);

    return {
      title: template.title,
      content: template.content.replace(/\[ATTORNEY NAME\]/g, 'Sarah Johnson, Esq.'),
      documentType: template.documentType
    };
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