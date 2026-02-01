import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { logger } from '@/lib/logger';
import { isCronAuthorized } from '@/lib/auth';

let sql: ReturnType<typeof neon> | null = null;

function db() {
  if (!sql) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not set');
    }
    sql = neon(process.env.DATABASE_URL);
  }
  return sql;
}

interface DataStats {
  departments: number;
  categories: number;
  products: number;
  currentBestsellers: number;
  oldestUpdate: string | null;
  newestUpdate: string | null;
}

async function getDataStats(): Promise<DataStats> {
  type Row = Record<string, unknown>;

  const [deptCount, catCount, prodCount, bestsellerCount, dates] = await Promise.all([
    db()`SELECT COUNT(*) as count FROM departments`,
    db()`SELECT COUNT(*) as count FROM categories`,
    db()`SELECT COUNT(*) as count FROM products`,
    db()`SELECT COUNT(*) as count FROM bestseller_rankings WHERE is_current = true`,
    db()`SELECT MIN(updated_at) as oldest, MAX(updated_at) as newest FROM products`,
  ]);

  const deptRows = deptCount as unknown as Row[];
  const catRows = catCount as unknown as Row[];
  const prodRows = prodCount as unknown as Row[];
  const bestsellerRows = bestsellerCount as unknown as Row[];
  const dateRows = dates as unknown as Row[];

  return {
    departments: Number(deptRows[0]?.count || 0),
    categories: Number(catRows[0]?.count || 0),
    products: Number(prodRows[0]?.count || 0),
    currentBestsellers: Number(bestsellerRows[0]?.count || 0),
    oldestUpdate: dateRows[0]?.oldest ? String(dateRows[0].oldest) : null,
    newestUpdate: dateRows[0]?.newest ? String(dateRows[0].newest) : null,
  };
}

export async function GET(request: NextRequest) {
  // Verify authorization using timing-safe comparison
  if (!isCronAuthorized(request)) {
    logger.warn('Unauthorized cron request attempted');
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    logger.info('Cron scrape job started');

    // Get current data statistics
    const stats = await getDataStats();

    // Calculate data freshness
    let dataFreshness = 'no_data';
    if (stats.newestUpdate) {
      const newestDate = new Date(stats.newestUpdate);
      const hoursSinceUpdate = (Date.now() - newestDate.getTime()) / (1000 * 60 * 60);

      if (hoursSinceUpdate < 24) {
        dataFreshness = 'fresh';
      } else if (hoursSinceUpdate < 72) {
        dataFreshness = 'stale';
      } else {
        dataFreshness = 'outdated';
      }
    }

    logger.info('Cron scrape job completed', { stats, dataFreshness });

    return NextResponse.json({
      success: true,
      message: 'Data status check completed',
      timestamp: new Date().toISOString(),
      stats: {
        departments: stats.departments,
        categories: stats.categories,
        products: stats.products,
        currentBestsellers: stats.currentBestsellers,
      },
      freshness: {
        status: dataFreshness,
        oldestUpdate: stats.oldestUpdate,
        newestUpdate: stats.newestUpdate,
      },
    });
  } catch (error) {
    logger.error('Cron scrape job failed', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: 'Scrape job failed' },
      { status: 500 }
    );
  }
}
