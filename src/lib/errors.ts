/**
 * Centralized error handling utilities.
 * Ensures sensitive information is never exposed to clients in production.
 */

import { logger } from './logger';

/**
 * Application error types for structured error handling.
 */
export type ErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'RATE_LIMITED'
  | 'DATABASE_ERROR'
  | 'EXTERNAL_SERVICE_ERROR'
  | 'INTERNAL_ERROR';

/**
 * Structured application error.
 */
export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: ErrorCode,
    public readonly statusCode: number = 500,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Pre-defined error factories for common scenarios.
 */
export const Errors = {
  unauthorized: (message = 'Unauthorized') =>
    new AppError(message, 'UNAUTHORIZED', 401),

  forbidden: (message = 'Forbidden') =>
    new AppError(message, 'FORBIDDEN', 403),

  notFound: (resource = 'Resource') =>
    new AppError(`${resource} not found`, 'NOT_FOUND', 404),

  validation: (message: string, details?: Record<string, unknown>) =>
    new AppError(message, 'VALIDATION_ERROR', 400, details),

  rateLimited: (message = 'Too many requests') =>
    new AppError(message, 'RATE_LIMITED', 429),

  database: (message = 'Database error') =>
    new AppError(message, 'DATABASE_ERROR', 500),

  external: (service: string, message?: string) =>
    new AppError(
      message || `${service} service error`,
      'EXTERNAL_SERVICE_ERROR',
      502
    ),

  internal: (message = 'Internal server error') =>
    new AppError(message, 'INTERNAL_ERROR', 500),
} as const;

/**
 * Safe error response for API routes.
 * In production, sensitive details are stripped from error responses.
 */
export interface SafeErrorResponse {
  error: string;
  code?: ErrorCode;
  details?: Record<string, unknown>;
}

/**
 * Sanitize an error for client response.
 * Logs the full error server-side but returns a safe message to clients.
 */
export function sanitizeError(
  error: unknown,
  context?: string
): { response: SafeErrorResponse; statusCode: number } {
  const isProduction = process.env.NODE_ENV === 'production';

  // Handle known application errors
  if (error instanceof AppError) {
    logger.error(context || 'Application error', error, {
      code: error.code,
      details: error.details,
    });

    return {
      response: {
        error: error.message,
        code: error.code,
        // Only include details for validation errors
        details: error.code === 'VALIDATION_ERROR' ? error.details : undefined,
      },
      statusCode: error.statusCode,
    };
  }

  // Handle standard errors
  if (error instanceof Error) {
    logger.error(context || 'Unexpected error', error);

    return {
      response: {
        error: isProduction ? 'An unexpected error occurred' : error.message,
        code: 'INTERNAL_ERROR',
      },
      statusCode: 500,
    };
  }

  // Handle unknown error types
  logger.error(context || 'Unknown error', undefined, {
    rawError: String(error),
  });

  return {
    response: {
      error: 'An unexpected error occurred',
      code: 'INTERNAL_ERROR',
    },
    statusCode: 500,
  };
}

/**
 * Wrap an async API handler with error handling.
 * Catches all errors and returns sanitized responses.
 */
export function withErrorHandling<T>(
  handler: () => Promise<T>,
  context?: string
): Promise<T | { error: SafeErrorResponse; statusCode: number }> {
  return handler().catch((error) => {
    const sanitized = sanitizeError(error, context);
    return { error: sanitized.response, statusCode: sanitized.statusCode };
  });
}
