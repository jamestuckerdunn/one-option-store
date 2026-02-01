import { AppError, Errors, sanitizeError } from '@/lib/errors';

describe('Error Handling Utilities', () => {
  describe('AppError', () => {
    it('creates error with correct properties', () => {
      const error = new AppError('Test error', 'VALIDATION_ERROR', 400, { field: 'email' });

      expect(error.message).toBe('Test error');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.statusCode).toBe(400);
      expect(error.details).toEqual({ field: 'email' });
      expect(error.name).toBe('AppError');
    });

    it('defaults to 500 status code', () => {
      const error = new AppError('Test error', 'INTERNAL_ERROR');

      expect(error.statusCode).toBe(500);
    });
  });

  describe('Error factories', () => {
    it('creates unauthorized error', () => {
      const error = Errors.unauthorized();

      expect(error.code).toBe('UNAUTHORIZED');
      expect(error.statusCode).toBe(401);
    });

    it('creates forbidden error', () => {
      const error = Errors.forbidden();

      expect(error.code).toBe('FORBIDDEN');
      expect(error.statusCode).toBe(403);
    });

    it('creates not found error with resource name', () => {
      const error = Errors.notFound('Product');

      expect(error.message).toBe('Product not found');
      expect(error.code).toBe('NOT_FOUND');
      expect(error.statusCode).toBe(404);
    });

    it('creates validation error with details', () => {
      const error = Errors.validation('Invalid email', { field: 'email' });

      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.statusCode).toBe(400);
      expect(error.details).toEqual({ field: 'email' });
    });

    it('creates rate limited error', () => {
      const error = Errors.rateLimited();

      expect(error.code).toBe('RATE_LIMITED');
      expect(error.statusCode).toBe(429);
    });

    it('creates database error', () => {
      const error = Errors.database('Connection failed');

      expect(error.code).toBe('DATABASE_ERROR');
      expect(error.statusCode).toBe(500);
    });

    it('creates external service error', () => {
      const error = Errors.external('AWS');

      expect(error.message).toBe('AWS service error');
      expect(error.code).toBe('EXTERNAL_SERVICE_ERROR');
      expect(error.statusCode).toBe(502);
    });

    it('creates internal error', () => {
      const error = Errors.internal();

      expect(error.code).toBe('INTERNAL_ERROR');
      expect(error.statusCode).toBe(500);
    });
  });

  describe('sanitizeError', () => {
    it('sanitizes AppError correctly', () => {
      const error = new AppError('Test error', 'VALIDATION_ERROR', 400);
      const result = sanitizeError(error, 'test context');

      expect(result.response.error).toBe('Test error');
      expect(result.response.code).toBe('VALIDATION_ERROR');
      expect(result.statusCode).toBe(400);
    });

    it('includes details only for validation errors', () => {
      const validationError = new AppError('Invalid', 'VALIDATION_ERROR', 400, { field: 'email' });
      const internalError = new AppError('Failed', 'INTERNAL_ERROR', 500, { sensitive: 'data' });

      const validationResult = sanitizeError(validationError);
      const internalResult = sanitizeError(internalError);

      expect(validationResult.response.details).toEqual({ field: 'email' });
      expect(internalResult.response.details).toBeUndefined();
    });

    it('handles standard Error objects', () => {
      const error = new Error('Standard error');
      const result = sanitizeError(error);

      expect(result.response.code).toBe('INTERNAL_ERROR');
      expect(result.statusCode).toBe(500);
    });

    it('handles unknown error types', () => {
      const result = sanitizeError('string error');

      expect(result.response.error).toBe('An unexpected error occurred');
      expect(result.statusCode).toBe(500);
    });
  });
});
