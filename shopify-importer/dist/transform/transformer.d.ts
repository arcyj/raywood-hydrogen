import type { ShopifyRow } from '../types/index.js';
/**
 * Merges mapped columns and scraped fields into a final Shopify row.
 * Scraped fields take precedence over mapped fields for the same key
 * only when the scraped value is non-empty.
 * All string values are trimmed.
 */
export declare function transformRow(mapped: Partial<ShopifyRow>, scraped?: Partial<ShopifyRow>): ShopifyRow;
/**
 * Derives the ordered list of Shopify CSV headers from a mapping config.
 * Includes all mapped Shopify fields. Excludes the internal urlColumn.
 */
export declare function deriveHeaders(columns: Record<string, string>, scrapeFields?: Record<string, unknown>): string[];
//# sourceMappingURL=transformer.d.ts.map