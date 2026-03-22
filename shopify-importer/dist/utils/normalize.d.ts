/**
 * Normalizes a string for use as a merge join key.
 * - Strips invisible Unicode characters (BOM, zero-width spaces, non-breaking
 *   spaces, control characters) that look identical to humans but break equality.
 * - Strips leading zeros from purely numeric strings so that "04007486269538"
 *   and "4007486269538" match (common in XML feeds that pad EAN/barcode values).
 */
export declare function normalizeKey(value: string): string;
/** Returns the hex representation of each character — useful for debugging mismatches. */
export declare function toHex(value: string): string;
//# sourceMappingURL=normalize.d.ts.map