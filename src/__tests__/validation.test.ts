/**
 * Input validation tests
 * Tests for the validation functions used in dynamic routes
 */

describe('Input Validation', () => {
  describe('ASIN Validation', () => {
    const isValidAsin = (asin: string): boolean => {
      return /^[A-Z0-9]{10}$/i.test(asin);
    };

    it('should accept valid 10-character alphanumeric ASIN', () => {
      expect(isValidAsin('B08N5WRWNW')).toBe(true);
      expect(isValidAsin('0123456789')).toBe(true);
      expect(isValidAsin('ABCDEFGHIJ')).toBe(true);
    });

    it('should reject ASINs that are too short', () => {
      expect(isValidAsin('B08N5')).toBe(false);
      expect(isValidAsin('')).toBe(false);
    });

    it('should reject ASINs that are too long', () => {
      expect(isValidAsin('B08N5WRWNW1')).toBe(false);
      expect(isValidAsin('B08N5WRWNW123')).toBe(false);
    });

    it('should reject ASINs with special characters', () => {
      expect(isValidAsin('B08N5-WRWN')).toBe(false);
      expect(isValidAsin('B08N5_WRWN')).toBe(false);
      expect(isValidAsin('B08N5.WRWN')).toBe(false);
    });

    it('should be case-insensitive', () => {
      expect(isValidAsin('b08n5wrwnw')).toBe(true);
      expect(isValidAsin('B08n5WrWnW')).toBe(true);
    });
  });

  describe('Slug Validation', () => {
    const isValidSlug = (slug: string): boolean => {
      return /^[a-z0-9-]+$/i.test(slug) && slug.length <= 100;
    };

    it('should accept valid slugs', () => {
      expect(isValidSlug('electronics')).toBe(true);
      expect(isValidSlug('home-garden')).toBe(true);
      expect(isValidSlug('books-2024')).toBe(true);
    });

    it('should reject slugs with invalid characters', () => {
      expect(isValidSlug('electronics!')).toBe(false);
      expect(isValidSlug('home_garden')).toBe(false);
      expect(isValidSlug('books/2024')).toBe(false);
    });

    it('should reject empty slugs', () => {
      expect(isValidSlug('')).toBe(false);
    });

    it('should reject slugs over 100 characters', () => {
      const longSlug = 'a'.repeat(101);
      expect(isValidSlug(longSlug)).toBe(false);
    });

    it('should accept slugs exactly 100 characters', () => {
      const maxSlug = 'a'.repeat(100);
      expect(isValidSlug(maxSlug)).toBe(true);
    });
  });

  describe('Slug Array Validation', () => {
    const isValidSlugSegment = (segment: string): boolean => {
      return /^[a-z0-9-]+$/i.test(segment) && segment.length <= 100;
    };

    const isValidSlugArray = (slugArray: string[]): boolean => {
      return slugArray.length > 0 && slugArray.length <= 10 && slugArray.every(isValidSlugSegment);
    };

    it('should accept valid slug arrays', () => {
      expect(isValidSlugArray(['electronics'])).toBe(true);
      expect(isValidSlugArray(['electronics', 'computers'])).toBe(true);
      expect(isValidSlugArray(['home', 'kitchen', 'appliances'])).toBe(true);
    });

    it('should reject empty arrays', () => {
      expect(isValidSlugArray([])).toBe(false);
    });

    it('should reject arrays with more than 10 segments', () => {
      const longArray = Array(11).fill('segment');
      expect(isValidSlugArray(longArray)).toBe(false);
    });

    it('should accept arrays with exactly 10 segments', () => {
      const maxArray = Array(10).fill('segment');
      expect(isValidSlugArray(maxArray)).toBe(true);
    });

    it('should reject arrays with invalid segments', () => {
      expect(isValidSlugArray(['valid', 'invalid!'])).toBe(false);
      expect(isValidSlugArray(['valid', ''])).toBe(false);
    });
  });
});
