# Legal Assistant Application

## Overview

This is a comprehensive full-stack legal AI assistant that mimics ChatGPT behavior with a dynamic side canvas for document generation. Built with React and Express.js, the application provides AI-powered legal case management featuring a proactive attorney mindset, consolidated case actions, and responsive layout adjustments. The system thinks and acts like a senior attorney with 20+ years of experience, providing strategic legal analysis and recommendations.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with Vite for build tooling
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing
- **UI Components**: Comprehensive shadcn/ui component system with Radix UI primitives

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **API Integration**: OpenAI GPT-4o for AI-powered legal assistance
- **Session Management**: express-session with PostgreSQL session store
- **Development**: Hot reload with Vite middleware integration

### Database Architecture
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Connection**: Neon Database serverless connection
- **Schema**: Structured legal case management schema

## Key Components

### Core Entities
1. **Users**: Attorney profiles with authentication
2. **Cases**: Legal case management with client information
3. **Chat Messages**: AI conversation history per case
4. **Documents**: Generated legal documents with version control
5. **Timeline Events**: Case milestone tracking

### Frontend Components
1. **CaseSidebar**: Case navigation and user interface with modal-based actions
2. **ChatInterface**: AI chat with ChatGPT-like behavior and proactive messaging
3. **DocumentCanvas**: Responsive document editor with dynamic resizing, court-compatible fonts, and dual download options
4. **FunctionModal**: Modal dialogs with descriptions for specific legal functions
5. **MessageList**: Chat message display with structured analysis and proactive case insights
6. **ChatInput**: Consolidated Case Actions dropdown with all legal functions
7. **ResizablePanelGroup**: Dynamic layout adjustment for chat and document canvas with auto-expansion
8. **NewCaseModal**: Comprehensive case creation with client information and case details
9. **SearchCasesModal**: Live search functionality with case previews and filtering
10. **SettingsModal**: User preferences for notifications, appearance, privacy, and legal features

### Backend Services
1. **OpenAI Service**: Proactive AI attorney with senior-level legal reasoning and strategic thinking
2. **Storage Service**: Data persistence abstraction with in-memory implementation
3. **Route Handlers**: RESTful API endpoints for case management

## Data Flow

### Chat Flow
1. User sends message through ChatInput
2. Message stored in database via API
3. OpenAI service processes message with case context
4. AI response stored and displayed
5. Function calls can trigger document generation

### Document Flow
1. AI generates document based on case context
2. Document stored in database with draft status
3. Document rendered in DocumentCanvas
4. User can edit and save changes
5. Document status updated to reflect changes

### Case Management Flow
1. Cases loaded from database on sidebar mount
2. Case selection triggers chat and document loading
3. Timeline events track case progress
4. All changes persist to database

## External Dependencies

### Production Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: UI component primitives
- **drizzle-orm**: Database ORM
- **openai**: AI service integration
- **express**: Web server framework
- **react**: Frontend framework
- **tailwindcss**: CSS framework

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Type checking
- **tsx**: TypeScript execution
- **esbuild**: Production bundling

## Deployment Strategy

### Build Process
1. **Development**: `npm run dev` - Runs Express server with Vite middleware
2. **Production Build**: `npm run build` - Builds client and server bundles
3. **Production Start**: `npm start` - Runs bundled server

### Environment Configuration
- **Database**: `DATABASE_URL` for PostgreSQL connection
- **AI Service**: `OPENAI_API_KEY` for OpenAI integration
- **Node Environment**: `NODE_ENV` for environment-specific behavior

### Database Management
- **Schema**: Defined in `shared/schema.ts` with Drizzle
- **Migrations**: Generated in `./migrations` directory
- **Push Schema**: `npm run db:push` for development schema updates

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

Changelog:
- July 08, 2025. Initial setup
- July 09, 2025. Enhanced PDF formatting with court-compatible fonts (Century Schoolbook, Times New Roman, Garamond, etc.)
- July 09, 2025. Implemented dynamic document canvas auto-expansion based on document generation state
- July 09, 2025. Added dual download options: PDF and editable text formats via dropdown menu
- July 09, 2025. Moved profile implementation to Sarah Johnson location in sidebar with clickable navigation
- July 09, 2025. Improved PDF generation with professional 1-inch margins and multi-page support
- July 09, 2025. Added font selector for court-compatible typography in document canvas