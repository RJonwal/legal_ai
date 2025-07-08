# Legal Assistant Application

## Overview

This is a full-stack legal assistant application built with React and Express.js. The application provides AI-powered legal case management features including document analysis, chat interface, case timeline management, and document generation. It uses a modern tech stack with TypeScript, Tailwind CSS, and shadcn/ui components.

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
1. **CaseSidebar**: Case navigation and user interface
2. **ChatInterface**: AI chat with function buttons
3. **DocumentCanvas**: Document editor with real-time editing
4. **FunctionModal**: Modal dialogs for specific legal functions
5. **MessageList**: Chat message display with structured analysis

### Backend Services
1. **OpenAI Service**: AI-powered legal analysis and document generation
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