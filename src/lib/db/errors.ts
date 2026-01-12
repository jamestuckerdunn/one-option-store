/**
 * Custom database error class for better error handling.
 */
export class DatabaseError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

/**
 * Error thrown when a required database record is not found.
 */
export class NotFoundError extends DatabaseError {
  constructor(entity: string, identifier: string) {
    super(`${entity} not found: ${identifier}`, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

/**
 * Error thrown when the database connection fails.
 */
export class ConnectionError extends DatabaseError {
  constructor(originalError?: unknown) {
    super('Failed to connect to database', 'CONNECTION_FAILED', originalError);
    this.name = 'ConnectionError';
  }
}

/**
 * Wraps a database operation with error handling.
 * @param operation - The database operation to execute
 * @param errorMessage - Custom error message for failures
 * @returns The result of the operation
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  errorMessage: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    console.error(`Database error: ${errorMessage}`, error);
    throw new DatabaseError(errorMessage, undefined, error);
  }
}
