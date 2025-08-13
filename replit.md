# Legal Assistant Application

## Overview
This is a comprehensive full-stack legal AI assistant that mimics ChatGPT behavior with a dynamic side canvas for document generation. Built with React and Express.js, the application provides AI-powered legal case management featuring a proactive attorney mindset, consolidated case actions, and responsive layout adjustments. The system thinks and acts like a senior attorney with 20+ years of experience, providing strategic legal analysis and recommendations. It aims to provide a world-class, enterprise-ready platform for legal technology, incorporating advanced AI, robust security, and comprehensive compliance.

## Recent Updates (August 13, 2025)
- **AI Integration**: Successfully implemented OpenAI GPT-4o integration for real AI-powered responses
- **API Management**: Fixed AI providers models endpoint to return latest models from OpenAI, Anthropic, Google, Cohere, Mistral, and Perplexity
- **UI Enhancements**: Transformed login and signup pages with world-class design featuring modern animations, gradients, and professional split-screen layouts
- **Real AI Services**: Created comprehensive OpenAI service module with contract analysis, document generation, case insights, and chat functionality
- **Live Chat**: Connected live chat widget to real OpenAI API for authentic AI-powered support responses

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture
### Frontend Architecture
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS with shadcn/ui and Radix UI
- **State Management**: TanStack Query
- **Routing**: Wouter
- **UI/UX Decisions**: Dynamic layout adjustment with auto-expansion, court-compatible fonts (Century Schoolbook, Times New Roman, Garamond), 1-inch margins, multi-page support for documents, and a comprehensive shadcn/ui component system.
- **Key Frontend Components**: CaseSidebar, ChatInterface (ChatGPT-like behavior), DocumentCanvas (responsive editor, dual download options), FunctionModal, MessageList (structured analysis), ChatInput (Consolidated Case Actions), ResizablePanelGroup, NewCaseModal, SearchCasesModal, SettingsModal.

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM (using Neon Database serverless connection)
- **API Integration**: OpenAI GPT-4o
- **Session Management**: express-session with PostgreSQL session store, Redis caching with memory store fallback
- **Security**: JWT-based authentication, bcrypt hashing, AES-256-GCM encryption, HTTPS enforcement, CSP headers, rate limiting, PII protection, audit logging.
- **Compliance**: GDPR/CCPA compliance system, EU Cookie Directive compliance (CookieBanner, PrivacyManager, Cookie Policy page).
- **Monitoring & Logging**: Structured logging with Winston, Sentry error tracking, performance monitoring (metrics, APM), health check endpoints, real-time system status monitoring.

### Core System Design
- **AI Core**: Proactive AI attorney with senior-level legal reasoning, strategic thinking, and specialized AI assistant prompts (e.g., Senior Legal AI Attorney System, Document Generation, Case Actions, Contract Analysis, Next Best Action, Document Canvas, Live Chat Support).
- **Data Flow**: Comprehensive flow for chat, document generation, and case management, ensuring persistence and real-time updates.
- **Document Generation**: AI-powered drafting for motions, briefs, requests, pleadings, contracts, and discovery documents with proactive suggestions and integration of chat history, uploaded documents, case timeline, and client details.
- **Admin System**: Admin Global Prompt Management, Disclaimer Management, comprehensive admin panels for configuration, user management, system health, and logs, all fully database-driven.
- **Modularity**: Modular service architecture for auth, payments, email, and file handling.
- **Branding**: Rebranding to "Wizzered - AI-Powered Legal Technology".

## External Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: UI component primitives
- **drizzle-orm**: Database ORM
- **openai**: AI service integration
- **express**: Web server framework
- **react**: Frontend framework
- **tailwindcss**: CSS framework
- **wouter**: Client-side routing
- **Redis**: Caching and session store
- **Sentry**: Error tracking
- **Stripe**: Payment processing and subscription management
- **Resend**: Transactional email service