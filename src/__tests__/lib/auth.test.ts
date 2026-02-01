import { timingSafeCompare } from '@/lib/auth';

describe('Authentication Utilities', () => {
  describe('timingSafeCompare', () => {
    it('returns true for identical strings', () => {
      expect(timingSafeCompare('secret123', 'secret123')).toBe(true);
    });

    it('returns false for different strings', () => {
      expect(timingSafeCompare('secret123', 'secret456')).toBe(false);
    });

    it('returns false for strings of different lengths', () => {
      expect(timingSafeCompare('short', 'muchlongerstring')).toBe(false);
    });

    it('returns false for empty vs non-empty strings', () => {
      expect(timingSafeCompare('', 'notempty')).toBe(false);
      expect(timingSafeCompare('notempty', '')).toBe(false);
    });

    it('returns true for two empty strings', () => {
      expect(timingSafeCompare('', '')).toBe(true);
    });

    it('handles special characters', () => {
      expect(timingSafeCompare('p@ss!w0rd#123', 'p@ss!w0rd#123')).toBe(true);
      expect(timingSafeCompare('p@ss!w0rd#123', 'p@ss!w0rd#124')).toBe(false);
    });

    it('handles unicode characters', () => {
      expect(timingSafeCompare('hello世界', 'hello世界')).toBe(true);
      expect(timingSafeCompare('hello世界', 'hello世')).toBe(false);
    });

    it('returns false for non-string inputs', () => {
      // @ts-expect-error Testing invalid input
      expect(timingSafeCompare(123, 'string')).toBe(false);
      // @ts-expect-error Testing invalid input
      expect(timingSafeCompare('string', null)).toBe(false);
      // @ts-expect-error Testing invalid input
      expect(timingSafeCompare(undefined, undefined)).toBe(false);
    });
  });
});
