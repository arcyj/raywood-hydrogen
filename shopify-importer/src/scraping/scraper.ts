import axios, { type AxiosInstance } from 'axios';
import * as cheerio from 'cheerio';
import type { ScrapeConfig, ShopifyRow, ScrapeResult } from '../types/index.js';
import { ScrapeError } from '../utils/errors.js';
import { withRetry } from '../utils/retry.js';
import { logger } from '../utils/logger.js';

const DEFAULT_TIMEOUT_MS = 15_000;
const DEFAULT_USER_AGENT =
  'Mozilla/5.0 (compatible; shopify-importer/1.0; +https://github.com/shopify-importer)';

let _client: AxiosInstance | null = null;

function getClient(): AxiosInstance {
  if (!_client) {
    _client = axios.create({
      timeout: DEFAULT_TIMEOUT_MS,
      headers: { 'User-Agent': DEFAULT_USER_AGENT },
    });
  }
  return _client;
}

/**
 * Fetches a URL and extracts fields defined in the scrape config using CSS selectors.
 * Returns successfully extracted fields plus any per-field errors encountered.
 * Never throws — all errors are captured in the result.
 */
export async function scrapeUrl(
  url: string,
  config: ScrapeConfig,
  retries: number = 2,
): Promise<ScrapeResult> {
  const result: ScrapeResult = { fields: {}, errors: [] };

  let html: string;
  try {
    const response = await withRetry(
      () => getClient().get<string>(url, { responseType: 'text' }),
      retries,
    );
    html = response.data;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new ScrapeError(`Failed to fetch URL: ${url} — ${message}`, url, err);
  }

  const $ = cheerio.load(html);

  for (const [shopifyField, rule] of Object.entries(config.fields)) {
    try {
      const element = $(rule.selector).first();
      if (element.length === 0) {
        logger.debug(`Selector "${rule.selector}" matched nothing on ${url}`);
        result.errors.push(`No element found for selector "${rule.selector}" (field: ${shopifyField})`);
        continue;
      }

      const value = rule.attribute
        ? (element.attr(rule.attribute) ?? '')
        : element.html() ?? element.text();

      result.fields[shopifyField] = value.trim();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      result.errors.push(`Error extracting "${shopifyField}": ${message}`);
    }
  }

  return result;
}

export type { ScrapeResult };
