// Environment variable validation and configuration

function getEnvVar(key: string, required: boolean = true): string {
  const value = process.env[key];
  if (!value && required) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value || '';
}

function getEnvVarOptional(key: string, defaultValue: string = ''): string {
  return process.env[key] || defaultValue;
}

export const config = {
  // Database
  databaseUrl: getEnvVar('DATABASE_URL'),

  // Site
  siteUrl: getEnvVarOptional('NEXT_PUBLIC_SITE_URL', 'https://oneoptionstore.com'),
  siteName: 'One Option Store',

  // Amazon affiliate
  amazonAffiliateUrl: getEnvVarOptional('NEXT_PUBLIC_AMAZON_URL', 'https://amazon.com'),

  // Cron authentication
  cronSecret: getEnvVarOptional('CRON_SECRET'),

  // Error tracking
  sentryDsn: getEnvVarOptional('SENTRY_DSN'),

  // Environment
  isDev: process.env.NODE_ENV === 'development',
  isProd: process.env.NODE_ENV === 'production',
} as const;

// Validate required environment variables at startup (only in production)
export function validateEnv(): void {
  if (config.isProd) {
    getEnvVar('DATABASE_URL');
    // Add other required production env vars here
  }
}
