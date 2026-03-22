import type { ScrapeConfig, ScrapeResult } from '../types/index.js';
/**
 * Fetches a URL and extracts fields defined in the scrape config using CSS selectors.
 * Returns successfully extracted fields plus any per-field errors encountered.
 * Never throws — all errors are captured in the result.
 */
export declare function scrapeUrl(url: string, config: ScrapeConfig, retries?: number): Promise<ScrapeResult>;
export type { ScrapeResult };
//# sourceMappingURL=scraper.d.ts.map