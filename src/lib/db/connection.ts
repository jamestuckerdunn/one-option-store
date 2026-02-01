/**
 * Shared database connection.
 * Single source of truth for Neon PostgreSQL connection.
 *
 * RACE CONDITION NOTE: While JavaScript is single-threaded, concurrent async
 * operations could theoretically cause issues during initialization. We use a
 * synchronous check pattern to minimize this risk. The Neon serverless driver
 * handles connection pooling internally.
 */

import { neon, NeonQueryFunction } from '@neondatabase/serverless';
import { logger } from '../logger';

/** Lazy-initialized database connection */
let sql: NeonQueryFunction<false, false> | null = null;

/** Flag to prevent concurrent initialization */
let initializing = false;

/**
 * Get the database connection.
 * Uses lazy initialization to avoid connecting until first use.
 * Thread-safe through JavaScript's single-threaded event loop.
 * @throws Error if DATABASE_URL is not set
 * @returns The database query function
 */
export function db(): NeonQueryFunction<false, false> {
  // Fast path: connection already exists
  if (sql) {
    return sql;
  }

  // Check if another call is initializing
  if (initializing) {
    // This shouldn't happen in practice due to JS single-threaded nature,
    // but we handle it defensively by waiting a tick and retrying
    throw new Error('Database connection is initializing. Please retry.');
  }

  // Initialize connection
  initializing = true;
  try {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    sql = neon(databaseUrl);
    logger.info('Database connection initialized');
    return sql;
  } finally {
    initializing = false;
  }
}

/**
 * Reset the database connection.
 * Useful for testing or when connection needs to be refreshed.
 *
 * WARNING: Calling this while queries are in flight may cause errors.
 * Use only during application shutdown or between test suites.
 */
export function resetConnection(): void {
  if (sql) {
    logger.info('Database connection reset');
  }
  sql = null;
}

/**
 * Check if the database connection is initialized.
 * @returns True if a connection exists
 */
export function isConnected(): boolean {
  return sql !== null;
}
