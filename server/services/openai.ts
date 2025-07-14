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
      },
      'deposition': {
        title: 'Deposition Preparation Outline',
        content: `DEPOSITION PREPARATION OUTLINE\n\nDate: ${new Date().toLocaleDateString()}\nWitness: [WITNESS NAME]\nDeposition Type: Fact Witness\n\nI. BACKGROUND RESEARCH\n   • Review all relevant documents\n   • Analyze witness role in case\n   • Identify key testimony areas\n   • Research witness background\n\nII. QUESTION OUTLINE\n   A. Background Questions\n      1. Personal/professional background\n      2. Relationship to parties\n      3. Knowledge of relevant events\n   \n   B. Substantive Questions\n      1. Timeline of events\n      2. Document authentication\n      3. Communications and meetings\n      4. Decision-making process\n   \n   C. Challenging Areas\n      1. Inconsistent statements\n      2. Memory gaps\n      3. Potentially hostile responses\n\nIII. DOCUMENTS TO REVIEW\n   • Contract agreements\n   • Email correspondence\n   • Meeting notes\n   • Project documentation\n\nIV. STRATEGIC CONSIDERATIONS\n   • Witness credibility factors\n   • Potential objections\n   • Follow-up questions\n   • Impeachment materials\n\nV. LOGISTICS\n   • Date and time confirmation\n   • Location and setup\n   • Technology requirements\n   • Court reporter arrangements`,
        documentType: 'deposition_outline'
      },
      'question': {
        title: 'Deposition Question Bank',
        content: `DEPOSITION QUESTION BANK\n\nGenerated: ${new Date().toLocaleDateString()}\nDeposition Type: Fact Witness\n\nI. OPENING QUESTIONS\n   1. Please state your full name for the record.\n   2. What is your current address?\n   3. What is your occupation?\n   4. Have you ever been deposed before?\n   5. Do you understand you are under oath?\n\nII. BACKGROUND QUESTIONS\n   1. How long have you worked in your current position?\n   2. What are your primary responsibilities?\n   3. How did you become involved in this matter?\n   4. Who do you report to in your organization?\n\nIII. SUBSTANTIVE QUESTIONS\n   1. When did you first learn about [relevant event]?\n   2. Can you describe what happened on [specific date]?\n   3. Who else was present during this conversation?\n   4. Did you document this in any way?\n   5. What was your understanding of the agreement?\n\nIV. DOCUMENT AUTHENTICATION\n   1. Have you seen this document before?\n   2. Do you recognize the handwriting/signature?\n   3. Were you involved in creating this document?\n   4. Is this document accurate to your knowledge?\n\nV. CLOSING QUESTIONS\n   1. Is there anything else relevant to this case?\n   2. Have I asked you about everything you know?\n   3. Would you answer differently if asked again?\n   4. Is your testimony complete and truthful?\n\nSTRATEGIC NOTES:\n• Listen carefully to answers\n• Follow up on inconsistencies\n• Use documents to refresh memory\n• Maintain professional demeanor`,
        documentType: 'question_bank'
      },
      'witness': {
        title: 'Witness Preparation Strategy',
        content: `WITNESS PREPARATION STRATEGY\n\nDate: ${new Date().toLocaleDateString()}\nWitness: [WITNESS NAME]\nCase: [CASE TITLE]\n\nI. WITNESS PROFILE\n   • Background and credibility factors\n   • Relationship to case events\n   • Potential biases or motivations\n   • Communication style and demeanor\n\nII. KEY TESTIMONY AREAS\n   1. Timeline of Events\n      - Specific dates and sequences\n      - Witness's direct observations\n      - Secondary information sources\n   \n   2. Document Knowledge\n      - Creation and review of documents\n      - Understanding of terms and provisions\n      - Changes or modifications made\n   \n   3. Communications\n      - Meetings attended\n      - Phone calls and conversations\n      - Email exchanges\n\nIII. POTENTIAL PROBLEM AREAS\n   • Memory gaps or uncertainties\n   • Inconsistent prior statements\n   • Bias or self-interest issues\n   • Technical or complex subjects\n\nIV. PREPARATION STRATEGY\n   1. Document Review Session\n      - Chronological document review\n      - Key document identification\n      - Refresh memory on details\n   \n   2. Practice Questions\n      - Anticipated deposition questions\n      - Difficult or challenging areas\n      - Proper response techniques\n   \n   3. Coaching Guidelines\n      - Tell the truth completely\n      - Listen to questions carefully\n      - Answer only what is asked\n      - Say "I don't know" when appropriate\n\nV. DEPOSITION DAY CHECKLIST\n   □ Final document review\n   □ Witness instruction reminder\n   □ Logistical arrangements confirmed\n   □ Support materials organized`,
        documentType: 'witness_strategy'
      },
      'checklist': {
        title: 'Deposition Document Checklist',
        content: `DEPOSITION DOCUMENT CHECKLIST\n\nDate: ${new Date().toLocaleDateString()}\nWitness: [WITNESS NAME]\nDeposition Date: [DATE]\n\nPRE-DEPOSITION DOCUMENTS\n□ Notice of Deposition served\n□ Subpoena issued (if necessary)\n□ Document production requests served\n□ Witness preparation completed\n□ Question outline finalized\n\nDOCUMENTS TO BRING\n□ Case file summary\n□ Chronology of events\n□ Key documents for authentication\n□ Prior witness statements\n□ Deposition question outline\n□ Legal pad for notes\n□ Business cards\n\nTECHNICAL REQUIREMENTS\n□ Court reporter arranged\n□ Video recording equipment (if needed)\n□ Conference room reserved\n□ Technology tested (video conference, etc.)\n□ Backup recording method available\n\nWITNESS MATERIALS\n□ Witness has reviewed key documents\n□ Witness understands oath requirements\n□ Witness knows deposition procedures\n□ Contact information exchanged\n\nPOST-DEPOSITION TASKS\n□ Transcript review and corrections\n□ Follow-up document requests\n□ Witness availability for trial\n□ Summary memo preparation\n□ Discovery plan updates\n\nEMERGENCY CONTACTS\n□ Court reporter backup\n□ IT support contact\n□ Opposing counsel contact\n□ Client notification plan\n\nNOTES SECTION:\n_________________________\n_________________________\n_________________________`,
        documentType: 'deposition_checklist'
      },
      'court': {
        title: 'Court Preparation Brief',
        content: `COURT PREPARATION BRIEF\n\nDate: ${new Date().toLocaleDateString()}\nHearing Type: [HEARING TYPE]\nJudge: Hon. Michael Thompson\nCourtroom: 3A\n\nI. CASE OVERVIEW\n   Case: [CASE TITLE]\n   Hearing Date: [DATE]\n   Estimated Duration: [DURATION]\n   Opposing Counsel: [COUNSEL NAME]\n\nII. LEGAL ARGUMENTS\n   A. Primary Arguments\n      1. [ARGUMENT 1]\n      2. [ARGUMENT 2]\n      3. [ARGUMENT 3]\n   \n   B. Supporting Case Law\n      - [CASE CITATION 1]\n      - [CASE CITATION 2]\n      - [CASE CITATION 3]\n\nIII. EVIDENCE PRESENTATION\n   Exhibit A: Contract Agreement\n   Exhibit B: Correspondence\n   Exhibit C: Expert Report\n   Exhibit D: Damage Calculations\n\nIV. ANTICIPATED CHALLENGES\n   • Opposing counsel objections\n   • Evidentiary issues\n   • Procedural challenges\n   • Client examination\n\nV. COURT PROCEDURES\n   • Local court rules compliance\n   • Filing deadlines\n   • Technology requirements\n   • Dress code and protocol\n\nVI. PREPARATION CHECKLIST\n   □ Review all exhibits\n   □ Prepare opening statement\n   □ Practice direct examination\n   □ Prepare for cross-examination\n   □ Draft closing argument\n   □ Coordinate with client\n   □ Confirm logistics\n\nPrepared by: Sarah Johnson, Esq.`,
        documentType: 'court_brief'
      },
      'evidence': {
        title: 'Evidence List and Exhibits',
        content: `EVIDENCE LIST AND EXHIBITS\n\nGenerated: ${new Date().toLocaleDateString()}\nHearing: [HEARING TYPE]\nCase: [CASE TITLE]\n\nEXHIBIT SUMMARY:\nTotal Exhibits: 8\nDocuments: 6\nPhotographic: 2\nExpert Reports: 1\n\nEXHIBIT LIST:\n\nEXHIBIT A - CONTRACT DOCUMENTS\n• Original construction contract\n• Addendums and modifications\n• Payment schedules\n• Specifications\nRelevance: Establishes contractual obligations\nAuthentication: Client testimony\n\nEXHIBIT B - CORRESPONDENCE\n• Email communications (15 pages)\n• Letters and notices\n• Text message records\nRelevance: Shows breach notification and damages\nAuthentication: Business records exception\n\nEXHIBIT C - PROJECT DOCUMENTATION\n• Progress photos\n• Inspection reports\n• Change order requests\nRelevance: Demonstrates delay and incomplete work\nAuthentication: Witness testimony\n\nEXHIBIT D - FINANCIAL RECORDS\n• Invoices and payment records\n• Bank statements\n• Cost documentation\nRelevance: Proves damages and mitigation efforts\nAuthentication: Business records\n\nEXHIBIT E - EXPERT REPORT\n• Construction industry expert analysis\n• Timeline reconstruction\n• Damage assessment\nRelevance: Professional opinion on industry standards\nAuthentication: Expert qualification\n\nPRESENTATION ORDER:\n1. Contract establishment (Exhibit A)\n2. Performance timeline (Exhibit C)\n3. Communication trail (Exhibit B)\n4. Financial impact (Exhibit D)\n5. Expert analysis (Exhibit E)\n\nEVIDENTIARY ISSUES:\n• Hearsay objections - prepared responses\n• Authentication requirements - witness list ready\n• Relevance challenges - legal basis established\n• Best evidence rule - originals available\n\nTECHNOLOGY NEEDS:\n□ Document display system\n□ Laptop and projector\n□ Extension cords\n□ Backup copies (digital and paper)\n□ Exhibit stickers and binders`,
        documentType: 'evidence_list'
      },
      'argument': {
        title: 'Argument Outline and Talking Points',
        content: `ARGUMENT OUTLINE AND TALKING POINTS\n\nDate: ${new Date().toLocaleDateString()}\nHearing: [HEARING TYPE]\nEstimated Speaking Time: 15-20 minutes\n\nI. OPENING STATEMENT (3-5 minutes)\n   A. Case Introduction\n      • "This is a straightforward breach of contract case"\n      • Parties and basic facts\n      • What we're asking the court to do\n   \n   B. Roadmap\n      • Three key points we will prove\n      • Evidence that supports our position\n      • Why plaintiff should prevail\n\nII. MAIN ARGUMENTS (10-12 minutes)\n   \n   A. BREACH OF CONTRACT (Primary Argument)\n      Talking Points:\n      • Clear contractual deadline of February 15, 2024\n      • Undisputed completion date of March 15, 2024\n      • 30-day delay constitutes material breach\n      • No force majeure or excusable delay\n      \n      Supporting Evidence:\n      • Exhibit A: Original contract with timeline\n      • Exhibit C: Progress documentation\n      • Testimony regarding completion status\n   \n   B. DAMAGES ARE PROVEN AND CALCULABLE\n      Talking Points:\n      • Liquidated damages clause is enforceable\n      • $1,667 per day for 30 days = $50,010\n      • Additional costs and expenses documented\n      • Mitigation efforts were reasonable\n      \n      Supporting Evidence:\n      • Exhibit A: Liquidated damages provision\n      • Exhibit D: Financial documentation\n      • Expert testimony on industry standards\n   \n   C. DEFENDANT'S DEFENSES LACK MERIT\n      Talking Points:\n      • No showing of impossibility\n      • Weather delays were foreseeable\n      • No timely notice of claimed delays\n      • Client did not cause or contribute to delay\n      \n      Counter-Evidence:\n      • Exhibit B: Lack of timely notice\n      • Weather records show normal conditions\n      • No change orders requested\n\nIII. ANTICIPATED OBJECTIONS AND RESPONSES\n   \n   Objection: "Liquidated damages are punitive"\n   Response: "Clause represents reasonable estimate of harm,\n   supported by expert testimony on industry standards"\n   \n   Objection: "Client caused delays through changes"\n   Response: "No evidence of client-requested changes,\n   all specifications were clear from contract signing"\n   \n   Objection: "Force majeure due to weather"\n   Response: "Normal winter weather is foreseeable,\n   contract includes no force majeure provision"\n\nIV. CLOSING ARGUMENT (2-3 minutes)\n   A. Summary of Key Points\n      • Clear breach established\n      • Damages are proven and reasonable\n      • Justice requires enforcement of contract terms\n   \n   B. Call to Action\n      • "We respectfully request the court grant\n        plaintiff's motion for summary judgment"\n      • "Defendant should be held accountable for\n        their contractual obligations"\n\nV. Q&A PREPARATION\n   \n   Likely Court Questions:\n   Q: "How do you respond to defendant's claim of weather delays?"\n   A: "Weather was within normal seasonal parameters,\n   contractor assumed risk of winter conditions"\n   \n   Q: "Are liquidated damages appropriate here?"\n   A: "Yes, Your Honor. The clause represents a reasonable\n   pre-estimate of harm, not a penalty"\n   \n   Q: "What efforts did plaintiff make to mitigate damages?"\n   A: "Plaintiff immediately sought alternative contractors\n   and minimized additional costs where possible"\n\nVI. BACKUP MATERIALS\n   • Case law citations ready\n   • Calculator for damage calculations\n   • Timeline chart for visual aid\n   • Contract provisions highlighted\n\nNOTES:\n• Maintain professional demeanor\n• Listen carefully to court questions\n• Refer to exhibits by letter designation\n• Keep responses concise and direct`,
        documentType: 'argument_outline'
      },
      'qa': {
        title: 'Q&A Preparation Document',
        content: `COURT Q&A PREPARATION\n\nGenerated: ${new Date().toLocaleDateString()}\nHearing Type: [HEARING TYPE]\nJudge: Hon. Michael Thompson\n\nI. PROCEDURAL QUESTIONS\n\nQ: "Counsel, have you complied with all pre-trial requirements?"\nA: "Yes, Your Honor. All pleadings filed timely, discovery complete, and pre-trial conference conducted."\n\nQ: "Are there any pending motions or preliminary matters?"\nA: "No outstanding motions, Your Honor. Ready to proceed on the merits."\n\nQ: "How much time will you need for your presentation?"\nA: "Approximately 20 minutes for opening, examination, and closing, Your Honor."\n\nII. SUBSTANTIVE LEGAL QUESTIONS\n\nQ: "What is the legal standard for liquidated damages?"\nA: "Liquidated damages are enforceable when they represent a reasonable estimate of anticipated harm and actual damages are difficult to calculate. Here, the $1,667 daily rate reflects lost use value."\n\nQ: "How do you establish material breach?"\nA: "Material breach occurs when the failure to perform substantially defeats the purpose of the contract. A 30-day delay on a time-sensitive construction project constitutes material breach."\n\nQ: "What about the defendant's force majeure claim?"\nA: "The contract contains no force majeure provision, and normal winter weather is foreseeable. Defendant assumed the risk of seasonal conditions."\n\nIII. FACTUAL QUESTIONS\n\nQ: "When exactly was the project supposed to be completed?"\nA: "February 15, 2024, as clearly stated in Section 3.1 of the contract, Exhibit A."\n\nQ: "What was the actual completion date?"\nA: "The project remains incomplete as of today, March 15, 2024, exactly 30 days past the deadline."\n\nQ: "Did the client make any changes that could have caused delays?"\nA: "No, Your Honor. The record shows no change orders, modifications, or client-requested alterations to the original specifications."\n\nIV. DAMAGE CALCULATION QUESTIONS\n\nQ: "How did you arrive at the $50,010 damage figure?"\nA: "Liquidated damages of $1,667 per day for 30 days, plus documented additional costs of approximately $1,000, Your Honor."\n\nQ: "Are these damages reasonable?"\nA: "Yes, they represent the actual daily carrying costs and lost use of the property, supported by expert testimony."\n\nQ: "What efforts were made to mitigate damages?"\nA: "Plaintiff immediately notified defendant of the breach and sought alternative contractors to minimize additional costs."\n\nV. EVIDENCE AND PROCEDURE QUESTIONS\n\nQ: "How will you authenticate these documents?"\nA: "Through client testimony for the contract, business records exception for financial documents, and expert testimony for the industry analysis."\n\nQ: "Any hearsay issues with the email communications?"\nA: "No, Your Honor. These are party admissions and business communications, falling under established exceptions."\n\nQ: "Do you need to call any witnesses?"\nA: "Yes, our client for contract authentication and our construction expert for industry standards testimony."\n\nVI. SETTLEMENT AND RESOLUTION QUESTIONS\n\nQ: "Have there been any settlement discussions?"\nA: "Yes, Your Honor, but defendant has refused to acknowledge liability or pay reasonable compensation."\n\nQ: "What are you seeking from the court today?"\nA: "Summary judgment in plaintiff's favor for $50,010 in liquidated damages plus reasonable attorney fees as provided in the contract."\n\nQ: "Are attorney fees recoverable under the contract?"\nA: "Yes, Section 12.4 provides for attorney fees to the prevailing party in any litigation."\n\nVII. DIFFICULT QUESTIONS - PREPARATION\n\nQ: "Isn't this just a penalty clause disguised as liquidated damages?"\nA: "No, Your Honor. The daily rate was calculated based on actual projected costs and lost use value. Expert testimony shows this is consistent with industry standards for delay damages."\n\nQ: "Why didn't plaintiff accept defendant's offer to complete the work?"\nA: "By March 1st, plaintiff had lost confidence in defendant's ability to perform timely, and the delay had already caused substantial harm to plaintiff's business operations."\n\nQ: "Could weather conditions excuse the delay?"\nA: "Normal seasonal weather is foreseeable and within industry expectations. Defendant made no showing of extraordinary conditions that would excuse performance."\n\nVIII. CLOSING PREPARATION\n\nKey Points to Emphasize:\n• Clear contractual breach\n• Reasonable and enforceable damages\n• No valid defenses presented\n• Justice requires contract enforcement\n\nPhrase to Avoid:\n• "Obvious" or "clearly"\n• Argumentative language\n• Personal attacks on opposing counsel\n• Emotional appeals\n\nRemember:\n• Stay calm and professional\n• Answer only what is asked\n• Refer to record evidence\n• Thank the court for its time`,
        documentType: 'qa_preparation'
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
    if (lowerType.includes('deposition') && lowerType.includes('outline')) matchedKey = 'deposition';
    if (lowerType.includes('question') && lowerType.includes('bank')) matchedKey = 'question';
    if (lowerType.includes('witness') && lowerType.includes('strategy')) matchedKey = 'witness';
    if (lowerType.includes('document') && lowerType.includes('checklist')) matchedKey = 'checklist';
    if (lowerType.includes('deposition') && !matchedKey) matchedKey = 'deposition';
    if (lowerType.includes('witness') && !matchedKey) matchedKey = 'witness';
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

  async generateCourtPreparation(request: {
    caseType: string;
    hearingType: string;
    keyArguments: string[];
    evidence: string[];
    timeline: string[];
    caseContext: string;
  }): Promise<any> {
    try {
      const prompt = `Generate a comprehensive court preparation analysis for the following case:

      Case Type: ${request.caseType}
      Hearing Type: ${request.hearingType}
      Case Context: ${request.caseContext}
      Key Arguments: ${JSON.stringify(request.keyArguments)}
      Evidence: ${JSON.stringify(request.evidence)}
      Timeline: ${JSON.stringify(request.timeline)}

      Please provide a detailed court preparation analysis including:
      1. Hearing strategy and key arguments
      2. Evidence presentation plan
      3. Timeline and procedural considerations
      4. Potential challenges and responses
      5. Recommended next steps

      Format your response as a JSON object with structured recommendations.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are a court preparation specialist. Provide detailed strategic analysis for court hearings and legal proceedings." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 2000,
      });

      return JSON.parse(response.choices[0].message.content || "{}");
    } catch (error) {
      console.error("Court preparation generation error:", error);
      throw new Error("Failed to generate court preparation");
    }
  }

  async generateDepositionAnalysis(request: {
    caseContext: string;
    caseType: string;
    witnessName: string;
    depositionType: string;
    keyTopics: string;
    witnessRole: string;
    objectives?: string;
    problemAreas?: string;
    availableEvidence: string[];
    caseHistory: string;
    timelineEvents: string[];
  }): Promise<any> {
    try {
      const prompt = `Generate a comprehensive deposition analysis for the following case:

      Case Type: ${request.caseType}
      Case Context: ${request.caseContext}
      Witness Name: ${request.witnessName}
      Deposition Type: ${request.depositionType}
      Witness Role: ${request.witnessRole}
      Key Topics: ${request.keyTopics}
      Objectives: ${request.objectives || 'Not specified'}
      Problem Areas: ${request.problemAreas || 'Not specified'}
      Available Evidence: ${JSON.stringify(request.availableEvidence)}
      Case History: ${request.caseHistory}
      Timeline Events: ${JSON.stringify(request.timelineEvents)}

      Please provide a detailed deposition analysis including:
      1. Witness assessment and credibility factors
      2. Deposition preparation score and strategy
      3. Key preparation strategies and timeline
      4. Suggested documents and evidence
      5. Risk factors and mitigation strategies
      6. Estimated duration and logistics

      Format your response as a JSON object with structured analysis.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are a deposition preparation specialist. Provide detailed strategic analysis for witness depositions and examination strategies." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.4,
        max_tokens: 2000,
      });

      return JSON.parse(response.choices[0].message.content || "{}");
    } catch (error) {
      console.error("Deposition analysis generation error:", error);
      throw new Error("Failed to generate deposition analysis");
    }
  }

  async generateCaseAnalytics(request: {
    caseContext: string;
    caseType: string;
    priority: string;
    status: string;
    daysActive: number;
    documents: Array<{
      title: string;
      type: string;
      status: string;
      createdAt: Date;
    }>;
    messages: Array<{
      role: string;
      content: string;
      timestamp: Date;
    }>;
    timeline: Array<{
      type: string;
      title: string;
      description: string;
      dueDate?: Date;
      completed: boolean;
    }>;
    clientName: string;
    opposingParty?: string;
  }): Promise<any> {
    try {
      const prompt = `Generate comprehensive case analytics for the following legal case:

      Case Type: ${request.caseType}
      Case Context: ${request.caseContext}
      Priority: ${request.priority}
      Status: ${request.status}
      Days Active: ${request.daysActive}
      Client: ${request.clientName}
      Opposing Party: ${request.opposingParty || 'Not specified'}
      
      Documents: ${JSON.stringify(request.documents)}
      Messages: ${JSON.stringify(request.messages.slice(-10))}
      Timeline: ${JSON.stringify(request.timeline)}

      Please provide detailed case analytics including:
      1. Basic metrics (days active, completion rate, critical tasks)
      2. Financial analysis (estimated costs, potential recovery, ROI)
      3. Timeline analysis (phases, next deadlines, estimated completion)
      4. Task breakdown (documents filed, discovery, witnesses, experts)
      5. Risk assessment (settlement, evidence, precedent, communication)
      6. Performance metrics (documents generated, interactions, adherence)

      Format your response as a JSON object with structured analytics.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are a legal case analytics specialist. Provide comprehensive data-driven analysis of legal case progress and metrics." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 2500,
      });

      return JSON.parse(response.choices[0].message.content || "{}");
    } catch (error) {
      console.error("Case analytics generation error:", error);
      throw new Error("Failed to generate case analytics");
    }
  }
}

export const openaiService = new OpenAIService();