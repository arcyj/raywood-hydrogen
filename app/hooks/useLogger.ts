import { usePostHog } from '@posthog/react';

export type LogLevel = 'info' | 'warning' | 'error';

export interface LogContext {
  [key: string]: unknown;
}

export interface Logger {
  info: (message: string, context?: LogContext) => void;
  warn: (message: string, context?: LogContext) => void;
  error: (message: string, context?: LogContext) => void;
}

/**
 * Logger that sends logs to PostHog with level separation (info, warning, error).
 * Falls back to console when PostHog is not available.
 */
export function useLogger(): Logger {
  const posthog = usePostHog();

  const log = (level: LogLevel, message: string, context?: LogContext) => {
    const payload = {
      level,
      message,
      ...context,
      timestamp: new Date().toISOString(),
    };

    if (posthog) {
      posthog.capture('app_log', payload);
    }

    switch (level) {
      case 'info':
        console.info('[app]', message, context ?? '');
        break;
      case 'warning':
        console.warn('[app]', message, context ?? '');
        break;
      case 'error':
        console.error('[app]', message, context ?? '');
        break;
    }
  };

  return {
    info: (message, context) => log('info', message, context),
    warn: (message, context) => log('warning', message, context),
    error: (message, context) => log('error', message, context),
  };
}
