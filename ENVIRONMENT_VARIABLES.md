# Environment Variables Configuration

## Required Environment Variables

### Core Application
- **NODE_ENV** (optional, default: development)
  - Values: `development`, `production`, `test`
  - Controls logging level and security settings

### Database
- **DATABASE_URL** (required)
  - PostgreSQL connection string
  - Example: `postgresql://user:password@localhost:5432/database`

### Authentication & Security
- **JWT_SECRET** (required)
  - Secret key for JWT token signing
  - Generate with: `openssl rand -hex 32`
  - Example: `your-super-secret-jwt-key-here`

- **ENCRYPTION_KEY** (optional, auto-generated)
  - 64-character hex string for data encryption
  - Generate with: `openssl rand -hex 32`
  - Example: `abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890`

- **SESSION_SECRET** (optional, uses JWT_SECRET fallback)
  - Secret for session encryption
  - Generate with: `openssl rand -hex 32`

### Email Service (Brevo)
- **BREVO_API_KEY** (required for email features)
  - Your Brevo API key
  - Get from: https://app.brevo.com/settings/keys/api
  - Example: `xkeysib-your-api-key-here`

### Payment Processing (Stripe)
- **STRIPE_SECRET_KEY** (required for payments)
  - Your Stripe secret key (starts with sk_)
  - Get from: https://dashboard.stripe.com/apikeys
  - Example: `sk_test_your_stripe_secret_key`

- **VITE_STRIPE_PUBLIC_KEY** (required for frontend payments)
  - Your Stripe publishable key (starts with pk_)
  - Get from: https://dashboard.stripe.com/apikeys
  - Example: `pk_test_your_stripe_public_key`

- **STRIPE_PRICE_ID** (optional, for subscriptions)
  - Price ID for subscription plans
  - Get from: https://dashboard.stripe.com/products
  - Example: `price_1234567890abcdef`

### AI Services (OpenAI)
- **OPENAI_API_KEY** (required for AI features)
  - Your OpenAI API key
  - Get from: https://platform.openai.com/api-keys
  - Example: `sk-your-openai-api-key`

### Monitoring & Performance (Optional)
- **SENTRY_DSN** (optional, for error tracking)
  - Sentry project DSN
  - Get from: https://sentry.io/settings/projects/
  - Example: `https://your-sentry-dsn@sentry.io/project-id`

- **REDIS_URL** (optional, for caching)
  - Redis connection string
  - Example: `redis://localhost:6379`

### Development Only
- **PORT** (optional, default: 5000)
  - Port for the server to run on
  - Example: `5000`

## Quick Setup Commands

### Generate JWT Secret
```bash
openssl rand -hex 32
```

### Generate Encryption Key
```bash
openssl rand -hex 32
```

### Example .env file
```env
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/legalai
JWT_SECRET=your-generated-jwt-secret-here
ENCRYPTION_KEY=your-generated-encryption-key-here
BREVO_API_KEY=xkeysib-your-brevo-api-key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key
OPENAI_API_KEY=sk-your-openai-api-key
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

## Environment Variable Priorities

### Critical (App won't start without these):
1. DATABASE_URL
2. JWT_SECRET

### Important (Features won't work without these):
1. BREVO_API_KEY (for email)
2. STRIPE_SECRET_KEY + VITE_STRIPE_PUBLIC_KEY (for payments)
3. OPENAI_API_KEY (for AI features)

### Optional (Enhances functionality):
1. SENTRY_DSN (error tracking)
2. REDIS_URL (caching)
3. ENCRYPTION_KEY (auto-generated if missing)
4. SESSION_SECRET (uses JWT_SECRET if missing)