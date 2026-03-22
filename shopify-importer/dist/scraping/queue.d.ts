import type { ScrapeConfig, ScrapeResult } from '../types/index.js';
export type ScrapeQueue = {
    enqueue(url: string, config: ScrapeConfig): Promise<ScrapeResult>;
    get activeCount(): number;
    get pendingCount(): number;
};
/**
 * Creates a concurrency-limited scrape queue backed by p-limit.
 * All calls to enqueue() share the same concurrency slot pool.
 */
export declare function createScrapeQueue(concurrency: number): ScrapeQueue;
//# sourceMappingURL=queue.d.ts.map