import { logger } from './logger.js';
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
export async function withRetry(fn, attempts = 3, delayMs = 500) {
    let lastError;
    for (let attempt = 1; attempt <= attempts; attempt++) {
        try {
            return await fn();
        }
        catch (err) {
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
//# sourceMappingURL=retry.js.map