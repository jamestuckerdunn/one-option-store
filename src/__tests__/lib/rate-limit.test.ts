import { checkRateLimit, rateLimiters, getClientIdentifier } from '@/lib/rate-limit';

// Helper to generate truly unique identifiers
let counter = 0;
const uniqueId = (prefix: string) => `${prefix}-${Date.now()}-${++counter}-${Math.random().toString(36).slice(2)}`;

describe('Rate Limiting', () => {
  describe('checkRateLimit', () => {
    it('allows requests within limit', () => {
      const identifier = uniqueId('test');
      const config = { windowMs: 60000, maxRequests: 5 };

      const result = checkRateLimit(identifier, config);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
    });

    it('decrements remaining requests correctly', () => {
      const identifier = uniqueId('test');
      const config = { windowMs: 60000, maxRequests: 5 };

      checkRateLimit(identifier, config);
      checkRateLimit(identifier, config);
      const result = checkRateLimit(identifier, config);

      expect(result.remaining).toBe(2);
    });

    it('blocks requests over limit', () => {
      const identifier = uniqueId('test');
      const config = { windowMs: 60000, maxRequests: 2 };

      checkRateLimit(identifier, config);
      checkRateLimit(identifier, config);
      const result = checkRateLimit(identifier, config);

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('provides resetIn timestamp', () => {
      const identifier = uniqueId('test');
      const config = { windowMs: 60000, maxRequests: 5 };

      const result = checkRateLimit(identifier, config);

      expect(result.resetIn).toBeGreaterThan(0);
      expect(result.resetIn).toBeLessThanOrEqual(config.windowMs);
    });
  });

  describe('rateLimiters', () => {
    it('search limiter allows 30 requests per minute', () => {
      const identifier = uniqueId('search');
      const result = rateLimiters.search(identifier);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(29);
    });

    it('subscribe limiter allows 5 requests per hour', () => {
      const identifier = uniqueId('subscribe');
      const result = rateLimiters.subscribe(identifier);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
    });

    it('general limiter allows 100 requests per minute', () => {
      const identifier = uniqueId('general');
      const result = rateLimiters.general(identifier);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(99);
    });
  });

  describe('getClientIdentifier', () => {
    // Create a mock request with headers
    const createMockRequest = (headers: Record<string, string> = {}) => ({
      headers: {
        get: (name: string) => headers[name.toLowerCase()] ?? null,
      },
    } as unknown as Request);

    it('extracts IP from x-forwarded-for header', () => {
      const request = createMockRequest({ 'x-forwarded-for': '192.168.1.1, 10.0.0.1' });

      const identifier = getClientIdentifier(request);

      expect(identifier).toBe('192.168.1.1');
    });

    it('extracts IP from x-real-ip header', () => {
      const request = createMockRequest({ 'x-real-ip': '192.168.1.2' });

      const identifier = getClientIdentifier(request);

      expect(identifier).toBe('192.168.1.2');
    });

    it('returns unknown when no IP headers present', () => {
      const request = createMockRequest();

      const identifier = getClientIdentifier(request);

      expect(identifier).toBe('unknown');
    });
  });
});
