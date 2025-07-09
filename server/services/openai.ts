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
      'compel': {
        title: 'Motion to Compel Discovery',
        content: `MOTION TO COMPEL DISCOVERY\n\nDate: ${new Date().toLocaleDateString()}\n\nTO THE HONORABLE COURT:\n\nPlaintiff moves to compel defendant's responses to discovery requests served on ${new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toLocaleDateString()}.\n\nDEFENDANT'S DEFICIENCIES:\n1. Incomplete responses to interrogatories\n2. Failure to produce requested documents\n3. Objections lack good faith basis\n\nRELIEF REQUESTED:\nOrder compelling full responses within 14 days and award of attorney fees.\n\nRespectfully,\n[ATTORNEY NAME]`,
        documentType: 'motion_to_compel'
      },
      'deposition': {
        title: 'Deposition Outline',
        content: `DEPOSITION OUTLINE\n\nWitness: [WITNESS NAME]\nDate: ${new Date().toLocaleDateString()}\nTime: [TIME]\nLocation: [LOCATION]\n\nOBJECTIVES:\n1. Establish timeline of events\n2. Obtain admissions regarding breach\n3. Identify additional witnesses/documents\n\nKEY TOPICS:\n1. Background and role in project\n2. Contract negotiations and terms\n3. Performance issues and communications\n4. Knowledge of breach events\n5. Damages and mitigation efforts\n\nDOCUMENTS TO REVIEW:\n- Original contract\n- Email correspondence\n- Project timelines\n- Payment records\n\nPrepared by: [ATTORNEY NAME]`,
        documentType: 'deposition_outline'
      },
      'damages': {
        title: 'Damages Calculation Worksheet',
        content: `DAMAGES CALCULATION\n\nCase: ${request.caseContext}\nDate: ${new Date().toLocaleDateString()}\n\nDIRECT DAMAGES:\n1. Unpaid contract amounts: $85,000\n2. Additional labor costs: $15,000\n3. Material cost increases: $8,000\n   Subtotal Direct: $108,000\n\nCONSEQUENTIAL DAMAGES:\n1. Lost profits on delayed projects: $25,000\n2. Equipment rental extensions: $5,000\n   Subtotal Consequential: $30,000\n\nTOTAL DAMAGES: $138,000\n\nMITIGATION EFFORTS:\n- Secured alternative financing\n- Negotiated payment plans with suppliers\n- Reassigned crew to other projects\n\nNET RECOVERABLE DAMAGES: $120,000\n\nPrepared by: [ATTORNEY NAME]`,
        documentType: 'damages_calculation'
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
