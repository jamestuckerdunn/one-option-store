/**
 * Environment variable validation and configuration.
 *
 * IMPORTANT: This module validates environment variables at import time
 * (for required ones) and provides a validateEnv() function that should
 * be called during application startup.
 */

import { logger } from './logger';

/** Validation state tracking */
let envValidated = false;

/**
 * Get a required environment variable.
 * @throws Error if the variable is not set in production
 */
function getEnvVar(key: string, required: boolean = true): string {
  const value = process.env[key];
  if (!value && required) {
    // In production, throw immediately
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    // In development, log a warning
    console.warn(`[CONFIG] Warning: ${key} is not set`);
  }
  return value || '';
}

/**
 * Get an optional environment variable with a default value.
 * Logs when using a fallback value in production.
 */
function getEnvVarOptional(key: string, defaultValue: string = ''): string {
  const value = process.env[key];
  if (!value && process.env.NODE_ENV === 'production' && defaultValue) {
    console.warn(`[CONFIG] Using fallback for ${key}: ${defaultValue}`);
  }
  return value || defaultValue;
}

/**
 * Application configuration.
 * Uses lazy evaluation for DATABASE_URL to allow startup validation.
 */
export const config = {
  // Database - lazy getter to allow validation at startup
  get databaseUrl(): string {
    return getEnvVar('DATABASE_URL');
  },

  // Site
  // NOTE: siteUrl fallback of 'https://oneoptionstore.com' is intentional
  siteUrl: getEnvVarOptional('NEXT_PUBLIC_SITE_URL', 'https://oneoptionstore.com'),
  siteName: 'One Option Store',

  // Amazon affiliate
  // NOTE: Amazon URL fallback to amazon.com is intentional
  amazonAffiliateUrl: getEnvVarOptional('NEXT_PUBLIC_AMAZON_URL', 'https://amazon.com'),

  // Cron authentication
  cronSecret: getEnvVarOptional('CRON_SECRET'),

  // Admin authentication
  adminSecret: getEnvVarOptional('ADMIN_SECRET'),

  // Error tracking
  sentryDsn: getEnvVarOptional('SENTRY_DSN'),

  // Email service
  resendApiKey: getEnvVarOptional('RESEND_API_KEY'),

  // AI content generation
  openaiApiKey: getEnvVarOptional('OPENAI_API_KEY'),

  // Environment
  isDev: process.env.NODE_ENV === 'development',
  isProd: process.env.NODE_ENV === 'production',
  nodeEnv: process.env.NODE_ENV || 'development',
} as const;

/**
 * Required environment variables by environment.
 */
const REQUIRED_VARS = {
  // Always required
  base: ['DATABASE_URL'] as const,
  // Only required in production
  production: ['CRON_SECRET', 'ADMIN_SECRET'] as const,
  // Optional but recommended
  optional: ['RESEND_API_KEY', 'OPENAI_API_KEY', 'SENTRY_DSN'] as const,
};

/**
 * Validate all required environment variables at startup.
 * Should be called early in the application lifecycle.
 *
 * @throws Error if required variables are missing in production
 */
export function validateEnv(): void {
  if (envValidated) {
    return; // Already validated
  }

  const missing: string[] = [];
  const warnings: string[] = [];

  // Check base required vars
  for (const key of REQUIRED_VARS.base) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  // Check production-only required vars
  if (config.isProd) {
    for (const key of REQUIRED_VARS.production) {
      if (!process.env[key]) {
        missing.push(key);
      }
    }
  }

  // Check optional vars (warnings only)
  for (const key of REQUIRED_VARS.optional) {
    if (!process.env[key]) {
      warnings.push(key);
    }
  }

  // Report warnings
  if (warnings.length > 0) {
    logger.warn('Optional environment variables not set', {
      variables: warnings,
      message: 'Some features may be disabled',
    });
  }

  // Fail on missing required vars in production
  if (missing.length > 0) {
    const errorMsg = `Missing required environment variables: ${missing.join(', ')}`;
    if (config.isProd) {
      throw new Error(errorMsg);
    } else {
      console.warn(`[CONFIG] ${errorMsg}`);
    }
  }

  envValidated = true;
  logger.info('Environment validation completed');
}

/**
 * Check if a feature is enabled based on its configuration.
 */
export const features = {
  email: () => !!config.resendApiKey,
  ai: () => !!config.openaiApiKey,
  errorTracking: () => !!config.sentryDsn,
} as const;
