/**
 * AI content generation for blog posts and buying guides.
 * Uses OpenAI API for generating SEO-optimized content.
 */

import { logger } from '../logger';

interface GeneratedContent {
  title: string;
  content: string;
  excerpt: string;
  meta_description: string;
  keywords: string[];
}

interface ProductInfo {
  name: string;
  price: number | null;
  rating: number | null;
  review_count: number | null;
  asin: string;
}

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

/** Fetch timeout in milliseconds */
const FETCH_TIMEOUT_MS = 60000; // 60 seconds for AI generation

/** Max retries for transient failures */
const MAX_RETRIES = 2;

/** Base delay for exponential backoff (ms) */
const RETRY_BASE_DELAY_MS = 2000;

/**
 * Delay helper for retry logic.
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Determine if an error is retryable.
 */
function isRetryableError(status: number | null, error: unknown): boolean {
  if (error instanceof TypeError && String(error).includes('fetch')) {
    return true;
  }
  if (status !== null && (status === 429 || status >= 500)) {
    return true;
  }
  return false;
}

/**
 * Generate a buying guide article using AI.
 */
export async function generateBuyingGuide(params: {
  categoryName: string;
  departmentName: string;
  products: ProductInfo[];
  targetAudience?: string;
}): Promise<GeneratedContent> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  const { categoryName, departmentName, products, targetAudience } = params;

  const productList = products
    .slice(0, 5)
    .map((p, i) => {
      const price = p.price ? `$${p.price.toFixed(2)}` : 'Price varies';
      const rating = p.rating ? `${p.rating}/5 stars` : 'Unrated';
      return `${i + 1}. ${p.name} - ${price}, ${rating}`;
    })
    .join('\n');

  const audienceContext = targetAudience
    ? `Target audience: ${targetAudience}`
    : 'Target audience: general consumers';

  const prompt = `You are an expert product reviewer and buying guide writer. Create a comprehensive buying guide article about "${categoryName}" products in the ${departmentName} department.

${audienceContext}

Current top-rated products in this category:
${productList}

Write an SEO-optimized article that includes:
1. An engaging introduction explaining why choosing the right ${categoryName} matters
2. Key features to consider when buying
3. Common mistakes to avoid
4. Brief mentions of top-rated products (use the product names provided)
5. A conclusion with purchasing advice

IMPORTANT GUIDELINES:
- Write in a helpful, informative tone
- Use clear headings and bullet points for readability
- Include natural mentions of the products without being overly promotional
- Focus on providing genuine value to readers
- Keep the article between 800-1200 words
- Do NOT include any affiliate links or URLs - just mention product names
- Do NOT make up specific product features or prices that weren't provided

Format your response as JSON with these fields:
{
  "title": "Article title (include category name, be compelling)",
  "content": "Full article content in Markdown format",
  "excerpt": "2-3 sentence summary for previews (max 200 chars)",
  "meta_description": "SEO meta description (max 155 chars)",
  "keywords": ["keyword1", "keyword2", ...] (5-10 relevant SEO keywords)
}`;

  let lastError: Error = new Error('Unknown error');

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are an expert product reviewer. Always respond with valid JSON.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        lastError = new Error(`OpenAI API error: ${response.status} - ${errorText}`);

        if (isRetryableError(response.status, null) && attempt < MAX_RETRIES - 1) {
          const delayMs = RETRY_BASE_DELAY_MS * Math.pow(2, attempt);
          logger.warn(`OpenAI API call failed (attempt ${attempt + 1}), retrying in ${delayMs}ms`);
          await delay(delayMs);
          continue;
        }

        throw lastError;
      }

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error('No content in OpenAI response');
      }

      // Parse JSON from response with proper error handling
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Could not find JSON in response');
      }

      let parsed: GeneratedContent;
      try {
        parsed = JSON.parse(jsonMatch[0]) as GeneratedContent;
      } catch (parseError) {
        throw new Error(`Failed to parse JSON from response: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
      }

      return {
        title: parsed.title || `Best ${categoryName} - Buying Guide`,
        content: parsed.content || '',
        excerpt: parsed.excerpt?.slice(0, 200) || '',
        meta_description: parsed.meta_description?.slice(0, 155) || '',
        keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
      };
    } catch (error) {
      clearTimeout(timeoutId);
      lastError = error instanceof Error ? error : new Error(String(error));

      if (isRetryableError(null, error) && attempt < MAX_RETRIES - 1) {
        const delayMs = RETRY_BASE_DELAY_MS * Math.pow(2, attempt);
        logger.warn(`Content generation error (attempt ${attempt + 1}), retrying in ${delayMs}ms`);
        await delay(delayMs);
        continue;
      }

      logger.error('Content generation error', lastError);
      throw lastError;
    }
  }

  throw lastError;
}

/**
 * Generate a "Best X for Y" article.
 */
export async function generateBestForArticle(params: {
  categoryName: string;
  useCase: string;
  products: ProductInfo[];
}): Promise<GeneratedContent> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  const { categoryName, useCase, products } = params;

  const productList = products
    .slice(0, 5)
    .map((p, i) => {
      const price = p.price ? `$${p.price.toFixed(2)}` : 'Price varies';
      const rating = p.rating ? `${p.rating}/5 stars` : 'Unrated';
      return `${i + 1}. ${p.name} - ${price}, ${rating}`;
    })
    .join('\n');

  const prompt = `You are an expert product reviewer. Write an article titled "Best ${categoryName} for ${useCase}" that helps readers find the perfect product for their specific needs.

Top-rated products in ${categoryName}:
${productList}

Write an SEO-optimized article that:
1. Explains why ${useCase} requires specific considerations
2. Discusses what features matter most for this use case
3. Recommends products with explanations of why they're good for ${useCase}
4. Includes tips for making the right choice
5. Has a clear conclusion

IMPORTANT GUIDELINES:
- Write for readers specifically interested in ${useCase}
- Be practical and helpful
- Use clear headings and organized structure
- Keep to 600-900 words
- Do NOT include URLs or affiliate links
- Do NOT fabricate product details

Format your response as JSON:
{
  "title": "Best ${categoryName} for ${useCase} [Current Year]",
  "content": "Full article in Markdown",
  "excerpt": "Brief summary (max 200 chars)",
  "meta_description": "SEO description (max 155 chars)",
  "keywords": ["keyword1", "keyword2", ...]
}`;

  let lastError: Error = new Error('Unknown error');

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are an expert product reviewer. Always respond with valid JSON.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 1500,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        lastError = new Error(`OpenAI API error: ${response.status} - ${errorText}`);

        if (isRetryableError(response.status, null) && attempt < MAX_RETRIES - 1) {
          const delayMs = RETRY_BASE_DELAY_MS * Math.pow(2, attempt);
          logger.warn(`OpenAI API call failed (attempt ${attempt + 1}), retrying in ${delayMs}ms`);
          await delay(delayMs);
          continue;
        }

        throw lastError;
      }

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error('No content in OpenAI response');
      }

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Could not find JSON in response');
      }

      let parsed: GeneratedContent;
      try {
        parsed = JSON.parse(jsonMatch[0]) as GeneratedContent;
      } catch (parseError) {
        throw new Error(`Failed to parse JSON from response: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
      }

      return {
        title: parsed.title || `Best ${categoryName} for ${useCase}`,
        content: parsed.content || '',
        excerpt: parsed.excerpt?.slice(0, 200) || '',
        meta_description: parsed.meta_description?.slice(0, 155) || '',
        keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
      };
    } catch (error) {
      clearTimeout(timeoutId);
      lastError = error instanceof Error ? error : new Error(String(error));

      if (isRetryableError(null, error) && attempt < MAX_RETRIES - 1) {
        const delayMs = RETRY_BASE_DELAY_MS * Math.pow(2, attempt);
        logger.warn(`Content generation error (attempt ${attempt + 1}), retrying in ${delayMs}ms`);
        await delay(delayMs);
        continue;
      }

      logger.error('Content generation error', lastError);
      throw lastError;
    }
  }

  throw lastError;
}

/**
 * Generate a URL-safe slug from a title.
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 100);
}

/**
 * Check if AI content generation is available.
 */
export function isAIConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY;
}
