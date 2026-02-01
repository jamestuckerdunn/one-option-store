import { NextRequest, NextResponse } from 'next/server';
import { unsubscribeByToken } from '@/lib/db/subscribers';
import { isValidUUID } from '@/lib/validation';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * GET /api/newsletter/unsubscribe?token=xxx
 * Unsubscribe using the token from the email link.
 * Returns an HTML page confirming unsubscription.
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');

  if (!token) {
    return new NextResponse(generateHtmlResponse(false, 'Invalid unsubscribe link.'), {
      status: 400,
      headers: { 'Content-Type': 'text/html' },
    });
  }

  // Validate token format (UUID v4)
  if (!isValidUUID(token)) {
    return new NextResponse(generateHtmlResponse(false, 'Invalid unsubscribe link.'), {
      status: 400,
      headers: { 'Content-Type': 'text/html' },
    });
  }

  try {
    const success = await unsubscribeByToken(token);

    if (success) {
      return new NextResponse(generateHtmlResponse(true, "You've been unsubscribed."), {
        status: 200,
        headers: { 'Content-Type': 'text/html' },
      });
    } else {
      return new NextResponse(
        generateHtmlResponse(false, 'This link has already been used or is invalid.'),
        {
          status: 404,
          headers: { 'Content-Type': 'text/html' },
        }
      );
    }
  } catch (error) {
    logger.error('Unsubscribe error', error instanceof Error ? error : undefined);
    return new NextResponse(
      generateHtmlResponse(false, 'Something went wrong. Please try again.'),
      {
        status: 500,
        headers: { 'Content-Type': 'text/html' },
      }
    );
  }
}

function generateHtmlResponse(success: boolean, message: string): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://oneoptionstore.com';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${success ? 'Unsubscribed' : 'Error'} - One Option</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f5f5f5;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .card {
      background: white;
      border-radius: 12px;
      padding: 48px;
      max-width: 400px;
      text-align: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }
    .icon {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
      font-size: 28px;
    }
    .icon.success { background: #dcfce7; }
    .icon.error { background: #fee2e2; }
    h1 {
      font-size: 20px;
      color: #111;
      margin-bottom: 12px;
    }
    p {
      color: #666;
      font-size: 15px;
      line-height: 1.5;
      margin-bottom: 24px;
    }
    a {
      display: inline-block;
      padding: 12px 24px;
      background: #111;
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 500;
      font-size: 14px;
    }
    a:hover { background: #333; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon ${success ? 'success' : 'error'}">
      ${success ? '&#10003;' : '&#10007;'}
    </div>
    <h1>${success ? 'Unsubscribed' : 'Oops!'}</h1>
    <p>${message}</p>
    <a href="${siteUrl}">Back to One Option</a>
  </div>
</body>
</html>
  `.trim();
}
