import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
}

/**
 * Health check endpoint for monitoring and load balancers.
 * GET /api/health
 *
 * SECURITY: Does not expose version information or uptime
 * to prevent information disclosure attacks.
 */
export async function GET(): Promise<NextResponse<HealthStatus>> {
  const status: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    // SECURITY: Removed version and uptime to prevent information disclosure
  };

  return NextResponse.json(status, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}
