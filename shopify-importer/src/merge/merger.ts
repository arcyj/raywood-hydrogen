import { logger } from '../utils/logger.js';
import { normalizeKey, toHex } from '../utils/normalize.js';
import type { MergeConfig, SupplierRow } from '../types/index.js';

export interface MergeRowResult {
  row: SupplierRow;
  matched: boolean;
}

/**
 * Enriches a primary SupplierRow with fields from the merge lookup table.
 * Returns the enriched row and whether a match was found.
 * If no match is found, the primary row is returned unchanged with matched=false.
 */
export function mergeRow(
  primaryRow: SupplierRow,
  table: Map<string, SupplierRow>,
  config: MergeConfig,
): MergeRowResult {
  const rawKey = primaryRow[config.joinOn.primary] ?? '';
  const lookupKey = normalizeKey(rawKey);

  if (!lookupKey) {
    logger.debug(`Merge: primary join field "${config.joinOn.primary}" is empty, skipping merge`);
    return { row: primaryRow, matched: false };
  }

  const secondaryRow = table.get(lookupKey);

  if (!secondaryRow) {
    logger.debug(
      `Merge: no match for ${config.joinOn.primary}="${rawKey}" ` +
      `(normalized: "${lookupKey}", hex: ${toHex(rawKey)})`,
    );
    return { row: primaryRow, matched: false };
  }

  const enriched: SupplierRow = { ...primaryRow };
  for (const [targetField, sourceField] of Object.entries(config.fields)) {
    const value = secondaryRow[sourceField];
    if (value !== undefined && value !== '') {
      enriched[targetField] = value;
    }
  }

  logger.debug(`Merge: matched ${config.joinOn.primary}="${rawKey}"`);
  return { row: enriched, matched: true };
}
