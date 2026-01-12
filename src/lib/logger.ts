// Simple logging utility with Sentry integration support

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private isDev = process.env.NODE_ENV === 'development';

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  debug(message: string, context?: LogContext): void {
    if (this.isDev) {
      console.debug(this.formatMessage('debug', message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    console.info(this.formatMessage('info', message, context));
  }

  warn(message: string, context?: LogContext): void {
    console.warn(this.formatMessage('warn', message, context));
  }

  error(message: string, error?: Error, context?: LogContext): void {
    const errorContext = error
      ? { ...context, errorName: error.name, errorMessage: error.message, stack: error.stack }
      : context;
    console.error(this.formatMessage('error', message, errorContext));

    // In production, this is where you would send to Sentry
    // if (process.env.SENTRY_DSN && error) {
    //   Sentry.captureException(error, { extra: context });
    // }
  }
}

export const logger = new Logger();
