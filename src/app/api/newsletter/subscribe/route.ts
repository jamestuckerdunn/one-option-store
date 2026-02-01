import { NextRequest, NextResponse } from 'next/server';
import { subscribeEmail } from '@/lib/db/subscribers';
import { sendWelcomeEmail } from '@/lib/email';
import { isValidEmail, isJsonContentType, MAX_BODY_SIZES } from '@/lib/validation';
import { checkRateLimit, getClientIdentifier, createRateLimitHeaders } from '@/lib/rate-limit';
import { RATE_LIMITS } from '@/lib/constants';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * POST /api/newsletter/subscribe
 * Subscribe an email to the newsletter.
 */
export async function POST(request: NextRequest) {
  // Rate limiting for subscribe endpoint
  const clientId = getClientIdentifier(request);
  const rateLimit = checkRateLimit(`newsletter-subscribe:${clientId}`, RATE_LIMITS.SUBSCRIBE);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many subscription attempts. Please try again later.' },
      {
        status: 429,
        headers: createRateLimitHeaders(rateLimit, RATE_LIMITS.SUBSCRIBE),
      }
    );
  }

  // Validate Content-Type
  if (!isJsonContentType(request.headers.get('content-type'))) {
    return NextResponse.json(
      { error: 'Content-Type must be application/json' },
      { status: 415 }
    );
  }

  // Validate body size
  const contentLength = parseInt(request.headers.get('content-length') || '0', 10);
  if (contentLength > MAX_BODY_SIZES.NEWSLETTER) {
    return NextResponse.json(
      { error: 'Request body too large' },
      { status: 413 }
    );
  }

  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // RFC 5322 compliant email validation
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Check for disposable email domains (basic list)
    const disposableDomains = ['tempmail.com', 'throwaway.com', 'mailinator.com', 'guerrillamail.com'];
    const domain = email.split('@')[1]?.toLowerCase();
    if (disposableDomains.includes(domain)) {
      return NextResponse.json(
        { error: 'Please use a permanent email address' },
        { status: 400 }
      );
    }

    const subscriber = await subscribeEmail(email);

    if (subscriber === null) {
      return NextResponse.json(
        { message: 'You are already subscribed!' },
        { status: 200 }
      );
    }

    // Send welcome email (don't block on it)
    sendWelcomeEmail(subscriber.email, subscriber.unsubscribe_token).catch((err) => {
      logger.error('Failed to send welcome email', err instanceof Error ? err : new Error(String(err)));
    });

    return NextResponse.json(
      { message: "You're subscribed! Check your inbox for a welcome email." },
      { status: 201 }
    );
  } catch (error) {
    logger.error('Subscribe error', error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: 'Failed to subscribe. Please try again.' },
      { status: 500 }
    );
  }
}
