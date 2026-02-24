/**
 * Server-side logger that sends logs to PostHog.
 * Use in loaders, actions, and other server code.
 */

export type LogLevel = 'info' | 'warning' | 'error';

export interface LogContext {
  [key: string]: unknown;
}

export interface ServerLoggerConfig {
  apiKey: string;
  host?: string; // e.g. 'eu.' for EU, empty for US
}

/**
 * Sends a log event to PostHog from the server.
 * Fire-and-forget – does not block the request.
 */
export function logToPostHog(
  config: ServerLoggerConfig | null,
  level: LogLevel,
  message: string,
  context?: LogContext,
): void {
  if (!config?.apiKey) {
    // Fallback to console when PostHog is not configured
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
    return;
  }

  const host = config.host?.includes('eu.') ? 'eu.i.posthog.com' : 'us.i.posthog.com';
  const payload = {
    api_key: config.apiKey,
    event: 'app_log',
    distinct_id: 'server',
    properties: {
      level,
      message,
      ...context,
      timestamp: new Date().toISOString(),
      source: 'server',
    },
  };

  fetch(`https://${host}/i/v0/e/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch((err) => console.error('[logger] Failed to send to PostHog:', err));
}

/**
 * Creates a server logger bound to env/config.
 */
export function createServerLogger(env: Record<string, string | undefined> | unknown) {
  const e = env as Record<string, string | undefined>;
  const apiKey = e?.VITE_PUBLIC_POSTHOG_KEY ?? e?.PUBLIC_POSTHOG_KEY;
  const host = e?.VITE_PUBLIC_POSTHOG_HOST ?? e?.PUBLIC_POSTHOG_HOST ?? '';

  const config: ServerLoggerConfig | null = apiKey ? { apiKey, host } : null;

  return {
    info: (message: string, context?: LogContext) => logToPostHog(config, 'info', message, context),
    warn: (message: string, context?: LogContext) => logToPostHog(config, 'warning', message, context),
    error: (message: string, context?: LogContext) => logToPostHog(config, 'error', message, context),
  };
}
