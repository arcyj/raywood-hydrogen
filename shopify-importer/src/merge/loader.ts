import { resolve } from 'node:path';
import { createCsvReader } from '../csv/reader.js';
import { createXmlReader } from '../xml/reader.js';
import { logger } from '../utils/logger.js';
import { normalizeKey } from '../utils/normalize.js';
import type { MergeConfig, SupplierRow } from '../types/index.js';

function resolveFormat(file: string, format?: string): 'csv' | 'xml' {
  if (format === 'csv' || format === 'xml') return format;
  if (/\.xml$/i.test(file)) return 'xml';
  return 'csv';
}

/**
 * Reads the secondary merge file in full and returns a Map keyed by the
 * join column value (trimmed, lowercased) for O(1) per-row lookups.
 */
export async function loadMergeTable(
  config: MergeConfig,
  baseDir: string,
): Promise<Map<string, SupplierRow>> {
  const filePath = resolve(baseDir, config.file);
  const format = resolveFormat(filePath, config.format);
  const delimiter = config.delimiter ?? ',';

  logger.info(`Loading merge file (${format}): ${filePath}`);
  logger.info(`  Join key: secondary["${config.joinOn.secondary}"]`);

  const source: AsyncIterable<SupplierRow> =
    format === 'xml'
      ? createXmlReader(filePath, config.xmlReader!)
      : createCsvReader(filePath, { delimiter });

  const table = new Map<string, SupplierRow>();
  let count = 0;
  let duplicates = 0;

  for await (const row of source) {
    const key = normalizeKey(row[config.joinOn.secondary] ?? '');
    if (!key) continue;

    if (table.has(key)) {
      duplicates++;
      logger.debug(`Merge table: duplicate key "${key}" — keeping first occurrence`);
    } else {
      table.set(key, row);
      count++;
    }
  }

  logger.info(`Merge table loaded: ${count} rows indexed${duplicates > 0 ? `, ${duplicates} duplicates skipped` : ''}`);
  return table;
}
