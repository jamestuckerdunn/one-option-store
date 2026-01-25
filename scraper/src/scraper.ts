// Puppeteer browser setup with stealth mode
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import type { Browser, Page } from 'puppeteer';

// Add stealth plugin to avoid detection
puppeteer.use(StealthPlugin());

// User agents to rotate
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
];

export function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function randomDelay(minMs: number, maxMs: number): Promise<void> {
  const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return sleep(delay);
}

export interface ScraperConfig {
  headless?: boolean;
  slowMo?: number;
}

export class Scraper {
  private browser: Browser | null = null;
  private config: ScraperConfig;

  constructor(config: ScraperConfig = {}) {
    this.config = {
      headless: true,
      slowMo: 0,
      ...config,
    };
  }

  async launch(): Promise<void> {
    console.log('Launching browser...');
    this.browser = await puppeteer.launch({
      headless: this.config.headless,
      slowMo: this.config.slowMo,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920,1080',
      ],
    });
    console.log('Browser launched');
  }

  async newPage(): Promise<Page> {
    if (!this.browser) {
      throw new Error('Browser not launched. Call launch() first.');
    }

    const page = await this.browser.newPage();

    // Set random user agent
    const userAgent = getRandomUserAgent();
    await page.setUserAgent(userAgent);

    // Set viewport
    await page.setViewport({ width: 1920, height: 1080 });

    // Set extra headers
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    });

    return page;
  }

  async close(): Promise<void> {
    if (this.browser) {
      console.log('Closing browser...');
      await this.browser.close();
      this.browser = null;
      console.log('Browser closed');
    }
  }

  async navigateWithRetry(
    page: Page,
    url: string,
    maxRetries = 3
  ): Promise<boolean> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Navigating to ${url} (attempt ${attempt}/${maxRetries})`);
        await page.goto(url, {
          waitUntil: 'networkidle2',
          timeout: 60000,
        });

        // Check if we hit a captcha or block page
        const content = await page.content();
        if (
          content.includes('Enter the characters you see below') ||
          content.includes('Sorry, we just need to make sure')
        ) {
          console.log('Captcha detected, waiting and retrying...');
          await randomDelay(30000, 60000);
          continue;
        }

        return true;
      } catch (error) {
        console.error(
          `Navigation failed (attempt ${attempt}):`,
          error instanceof Error ? error.message : error
        );
        if (attempt < maxRetries) {
          // Exponential backoff
          const backoffMs = Math.pow(2, attempt) * 10000;
          console.log(`Waiting ${backoffMs / 1000}s before retry...`);
          await sleep(backoffMs);
        }
      }
    }
    return false;
  }
}

export function createScraper(config?: ScraperConfig): Scraper {
  return new Scraper(config);
}
