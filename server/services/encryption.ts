import crypto from 'crypto';

// Configuration for encryption
const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const TAG_LENGTH = 16; // 128 bits

interface EncryptionResult {
  encryptedData: string;
  iv: string;
  tag: string;
}

interface DecryptionInput {
  encryptedData: string;
  iv: string;
  tag: string;
}

export class EncryptionService {
  private static instance: EncryptionService;
  private encryptionKey: Buffer;

  private constructor() {
    // Generate or load encryption key from environment
    const keyString = process.env.ENCRYPTION_KEY;
    if (keyString) {
      this.encryptionKey = Buffer.from(keyString, 'hex');
    } else {
      // Generate a new key (in production, this should be stored securely)
      this.encryptionKey = crypto.randomBytes(KEY_LENGTH);
      console.warn('No ENCRYPTION_KEY environment variable found. Using generated key.');
      console.warn('Generated key (store securely):', this.encryptionKey.toString('hex'));
    }
  }

  static getInstance(): EncryptionService {
    if (!EncryptionService.instance) {
      EncryptionService.instance = new EncryptionService();
    }
    return EncryptionService.instance;
  }

  /**
   * Encrypt data at rest
   */
  encrypt(data: string): EncryptionResult {
    try {
      const iv = crypto.randomBytes(IV_LENGTH);
      const cipher = crypto.createCipher(ENCRYPTION_ALGORITHM, this.encryptionKey);
      cipher.setAAD(Buffer.from('LegalAI-Pro')); // Additional authenticated data
      
      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const tag = cipher.getAuthTag();
      
      return {
        encryptedData: encrypted,
        iv: iv.toString('hex'),
        tag: tag.toString('hex')
      };
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt data at rest
   */
  decrypt(input: DecryptionInput): string {
    try {
      const iv = Buffer.from(input.iv, 'hex');
      const tag = Buffer.from(input.tag, 'hex');
      
      const decipher = crypto.createDecipher(ENCRYPTION_ALGORITHM, this.encryptionKey);
      decipher.setAAD(Buffer.from('LegalAI-Pro')); // Same AAD as encryption
      decipher.setAuthTag(tag);
      
      let decrypted = decipher.update(input.encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Hash sensitive data (one-way)
   */
  hash(data: string, salt?: string): { hash: string; salt: string } {
    const actualSalt = salt || crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(data, actualSalt, 100000, 64, 'sha512').toString('hex');
    return { hash, salt: actualSalt };
  }

  /**
   * Verify hashed data
   */
  verifyHash(data: string, hash: string, salt: string): boolean {
    const { hash: computedHash } = this.hash(data, salt);
    return computedHash === hash;
  }

  /**
   * Generate secure random token
   */
  generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Encrypt personally identifiable information (PII)
   */
  encryptPII(data: any): string {
    const jsonData = JSON.stringify(data);
    const encrypted = this.encrypt(jsonData);
    return JSON.stringify(encrypted);
  }

  /**
   * Decrypt personally identifiable information (PII)
   */
  decryptPII(encryptedData: string): any {
    try {
      const encryptionResult = JSON.parse(encryptedData);
      const decryptedJson = this.decrypt(encryptionResult);
      return JSON.parse(decryptedJson);
    } catch (error) {
      console.error('PII decryption error:', error);
      throw new Error('Failed to decrypt PII data');
    }
  }

  /**
   * Create encrypted session token
   */
  createSessionToken(userId: string, expiresAt: Date): string {
    const sessionData = {
      userId,
      expiresAt: expiresAt.toISOString(),
      createdAt: new Date().toISOString(),
      nonce: this.generateSecureToken(16)
    };
    
    return this.encryptPII(sessionData);
  }

  /**
   * Verify and decrypt session token
   */
  verifySessionToken(token: string): { userId: string; expiresAt: Date } | null {
    try {
      const sessionData = this.decryptPII(token);
      const expiresAt = new Date(sessionData.expiresAt);
      
      if (expiresAt < new Date()) {
        return null; // Token expired
      }
      
      return {
        userId: sessionData.userId,
        expiresAt
      };
    } catch (error) {
      console.error('Session token verification error:', error);
      return null;
    }
  }

  /**
   * Generate CSRF token
   */
  generateCSRFToken(): string {
    return crypto.randomBytes(32).toString('base64');
  }

  /**
   * Verify CSRF token
   */
  verifyCSRFToken(token: string, sessionToken: string): boolean {
    // In a real implementation, you would store CSRF tokens associated with sessions
    // For now, we'll just verify the token format
    return token && token.length === 44; // Base64 encoded 32 bytes
  }
}

// Security middleware for Express
export const securityMiddleware = {
  // Add security headers
  addSecurityHeaders: (req: any, res: any, next: any) => {
    // HTTPS enforcement
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    
    // Content Security Policy
    res.setHeader('Content-Security-Policy', 
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "font-src 'self' https://fonts.gstatic.com; " +
      "img-src 'self' data: https:; " +
      "connect-src 'self' https://api.openai.com; " +
      "frame-ancestors 'none';"
    );
    
    // Other security headers
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    
    next();
  },

  // Rate limiting
  rateLimit: (() => {
    const requests = new Map<string, { count: number; resetTime: number }>();
    
    return (req: any, res: any, next: any) => {
      const clientIP = req.ip || req.connection.remoteAddress;
      const now = Date.now();
      const windowMs = 15 * 60 * 1000; // 15 minutes
      const maxRequests = 100;
      
      if (!requests.has(clientIP)) {
        requests.set(clientIP, { count: 1, resetTime: now + windowMs });
        return next();
      }
      
      const clientData = requests.get(clientIP)!;
      
      if (now > clientData.resetTime) {
        clientData.count = 1;
        clientData.resetTime = now + windowMs;
        return next();
      }
      
      if (clientData.count >= maxRequests) {
        return res.status(429).json({
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.'
        });
      }
      
      clientData.count++;
      next();
    };
  })(),

  // CSRF protection
  csrfProtection: (req: any, res: any, next: any) => {
    const encryptionService = EncryptionService.getInstance();
    
    if (req.method === 'GET') {
      return next();
    }
    
    const csrfToken = req.headers['x-csrf-token'] || req.body.csrfToken;
    const sessionToken = req.headers['authorization'] || req.session?.token;
    
    if (!csrfToken || !sessionToken) {
      return res.status(403).json({
        error: 'CSRF token required',
        message: 'Missing CSRF token'
      });
    }
    
    if (!encryptionService.verifyCSRFToken(csrfToken, sessionToken)) {
      return res.status(403).json({
        error: 'Invalid CSRF token',
        message: 'CSRF token verification failed'
      });
    }
    
    next();
  }
};

// Data anonymization utilities
export const dataAnonymization = {
  /**
   * Anonymize email addresses
   */
  anonymizeEmail: (email: string): string => {
    const [local, domain] = email.split('@');
    const anonymizedLocal = local.substring(0, 2) + '*'.repeat(local.length - 2);
    return `${anonymizedLocal}@${domain}`;
  },

  /**
   * Anonymize phone numbers
   */
  anonymizePhone: (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length >= 10) {
      return cleaned.substring(0, 3) + '*'.repeat(cleaned.length - 6) + cleaned.substring(cleaned.length - 3);
    }
    return '*'.repeat(cleaned.length);
  },

  /**
   * Anonymize names
   */
  anonymizeName: (name: string): string => {
    const parts = name.split(' ');
    return parts.map(part => part.charAt(0) + '*'.repeat(part.length - 1)).join(' ');
  },

  /**
   * Remove PII from text
   */
  removePII: (text: string): string => {
    // Remove email addresses
    text = text.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]');
    
    // Remove phone numbers
    text = text.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE]');
    
    // Remove SSNs
    text = text.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]');
    
    // Remove credit card numbers
    text = text.replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '[CARD]');
    
    return text;
  }
};

// Audit logging
export const auditLogger = {
  logDataAccess: (userId: string, dataType: string, action: string) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      userId,
      dataType,
      action,
      ip: 'system', // Would be populated from request
      userAgent: 'system' // Would be populated from request
    };
    
    // In production, this would go to a secure audit log
    console.log('AUDIT LOG:', JSON.stringify(logEntry));
  },

  logPrivacyRequest: (userId: string, requestType: string, status: string) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      userId,
      requestType,
      status,
      category: 'privacy_request'
    };
    
    console.log('PRIVACY AUDIT:', JSON.stringify(logEntry));
  }
};

export const encryptionService = EncryptionService.getInstance();