import pLimit from 'p-limit';
import type { ScrapeConfig, ScrapeResult } from '../types/index.js';
import { scrapeUrl } from './scraper.js';

export type ScrapeQueue = {
  enqueue(url: string, config: ScrapeConfig): Promise<ScrapeResult>;
  get activeCount(): number;
  get pendingCount(): number;
};

/**
 * Creates a concurrency-limited scrape queue backed by p-limit.
 * All calls to enqueue() share the same concurrency slot pool.
 */
export function createScrapeQueue(concurrency: number): ScrapeQueue {
  const limit = pLimit(Math.max(1, concurrency));

  return {
    enqueue(url: string, config: ScrapeConfig): Promise<ScrapeResult> {
      return limit(() => scrapeUrl(url, config));
    },

    get activeCount(): number {
      return limit.activeCount;
    },

    get pendingCount(): number {
      return limit.pendingCount;
    },
  };
}
