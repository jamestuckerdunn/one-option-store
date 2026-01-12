import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { logger } from '@/lib/logger';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: {
    database: {
      status: 'ok' | 'error';
      latencyMs?: number;
      error?: string;
    };
  };
}

export async function GET() {
  const healthStatus: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {
      database: { status: 'ok' },
    },
  };

  // Check database connectivity
  const dbStart = Date.now();
  try {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL not configured');
    }

    const sql = neon(connectionString);
    await sql`SELECT 1`;
    healthStatus.checks.database.latencyMs = Date.now() - dbStart;
  } catch (error) {
    healthStatus.status = 'unhealthy';
    healthStatus.checks.database.status = 'error';
    healthStatus.checks.database.error = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Health check database failure', error instanceof Error ? error : new Error(String(error)));
  }

  const httpStatus = healthStatus.status === 'healthy' ? 200 : 503;

  return NextResponse.json(healthStatus, { status: httpStatus });
}
