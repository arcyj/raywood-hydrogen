import { logger } from './logger.js';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  attempts: number = 3,
  delayMs: number = 500,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < attempts) {
        const wait = delayMs * attempt;
        logger.warn(`Attempt ${attempt}/${attempts} failed. Retrying in ${wait}ms...`, err);
        await sleep(wait);
      }
    }
  }

  throw lastError;
}
