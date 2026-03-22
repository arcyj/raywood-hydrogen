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
export declare function mergeRow(primaryRow: SupplierRow, table: Map<string, SupplierRow>, config: MergeConfig): MergeRowResult;
//# sourceMappingURL=merger.d.ts.map