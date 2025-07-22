// Simplified environment configuration for Gmail service
import * as dotenv from 'dotenv';

dotenv.config();

export const env = {
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  PORT: process.env.PORT || '3001',
  NODE_ENV: process.env.NODE_ENV || 'development',
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || '',
  ENABLE_DEBUG_LOGS: process.env.ENABLE_DEBUG_LOGS === 'true',
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://127.0.0.1:3000',
  CORS_CREDENTIALS: process.env.CORS_CREDENTIALS === 'true',
  
  // Stub values for compatibility with Inbox Zero utils
  NEXT_PUBLIC_AXIOM_TOKEN: process.env.NEXT_PUBLIC_AXIOM_TOKEN || '',
  DATABASE_URL: process.env.DATABASE_URL || '',
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || '',
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || ''
};
