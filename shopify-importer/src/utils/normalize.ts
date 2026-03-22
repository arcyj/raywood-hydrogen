/**
 * Normalizes a string for use as a merge join key.
 * - Strips invisible Unicode characters (BOM, zero-width spaces, non-breaking
 *   spaces, control characters) that look identical to humans but break equality.
 * - Strips leading zeros from purely numeric strings so that "04007486269538"
 *   and "4007486269538" match (common in XML feeds that pad EAN/barcode values).
 */
export function normalizeKey(value: string): string {
  let result = value
    .trim()
    .toLowerCase()
    // BOM and zero-width characters
    .replace(/[\uFEFF\u200B\u200C\u200D\u200E\u200F\u2028\u2029]/g, '')
    // Non-breaking and other special spaces → regular space, then trim again
    .replace(/[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/g, ' ')
    .trim()
    // ASCII control characters (0x00–0x1F, 0x7F) and high C1 controls (0x80–0x9F)
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00-\x1F\x7F-\x9F]/g, '');

  // Strip leading zeros from purely numeric values (e.g. EAN/barcode padding).
  // Keeps a single "0" intact.
  if (/^\d+$/.test(result)) {
    result = result.replace(/^0+(?=\d)/, '');
  }

  return result;
}

/** Returns the hex representation of each character — useful for debugging mismatches. */
export function toHex(value: string): string {
  return Array.from(value)
    .map((c) => c.codePointAt(0)!.toString(16).padStart(4, '0'))
    .join(' ');
}
