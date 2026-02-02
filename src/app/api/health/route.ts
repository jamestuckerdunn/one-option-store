import { NextResponse } from 'next/server';
import { db } from '@/lib/db/connection';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

interface TableCounts {
  departments: number;
  categories: number;
  products: number;
  bestseller_rankings_total: number;
  bestseller_rankings_current: number;
}

interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  database?: {
    connected: boolean;
    error?: string;
    counts?: TableCounts;
  };
}

/**
 * Health check endpoint for monitoring and load balancers.
 * GET /api/health
 *
 * Includes database diagnostics to help troubleshoot data issues.
 * Shows table counts and whether bestseller_rankings has current records.
 */
export async function GET(): Promise<NextResponse<HealthStatus>> {
  const status: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
  };

  // Test database connection and get counts
  try {
    const sql = db();

    // Get counts from all relevant tables in parallel
    const [
      deptResult,
      catResult,
      prodResult,
      brTotalResult,
      brCurrentResult,
    ] = await Promise.all([
      sql`SELECT COUNT(*)::int as count FROM departments`,
      sql`SELECT COUNT(*)::int as count FROM categories`,
      sql`SELECT COUNT(*)::int as count FROM products`,
      sql`SELECT COUNT(*)::int as count FROM bestseller_rankings`,
      sql`SELECT COUNT(*)::int as count FROM bestseller_rankings WHERE is_current = true`,
    ]);

    status.database = {
      connected: true,
      counts: {
        departments: deptResult[0]?.count ?? 0,
        categories: catResult[0]?.count ?? 0,
        products: prodResult[0]?.count ?? 0,
        bestseller_rankings_total: brTotalResult[0]?.count ?? 0,
        bestseller_rankings_current: brCurrentResult[0]?.count ?? 0,
      },
    };

    // Check if data exists but is_current is the issue
    const counts = status.database.counts!;
    if (counts.bestseller_rankings_total > 0 && counts.bestseller_rankings_current === 0) {
      logger.warn('Database has bestseller_rankings but none are marked as is_current=true');
    }
    if (counts.products > 0 && counts.bestseller_rankings_total === 0) {
      logger.warn('Database has products but no bestseller_rankings records');
    }

  } catch (err) {
    status.status = 'unhealthy';
    const errorMessage = err instanceof Error ? err.message : 'Unknown database error';
    status.database = {
      connected: false,
      error: errorMessage,
    };
    logger.error('Health check database connection failed', err instanceof Error ? err : undefined);
  }

  return NextResponse.json(status, {
    status: status.status === 'healthy' ? 200 : 503,
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}
