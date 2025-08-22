# Legal Assistant AI Platform

A comprehensive full-stack legal AI assistant that mimics ChatGPT behavior with a dynamic side canvas for document generation. Built with React and Express.js, the application provides AI-powered legal case management featuring a proactive attorney mindset, consolidated case actions, and responsive layout adjustments.

## 🚀 Features

- **AI-Powered Legal Assistant**: GPT-4o integration for intelligent legal analysis
- **Document Generation**: AI-powered drafting for motions, briefs, contracts, and pleadings
- **Case Management**: Comprehensive case tracking and organization
- **Admin Panel**: Complete content management system with real-time configuration
- **Token Billing System**: Professional subscription and billing management
- **Learning Center**: Dynamic content management for legal resources
- **Brand Management**: Customizable branding, colors, and typography
- **Professional UI**: Modern design with shadcn/ui components

## 🛠 Tech Stack

### Frontend
- **React 18** with Vite
- **TypeScript** for type safety
- **Tailwind CSS** with shadcn/ui components
- **TanStack Query** for state management
- **Wouter** for client-side routing

### Backend
- **Express.js** with TypeScript
- **PostgreSQL** with Drizzle ORM
- **OpenAI GPT-4o** API integration
- **JWT Authentication** with bcrypt
- **Session Management** with express-session

### Database & Infrastructure
- **Neon Database** (serverless PostgreSQL)
- **Redis** caching with memory store fallback
- **Structured logging** with Winston
- **Error tracking** with Sentry integration

## 📦 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd legal-assistant-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Configure the following in `.env`:
   ```
   DATABASE_URL=your_postgresql_connection_string - Setup it from Neon DB Dashboard
   OPENAI_API_KEY=your_openai_api_key - Setup it from OpenAI Dashboard
   JWT_SECRET=your_jwt_secret
   SESSION_SECRET=your_session_secret
   ```

4. **Set up the database migrate**
   ```bash
   npm run db:migrate
   ``

5. **Set up the database**
   ```bash
   npm run db:push
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5000`

## 🏗 Build for Production

```bash
npm run build
```

This creates:
- `/dist/public/` - Frontend assets (HTML, CSS, JS)
- `/dist/index.js` - Compiled backend server

## 📁 Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   └── lib/           # Utilities and config
├── server/                # Express backend
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   └── utils/            # Server utilities
├── shared/               # Shared types and schemas
└── dist/                 # Production build output
```

## 🔧 Key Features

### Admin Panel
- **AI Provider Management**: Configure OpenAI and other AI services
- **Pricing Configuration**: Token-based billing system
- **Learning Center**: Dynamic content management
- **Brand Management**: Logo, colors, and typography customization
- **User Management**: Comprehensive user analytics and control

### Legal AI Assistant
- **Case Analysis**: AI-powered legal case evaluation
- **Document Generation**: Automated creation of legal documents
- **Contract Analysis**: Intelligent contract review and insights
- **Chat Interface**: Natural language legal assistance

### Security & Compliance
- **JWT Authentication**: Secure user sessions
- **Data Encryption**: AES-256-GCM for sensitive data
- **GDPR/CCPA Compliance**: Privacy controls and data protection
- **Rate Limiting**: API protection and abuse prevention

## 🚀 Deployment

### Replit Deployment
1. Push your code to GitHub
2. Import into Replit
3. Configure environment variables
4. Deploy using Replit's one-click deployment

### Traditional Hosting
1. Build the project: `npm run build`
2. Deploy the `/dist` folder to your hosting provider
3. Ensure environment variables are configured
4. Start the server: `node dist/index.js`

## 📄 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `OPENAI_API_KEY` | OpenAI API key for AI features | Yes |
| `JWT_SECRET` | Secret for JWT token signing | Yes |
| `SESSION_SECRET` | Secret for session encryption | Yes |
| `SENTRY_DSN` | Sentry error tracking (optional) | No |
| `REDIS_URL` | Redis connection string (optional) | No |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Contact: contact@wizzered.com
- Documentation: [Project Wiki](../../wiki)

---

**Wizzered - AI-Powered Legal Technology**  
Transforming legal practice with intelligent AI solutions for attorneys and pro se litigants.