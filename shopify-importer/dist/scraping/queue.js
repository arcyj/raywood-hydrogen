import pLimit from 'p-limit';
import { scrapeUrl } from './scraper.js';
/**
 * Creates a concurrency-limited scrape queue backed by p-limit.
 * All calls to enqueue() share the same concurrency slot pool.
 */
export function createScrapeQueue(concurrency) {
    const limit = pLimit(Math.max(1, concurrency));
    return {
        enqueue(url, config) {
            return limit(() => scrapeUrl(url, config));
        },
        get activeCount() {
            return limit.activeCount;
        },
        get pendingCount() {
            return limit.pendingCount;
        },
    };
}
//# sourceMappingURL=queue.js.map